package main

import (
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

	"santa-fe-capacita-backend/internal/auth"
	"santa-fe-capacita-backend/internal/database"
)

type app struct {
	db            *sql.DB
	auth          *auth.Service
	allowedOrigin string
}

type apiError struct {
	Error string `json:"error"`
}

func main() {
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

	a := &app{db: db, allowedOrigin: frontendURL, auth: &auth.Service{DB: db, SessionTTL: time.Duration(sessionHours) * time.Hour, ResetTTL: time.Duration(resetMinutes) * time.Minute, FrontendURL: frontendURL, Development: development}}
	mux := http.NewServeMux()
	mux.HandleFunc("GET /api/health", a.health)
	mux.HandleFunc("POST /api/auth/register", a.register)
	mux.HandleFunc("POST /api/auth/login", a.login)
	mux.HandleFunc("POST /api/auth/logout", a.logout)
	mux.HandleFunc("GET /api/auth/me", a.me)
	mux.HandleFunc("POST /api/auth/forgot-password", a.forgotPassword)
	mux.HandleFunc("POST /api/auth/reset-password", a.resetPassword)

	srv := &http.Server{Addr: ":" + port, Handler: a.cors(mux), ReadHeaderTimeout: 5 * time.Second}
	log.Printf("API Santa Fe Capacita escuchando en http://localhost:%s", port)
	log.Fatal(srv.ListenAndServe())
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
		w.Header().Set("Access-Control-Allow-Origin", a.allowedOrigin)
		w.Header().Set("Vary", "Origin")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
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
		writeJSON(w, 500, apiError{"No se pudo iniciar sesión."})
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
	if a.auth.Development && resetURL != "" {
		out["devResetUrl"] = resetURL
		log.Printf("enlace de recuperación (desarrollo): %s", resetURL)
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
