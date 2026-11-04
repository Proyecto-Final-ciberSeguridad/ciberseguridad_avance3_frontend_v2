package main

import (
	"bufio"
	"bytes"
	"database/sql"
	"encoding/json"
	"errors"
	"io"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/jung-kurt/gofpdf"

	"santa-fe-capacita-backend/internal/auth"
	"santa-fe-capacita-backend/internal/database"
	"santa-fe-capacita-backend/internal/email"
)

type app struct {
	db            *sql.DB
	auth          *auth.Service
	mailer        *email.Mailer
	allowedOrigin string
}

type apiError struct {
	Error string `json:"error"`
}

func main() {
	loadEnvFile(".env", "backend/.env")
	databaseURL := env("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/santa_fe_capacita?sslmode=disable")
	frontendURL := env("FRONTEND_URL", "http://localhost:5173")
	port := env("PORT", "8080")
	sessionHours := envInt("SESSION_TTL_HOURS", 12)
	resetMinutes := envInt("RESET_TTL_MINUTES", 30)
	development := env("APP_ENV", "development") == "development"

	db, err := database.Open(databaseURL)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	smtpHost := env("SMTP_HOST", "localhost")
	smtpPort := envInt("SMTP_PORT", 1025)
	smtpUser := os.Getenv("SMTP_USER")
	smtpPass := os.Getenv("SMTP_PASS")
	smtpFrom := env("SMTP_FROM", "Santa Fe Capacita <no-reply@santafe.gov.ar>")

	mailer := email.NewMailer(email.Config{
		Host:     smtpHost,
		Port:     smtpPort,
		User:     smtpUser,
		Password: smtpPass,
		From:     smtpFrom,
	})

	a := &app{
		db:            db,
		allowedOrigin: frontendURL,
		mailer:        mailer,
		auth: &auth.Service{
			DB:          db,
			SessionTTL:  time.Duration(sessionHours) * time.Hour,
			ResetTTL:    time.Duration(resetMinutes) * time.Minute,
			FrontendURL: frontendURL,
			Development: development,
		},
	}
	mux := http.NewServeMux()
	mux.HandleFunc("GET /api/health", a.health)
	mux.HandleFunc("POST /api/auth/register", a.register)
	mux.HandleFunc("POST /api/auth/login", a.login)
	mux.HandleFunc("POST /api/auth/logout", a.logout)
	mux.HandleFunc("GET /api/auth/me", a.me)
	mux.HandleFunc("POST /api/auth/forgot-password", a.forgotPassword)
	mux.HandleFunc("POST /api/auth/reset-password", a.resetPassword)
	mux.HandleFunc("GET /api/progress", a.getProgress)
	mux.HandleFunc("GET /api/training-summary", a.trainingSummary)
	mux.HandleFunc("PUT /api/progress/{module}/{resource}", a.putProgress)
	mux.HandleFunc("POST /api/evaluations/{module}", a.saveEvaluation)
	mux.HandleFunc("GET /api/certificate/status", a.certificateStatus)
	mux.HandleFunc("GET /api/certificate/pdf", a.certificatePDF)

	srv := &http.Server{Addr: ":" + port, Handler: a.cors(mux), ReadHeaderTimeout: 5 * time.Second}
	log.Printf("API Santa Fe Capacita escuchando en http://localhost:%s", port)
	log.Fatal(srv.ListenAndServe())
}

func loadEnvFile(paths ...string) {
	for _, p := range paths {
		f, err := os.Open(p)
		if err != nil {
			continue
		}
		scanner := bufio.NewScanner(f)
		for scanner.Scan() {
			line := strings.TrimSpace(scanner.Text())
			if line == "" || strings.HasPrefix(line, "#") {
				continue
			}
			parts := strings.SplitN(line, "=", 2)
			if len(parts) == 2 {
				k := strings.TrimSpace(parts[0])
				v := strings.Trim(strings.TrimSpace(parts[1]), `"'`)
				if os.Getenv(k) == "" {
					os.Setenv(k, v)
				}
			}
		}
		f.Close()
	}
}

