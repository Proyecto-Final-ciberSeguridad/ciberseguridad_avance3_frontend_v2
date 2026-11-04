package email

import (
	"crypto/tls"
	"encoding/base64"
	"fmt"
	"log"
	"net"
	"net/smtp"
	"strconv"
	"strings"
	"time"
)

type Config struct {
	Host     string
	Port     int
	User     string
	Password string
	From     string
}

type Mailer struct {
	cfg Config
}

func NewMailer(cfg Config) *Mailer {
	if cfg.Host == "" {
		cfg.Host = "localhost"
	}
	if cfg.Port <= 0 {
		cfg.Port = 1025
	}
	if cfg.From == "" {
		cfg.From = "Santa Fe Capacita <no-reply@santafe.gov.ar>"
	}
	return &Mailer{cfg: cfg}
}

func (m *Mailer) SendPasswordReset(toEmail, resetURL string) error {
	subject := "Recuperación de contraseña - Santa Fe Capacita"
	htmlBody := fmt.Sprintf(`<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<style>
  body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9f9ff; margin: 0; padding: 24px; color: #111c2d; }
  .card { max-width: 560px; margin: 0 auto; background: #ffffff; border: 1px solid #c2c6d3; border-radius: 14px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,52,110,0.06); }
  .header { background: #00346e; color: #ffffff; padding: 28px; text-align: center; }
  .header h1 { margin: 0; font-size: 24px; font-weight: 800; }
  .header p { margin: 6px 0 0; font-size: 13px; opacity: 0.9; }
  .content { padding: 32px 28px; line-height: 1.6; font-size: 15px; }
  .btn-wrap { text-align: center; margin: 30px 0; }
  .btn { display: inline-block; background: #00458f; color: #ffffff !important; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px; }
  .link-box { background: #f0f3ff; border: 1px solid #d6deea; border-radius: 8px; padding: 12px; font-size: 12px; word-break: break-all; color: #435063; margin-top: 20px; }
  .footer { padding: 18px 28px; background: #f9f9ff; border-top: 1px solid #e0e6f0; font-size: 12px; color: #59616e; text-align: center; }
</style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>Santa Fe Capacita</h1>
      <p>Capacitación y concientización en ciberseguridad</p>
    </div>
    <div class="content">
      <p>Estimado/a agente,</p>
      <p>Recibimos una solicitud para restablecer la contraseña asociada a tu correo institucional <strong>%s</strong>.</p>
      <div class="btn-wrap">
        <a class="btn" href="%s" target="_blank">Restablecer mi contraseña</a>
      </div>
      <p>Si el botón no funciona, copiá y pegá el siguiente enlace en tu navegador:</p>
      <div class="link-box">%s</div>
      <p style="margin-top: 24px; font-size: 13px; color: #59616e;">Este enlace es de un solo uso y expirará automáticamente en <strong>30 minutos</strong>.</p>
    </div>
    <div class="footer">
      Si no solicitaste este cambio, podés desestimar este mensaje con seguridad.<br>
      Gobierno de la Provincia de Santa Fe.
    </div>
  </div>
</body>
</html>`, toEmail, resetURL, resetURL)

	fromAddress := m.extractEmail(m.cfg.From)
	addr := net.JoinHostPort(m.cfg.Host, strconv.Itoa(m.cfg.Port))

	msg := strings.Builder{}
	msg.WriteString(fmt.Sprintf("From: %s\r\n", m.cfg.From))
	msg.WriteString(fmt.Sprintf("To: %s\r\n", toEmail))
	encodedSubject := base64.StdEncoding.EncodeToString([]byte(subject))
	msg.WriteString(fmt.Sprintf("Subject: =?UTF-8?B?%s?=\r\n", encodedSubject))
	msg.WriteString(fmt.Sprintf("Date: %s\r\n", time.Now().Format(time.RFC1123Z)))
	msg.WriteString("MIME-Version: 1.0\r\n")
	msg.WriteString("Content-Type: text/html; charset=UTF-8\r\n")
	msg.WriteString("Content-Transfer-Encoding: 8bit\r\n\r\n")
	msg.WriteString(htmlBody)

	// Conexión directa / SMTP
	if m.cfg.Port == 465 {
		// SMTPS directo con TLS
		tlsConfig := &tls.Config{ServerName: m.cfg.Host}
		conn, err := tls.Dial("tcp", addr, tlsConfig)
		if err != nil {
			return fmt.Errorf("tls dial %s: %w", addr, err)
		}
		defer conn.Close()
		client, err := smtp.NewClient(conn, m.cfg.Host)
		if err != nil {
			return err
		}
		defer client.Close()
		return m.sendViaClient(client, fromAddress, toEmail, []byte(msg.String()))
	}

	// Conexión estándar (port 1025, 587, 25)
	conn, err := net.DialTimeout("tcp", addr, 10*time.Second)
	if err != nil {
		return fmt.Errorf("dial %s: %w", addr, err)
	}
	defer conn.Close()

	client, err := smtp.NewClient(conn, m.cfg.Host)
	if err != nil {
		return fmt.Errorf("smtp client: %w", err)
	}
	defer client.Close()

	// Intentar STARTTLS si el servidor lo soporta y estamos en puerto estándar (ej. 587)
	if ok, _ := client.Extension("STARTTLS"); ok {
		tlsConfig := &tls.Config{ServerName: m.cfg.Host, InsecureSkipVerify: m.cfg.Host == "localhost" || m.cfg.Host == "127.0.0.1"}
		if err := client.StartTLS(tlsConfig); err != nil {
			log.Printf("[MAILER] starttls: %v", err)
		}
	}

	return m.sendViaClient(client, fromAddress, toEmail, []byte(msg.String()))
}

func (m *Mailer) sendViaClient(client *smtp.Client, from, to string, body []byte) error {
	if m.cfg.User != "" && m.cfg.Password != "" {
		auth := smtp.PlainAuth("", m.cfg.User, m.cfg.Password, m.cfg.Host)
		if err := client.Auth(auth); err != nil {
			return fmt.Errorf("smtp auth: %w", err)
		}
	}

	if err := client.Mail(from); err != nil {
		return fmt.Errorf("mail from: %w", err)
	}
	if err := client.Rcpt(to); err != nil {
		return fmt.Errorf("rcpt to: %w", err)
	}
	w, err := client.Data()
	if err != nil {
		return fmt.Errorf("data writer: %w", err)
	}
	if _, err := w.Write(body); err != nil {
		return fmt.Errorf("write body: %w", err)
	}
	if err := w.Close(); err != nil {
		return fmt.Errorf("close writer: %w", err)
	}
	return client.Quit()
}

func (m *Mailer) extractEmail(from string) string {
	if start := strings.Index(from, "<"); start != -1 {
		if end := strings.Index(from[start:], ">"); end != -1 {
			return strings.TrimSpace(from[start+1 : start+end])
		}
	}
	return strings.TrimSpace(from)
}