func env(k, d string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}
	return d
}
func envInt(k string, d int) int {
	v := os.Getenv(k)
	if v == "" {
		return d
	}
	n, err := strconv.Atoi(v)
	if err != nil {
		return d
	}
	return n
}
func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}
func decodeJSON(r *http.Request, v any) error {
	dec := json.NewDecoder(io.LimitReader(r.Body, 1<<20))
	dec.DisallowUnknownFields()
	return dec.Decode(v)
}

func (a *app) cors(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		log.Printf("[HTTP] %s %s (Origin: %s, Remote: %s)", r.Method, r.URL.Path, origin, r.RemoteAddr)
		if a.auth.Development && origin != "" {
			w.Header().Set("Access-Control-Allow-Origin", origin)
		} else {
			w.Header().Set("Access-Control-Allow-Origin", a.allowedOrigin)
		}
		w.Header().Set("Vary", "Origin")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func (a *app) health(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, 200, map[string]string{"status": "ok"})
}

func (a *app) register(w http.ResponseWriter, r *http.Request) {
	var in struct{ FullName, DNI, Email, Password string }
	if err := decodeJSON(r, &in); err != nil {
		writeJSON(w, 400, apiError{"Solicitud inválida."})
		return
	}
	in.Email = strings.ToLower(strings.TrimSpace(in.Email))
	if strings.TrimSpace(in.FullName) == "" || !digitsBetween(in.DNI, 7, 9) || !strings.HasSuffix(in.Email, "@santafe.gov.ar") || len(in.Password) < 8 {
		writeJSON(w, 400, apiError{"Revisá los datos ingresados. La contraseña debe tener al menos 8 caracteres."})
		return
	}
	user, err := a.auth.Register(r.Context(), in.FullName, in.DNI, in.Email, in.Password)
	if errors.Is(err, auth.ErrEmailExists) {
		writeJSON(w, 409, apiError{err.Error()})
		return
	}
	if err != nil {
		log.Printf("register: %v", err)
		writeJSON(w, 500, apiError{"No se pudo crear la cuenta."})
		return
	}
	writeJSON(w, 201, map[string]any{"user": user})
}

func (a *app) login(w http.ResponseWriter, r *http.Request) {
	var in struct{ Email, Password string }
	if err := decodeJSON(r, &in); err != nil {
		writeJSON(w, 400, apiError{"Solicitud inválida."})
		return
	}
	user, token, err := a.auth.Login(r.Context(), in.Email, in.Password)
	if errors.Is(err, auth.ErrInvalidCredentials) {
		writeJSON(w, 401, apiError{"Correo o contraseña incorrectos."})
		return
	}
	if err != nil {
		log.Printf("login: %v", err)
		writeJSON(w, 503, apiError{"El servicio de acceso no está disponible temporalmente. Intentá nuevamente."})
		return
	}
	writeJSON(w, 200, map[string]any{"token": token, "user": user})
}

func bearer(r *http.Request) string {
	h := strings.TrimSpace(r.Header.Get("Authorization"))
	if !strings.HasPrefix(h, "Bearer ") {
		return ""
	}
	return strings.TrimSpace(strings.TrimPrefix(h, "Bearer "))
}
func (a *app) me(w http.ResponseWriter, r *http.Request) {
	token := bearer(r)
	if token == "" {
		writeJSON(w, 401, apiError{"Sesión no válida."})
		return
	}
	user, err := a.auth.UserBySession(r.Context(), token)
	if err != nil {
		writeJSON(w, 401, apiError{"Sesión no válida o vencida."})
		return
	}
	writeJSON(w, 200, map[string]any{"user": user})
}
func (a *app) logout(w http.ResponseWriter, r *http.Request) {
	token := bearer(r)
	if token != "" {
		_ = a.auth.Logout(r.Context(), token)
	}
	writeJSON(w, 200, map[string]bool{"ok": true})
}

func (a *app) forgotPassword(w http.ResponseWriter, r *http.Request) {
	var in struct{ Email string }
	if err := decodeJSON(r, &in); err != nil {
		writeJSON(w, 400, apiError{"Solicitud inválida."})
		return
	}
	resetURL, err := a.auth.RequestPasswordReset(r.Context(), in.Email)
	if err != nil {
		log.Printf("forgot password: %v", err)
		writeJSON(w, 500, apiError{"No se pudo procesar la recuperación."})
		return
	}
	out := map[string]any{"message": "Si existe una cuenta asociada al correo ingresado, recibirás las instrucciones para restablecer tu contraseña."}
	if resetURL != "" {
		finalResetURL := resetURL
		if origin := strings.TrimRight(r.Header.Get("Origin"), "/"); origin != "" {
			frontendBase := strings.TrimRight(a.auth.FrontendURL, "/")
			if strings.HasPrefix(finalResetURL, frontendBase) {
				finalResetURL = origin + strings.TrimPrefix(finalResetURL, frontendBase)
			}
		}

		// Enviar correo transaccional vía SMTP (en goroutine para respuesta inmediata)
		go func(dest, url string) {
			if err := a.mailer.SendPasswordReset(dest, url); err != nil {
				log.Printf("[MAILER] error enviando correo a %s: %v", dest, err)
			} else {
				log.Printf("[MAILER] correo de recuperación enviado exitosamente a %s", dest)
			}
		}(in.Email, finalResetURL)

		if a.auth.Development {
			out["devResetUrl"] = finalResetURL
			log.Printf("enlace de recuperación (desarrollo): %s", finalResetURL)
		}
	}
	writeJSON(w, 200, out)
}

func (a *app) resetPassword(w http.ResponseWriter, r *http.Request) {
	var in struct{ Token, NewPassword string }
	if err := decodeJSON(r, &in); err != nil {
		writeJSON(w, 400, apiError{"Solicitud inválida."})
		return
	}
	if len(in.NewPassword) < 8 {
		writeJSON(w, 400, apiError{"La nueva contraseña debe tener al menos 8 caracteres."})
		return
	}
	err := a.auth.ResetPassword(r.Context(), strings.TrimSpace(in.Token), in.NewPassword)
	if errors.Is(err, auth.ErrInvalidResetToken) {
		writeJSON(w, 400, apiError{err.Error()})
		return
	}
	if err != nil {
		log.Printf("reset password: %v", err)
		writeJSON(w, 500, apiError{"No se pudo actualizar la contraseña."})
		return
	}
	writeJSON(w, 200, map[string]bool{"ok": true})
}

func digitsBetween(v string, min, max int) bool {
	v = strings.TrimSpace(v)
	if len(v) < min || len(v) > max {
		return false
	}
	for _, r := range v {
		if r < '0' || r > '9' {
			return false
		}
	}
	return true
}

func (a *app) authenticatedUser(r *http.Request) (auth.User, error) {
	token := bearer(r)
	if token == "" {
		return auth.User{}, auth.ErrInvalidCredentials
	}
	return a.auth.UserBySession(r.Context(), token)
}

func (a *app) getProgress(w http.ResponseWriter, r *http.Request) {
	user, err := a.authenticatedUser(r)
	if err != nil {
		writeJSON(w, 401, apiError{"Sesión no válida o vencida."})
		return
	}
	rows, err := a.db.QueryContext(r.Context(), `SELECT module_id, resource_key, completed FROM training_progress WHERE user_id=$1`, user.ID)
	if err != nil {
		log.Printf("get progress: %v", err)
		writeJSON(w, 500, apiError{"No se pudo consultar el progreso."})
		return
	}
	defer rows.Close()
	progress := map[string]map[string]bool{}
	for rows.Next() {
		var moduleID int
		var key string
		var completed bool
		if err := rows.Scan(&moduleID, &key, &completed); err != nil {
			writeJSON(w, 500, apiError{"No se pudo consultar el progreso."})
			return
		}
		m := strconv.Itoa(moduleID)
		if progress[m] == nil {
			progress[m] = map[string]bool{}
		}
		progress[m][key] = completed
	}
	writeJSON(w, 200, map[string]any{"progress": progress})
}

func (a *app) putProgress(w http.ResponseWriter, r *http.Request) {
	user, err := a.authenticatedUser(r)
	if err != nil {
		writeJSON(w, 401, apiError{"Sesión no válida o vencida."})
		return
	}
	moduleID, err := strconv.Atoi(r.PathValue("module"))
	resource := strings.TrimSpace(r.PathValue("resource"))
	if err != nil || moduleID < 1 || moduleID > 4 || resource == "" || len(resource) > 80 {
		writeJSON(w, 400, apiError{"Recurso inválido."})
		return
	}
	var in struct {
		Completed bool `json:"completed"`
	}
	if err := decodeJSON(r, &in); err != nil {
		writeJSON(w, 400, apiError{"Solicitud inválida."})
		return
	}
	_, err = a.db.ExecContext(r.Context(), `
		INSERT INTO training_progress(user_id,module_id,resource_key,completed,completed_at,updated_at)
		VALUES($1,$2,$3,$4,CASE WHEN $4 THEN NOW() ELSE NULL END,NOW())
		ON CONFLICT(user_id,module_id,resource_key)
		DO UPDATE SET completed=EXCLUDED.completed,
		completed_at=CASE WHEN EXCLUDED.completed THEN COALESCE(training_progress.completed_at,NOW()) ELSE NULL END,
		updated_at=NOW()`, user.ID, moduleID, resource, in.Completed)
	if err != nil {
		log.Printf("put progress: %v", err)
		writeJSON(w, 500, apiError{"No se pudo guardar el progreso."})
		return
	}
	writeJSON(w, 200, map[string]bool{"ok": true})
}

func (a *app) saveEvaluation(w http.ResponseWriter, r *http.Request) {
	user, err := a.authenticatedUser(r)
	if err != nil {
		writeJSON(w, 401, apiError{"Sesión no válida o vencida."})
		return
	}
	moduleID, err := strconv.Atoi(r.PathValue("module"))
	if err != nil || moduleID < 1 || moduleID > 4 {
		writeJSON(w, 400, apiError{"Módulo inválido."})
		return
	}
	var in struct {
		Score   int             `json:"score"`
		Total   int             `json:"total"`
		Answers json.RawMessage `json:"answers"`
	}
	if err := decodeJSON(r, &in); err != nil || in.Score < 0 || in.Total <= 0 || in.Score > in.Total {
		writeJSON(w, 400, apiError{"Resultado de evaluación inválido."})
		return
	}
	if len(in.Answers) == 0 {
		in.Answers = json.RawMessage(`[]`)
	}
	if _, err := a.db.ExecContext(r.Context(), `INSERT INTO evaluation_results(user_id,module_id,score,total,answers) VALUES($1,$2,$3,$4,$5::jsonb)`, user.ID, moduleID, in.Score, in.Total, string(in.Answers)); err != nil {
		log.Printf("save evaluation: %v", err)
		writeJSON(w, 500, apiError{"No se pudo guardar el resultado."})
		return
	}
	writeJSON(w, 201, map[string]bool{"ok": true})
}

func (a *app) trainingSummary(w http.ResponseWriter, r *http.Request) {
	user, err := a.authenticatedUser(r)
	if err != nil {
		writeJSON(w, 401, apiError{"Sesión no válida o vencida."})
		return
	}

	evaluations := map[string]any{}
	rows, err := a.db.QueryContext(r.Context(), `
		SELECT DISTINCT ON (module_id) module_id, score, total, created_at
		FROM evaluation_results
		WHERE user_id=$1
		ORDER BY module_id, created_at DESC`, user.ID)
	if err != nil {
		log.Printf("training summary evaluations: %v", err)
		writeJSON(w, 500, apiError{"No se pudo consultar el resumen de capacitación."})
		return
	}
	defer rows.Close()

	var lastActivity time.Time
	for rows.Next() {
		var moduleID, score, total int
		var createdAt time.Time
		if err := rows.Scan(&moduleID, &score, &total, &createdAt); err != nil {
			writeJSON(w, 500, apiError{"No se pudo consultar el resumen de capacitación."})
			return
		}
		evaluations[strconv.Itoa(moduleID)] = map[string]any{
			"score": score, "total": total, "createdAt": createdAt,
		}
		if createdAt.After(lastActivity) {
			lastActivity = createdAt
		}
	}

	var progressActivity sql.NullTime
	if err := a.db.QueryRowContext(r.Context(), `SELECT MAX(updated_at) FROM training_progress WHERE user_id=$1`, user.ID).Scan(&progressActivity); err != nil {
		log.Printf("training summary progress activity: %v", err)
	}
	if progressActivity.Valid && progressActivity.Time.After(lastActivity) {
		lastActivity = progressActivity.Time
	}

	out := map[string]any{"evaluations": evaluations, "lastActivity": nil}
	if !lastActivity.IsZero() {
		out["lastActivity"] = lastActivity
	}
	writeJSON(w, 200, out)
}

type certificateModuleStatus struct {
	ID                 int    `json:"id"`
	Title              string `json:"title"`
	Completed          bool   `json:"completed"`
	CompletedResources int    `json:"completedResources"`
	TotalResources     int    `json:"totalResources"`
}

type certificateState struct {
	Available        bool                      `json:"available"`
	CompletedModules int                       `json:"completedModules"`
	CompletionDate   *time.Time                `json:"completionDate"`
	Modules          []certificateModuleStatus `json:"modules"`
}

var certificateRequirements = []struct {
	ID        int
	Title     string
	Resources []string
}{
	{1, "Introducción a la Seguridad Digital", []string{"teoria", "video", "actividad", "evaluacion"}},
	{2, "Identificación de Riesgos", []string{"teoria-2a", "teoria-2b", "teoria-2c", "teoria-2d", "teoria-2e", "teoria-2f", "video", "actividad", "evaluacion"}},
	{3, "Detección y respuesta ante incidentes", []string{"teoria", "video", "actividad", "evaluacion"}},
	{4, "Cierre y Verificación", []string{"teoria", "video", "actividad", "evaluacion"}},
}

func (a *app) certificateStateForUser(r *http.Request, user auth.User) (certificateState, error) {
	rows, err := a.db.QueryContext(r.Context(), `
		SELECT module_id, resource_key, completed, completed_at
		FROM training_progress
		WHERE user_id=$1`, user.ID)
	if err != nil {
		return certificateState{}, err
	}
	defer rows.Close()

	type item struct {
		completed bool
		at        sql.NullTime
	}
	progress := map[int]map[string]item{}
	for rows.Next() {
		var moduleID int
		var key string
		var completed bool
		var at sql.NullTime
		if err := rows.Scan(&moduleID, &key, &completed, &at); err != nil {
			return certificateState{}, err
		}
		if progress[moduleID] == nil {
			progress[moduleID] = map[string]item{}
		}
		progress[moduleID][key] = item{completed: completed, at: at}
	}
	if err := rows.Err(); err != nil {
		return certificateState{}, err
	}

	state := certificateState{Modules: make([]certificateModuleStatus, 0, 4)}
	var latest time.Time
	for _, req := range certificateRequirements {
		completedCount := 0
		moduleComplete := true
		for _, key := range req.Resources {
			it, ok := progress[req.ID][key]
			if ok && it.completed {
				completedCount++
				if it.at.Valid && it.at.Time.After(latest) {
					latest = it.at.Time
				}
			} else {
				moduleComplete = false
			}
		}
		if moduleComplete {
			state.CompletedModules++
		}
		state.Modules = append(state.Modules, certificateModuleStatus{
			ID: req.ID, Title: req.Title, Completed: moduleComplete,
			CompletedResources: completedCount, TotalResources: len(req.Resources),
		})
	}
	state.Available = state.CompletedModules == 4
	if state.Available && !latest.IsZero() {
		completion := latest
		state.CompletionDate = &completion
	}
	return state, nil
}

func (a *app) certificateStatus(w http.ResponseWriter, r *http.Request) {
	user, err := a.authenticatedUser(r)
	if err != nil {
		writeJSON(w, 401, apiError{"Sesión no válida o vencida."})
		return
	}
	state, err := a.certificateStateForUser(r, user)
	if err != nil {
		log.Printf("certificate status: %v", err)
		writeJSON(w, 500, apiError{"No se pudo consultar el estado del certificado."})
		return
	}
	writeJSON(w, 200, state)
}

func (a *app) certificatePDF(w http.ResponseWriter, r *http.Request) {
	user, err := a.authenticatedUser(r)
	if err != nil {
		writeJSON(w, 401, apiError{"Sesión no válida o vencida."})
		return
	}
	state, err := a.certificateStateForUser(r, user)
	if err != nil {
		log.Printf("certificate pdf status: %v", err)
		writeJSON(w, 500, apiError{"No se pudo verificar el progreso de la capacitación."})
		return
	}
	if !state.Available || state.CompletionDate == nil {
		writeJSON(w, 403, apiError{"El certificado todavía no está disponible. Completá los cuatro módulos para habilitarlo."})
		return
	}

	pdf := gofpdf.New("L", "mm", "A4", "")
	pdf.SetMargins(20, 18, 20)
	pdf.SetAutoPageBreak(false, 0)
	pdf.AddPage()
	tr := pdf.UnicodeTranslatorFromDescriptor("")

	pdf.SetDrawColor(0, 74, 152)
	pdf.SetLineWidth(1.0)
	pdf.Rect(12, 12, 273, 186, "D")
	pdf.SetLineWidth(0.3)
	pdf.SetDrawColor(176, 192, 211)
	pdf.Rect(16, 16, 265, 178, "D")

	pdf.SetTextColor(0, 52, 110)
	pdf.SetFont("Helvetica", "B", 18)
	pdf.CellFormat(0, 12, tr("Santa Fe Capacita"), "", 1, "C", false, 0, "")
	pdf.SetFont("Helvetica", "", 10)
	pdf.SetTextColor(75, 86, 102)
	pdf.CellFormat(0, 6, tr("Capacitación de ciberseguridad"), "", 1, "C", false, 0, "")

	pdf.Ln(8)
	pdf.SetTextColor(0, 52, 110)
	pdf.SetFont("Helvetica", "B", 28)
	pdf.CellFormat(0, 16, tr("Certificado de finalización"), "", 1, "C", false, 0, "")
	pdf.Ln(4)

	pdf.SetFont("Helvetica", "", 12)
	pdf.SetTextColor(80, 90, 105)
	pdf.CellFormat(0, 8, tr("Se deja constancia de que"), "", 1, "C", false, 0, "")
	pdf.SetFont("Helvetica", "B", 23)
	pdf.SetTextColor(16, 47, 85)
	pdf.CellFormat(0, 13, tr(user.FullName), "", 1, "C", false, 0, "")
	pdf.SetFont("Helvetica", "", 11)
	pdf.SetTextColor(80, 90, 105)
	pdf.CellFormat(0, 7, tr("DNI "+user.DNI), "", 1, "C", false, 0, "")

	pdf.Ln(6)
	pdf.SetFont("Helvetica", "", 12)
	pdf.CellFormat(0, 8, tr("ha completado la"), "", 1, "C", false, 0, "")
	pdf.SetFont("Helvetica", "B", 16)
	pdf.SetTextColor(0, 52, 110)
	pdf.MultiCell(0, 8, tr("Capacitación de ciberseguridad para empleados públicos de Santa Fe"), "", "C", false)

	pdf.Ln(6)
	pdf.SetFont("Helvetica", "", 9)
	pdf.SetTextColor(75, 86, 102)
	pdf.MultiCell(0, 6, tr("Módulos completados: Introducción a la Seguridad Digital · Identificación de Riesgos · Detección y respuesta ante incidentes · Cierre y Verificación"), "", "C", false)

	pdf.Ln(10)
	pdf.SetFont("Helvetica", "", 10)
	pdf.SetTextColor(80, 90, 105)
	pdf.CellFormat(0, 6, tr("Fecha de finalización"), "", 1, "C", false, 0, "")
	pdf.SetFont("Helvetica", "B", 12)
	pdf.SetTextColor(30, 45, 65)
	pdf.CellFormat(0, 8, state.CompletionDate.In(time.Local).Format("02/01/2006"), "", 1, "C", false, 0, "")

	pdf.SetY(184)
	pdf.SetFont("Helvetica", "", 8)
	pdf.SetTextColor(105, 113, 125)
	pdf.CellFormat(0, 5, tr("Certificado de finalización generado por la plataforma Santa Fe Capacita."), "", 0, "C", false, 0, "")

	var buf bytes.Buffer
	if err := pdf.Output(&buf); err != nil {
		log.Printf("generate certificate pdf: %v", err)
		writeJSON(w, 500, apiError{"No se pudo generar el certificado en PDF."})
		return
	}
	filename := "certificado-santa-fe-capacita.pdf"
	w.Header().Set("Content-Type", "application/pdf")
	w.Header().Set("Content-Disposition", `attachment; filename="`+filename+`"`)
	w.Header().Set("Content-Length", strconv.Itoa(buf.Len()))
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write(buf.Bytes())
}
