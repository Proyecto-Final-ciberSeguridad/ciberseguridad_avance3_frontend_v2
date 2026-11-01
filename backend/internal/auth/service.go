package auth

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"database/sql"
	"encoding/hex"
	"errors"
	"fmt"
	"strings"
	"time"

	"golang.org/x/crypto/bcrypt"
)

var (
	ErrInvalidCredentials = errors.New("correo o contraseña incorrectos")
	ErrEmailExists        = errors.New("ese correo institucional ya se encuentra registrado")
	ErrInvalidResetToken  = errors.New("el enlace de recuperación es inválido o venció")
)

type User struct {
	ID       string `json:"id"`
	FullName string `json:"fullName"`
	DNI      string `json:"dni"`
	Email    string `json:"email"`
}

type Service struct {
	DB          *sql.DB
	SessionTTL  time.Duration
	ResetTTL    time.Duration
	FrontendURL string
	Development bool
}

func normalizeEmail(email string) string { return strings.ToLower(strings.TrimSpace(email)) }

func newToken(bytes int) (raw, hash string, err error) {
	b := make([]byte, bytes)
	if _, err = rand.Read(b); err != nil {
		return "", "", err
	}
	raw = hex.EncodeToString(b)
	digest := sha256.Sum256([]byte(raw))
	hash = hex.EncodeToString(digest[:])
	return raw, hash, nil
}

func newID() (string, error) {
	b := make([]byte, 16)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}

func (s *Service) Register(ctx context.Context, fullName, dni, email, password string) (User, error) {
	email = normalizeEmail(email)
	var exists bool
	if err := s.DB.QueryRowContext(ctx, `SELECT EXISTS(SELECT 1 FROM users WHERE email=$1)`, email).Scan(&exists); err != nil {
		return User{}, err
	}
	if exists {
		return User{}, ErrEmailExists
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return User{}, err
	}
	id, err := newID()
	if err != nil {
		return User{}, err
	}

	user := User{ID: id, FullName: strings.TrimSpace(fullName), DNI: strings.TrimSpace(dni), Email: email}
	_, err = s.DB.ExecContext(ctx, `INSERT INTO users (id, full_name, dni, email, password_hash) VALUES ($1,$2,$3,$4,$5)`, user.ID, user.FullName, user.DNI, user.Email, string(hash))
	return user, err
}

func (s *Service) Login(ctx context.Context, email, password string) (User, string, error) {
	email = normalizeEmail(email)
	var user User
	var passwordHash string
	err := s.DB.QueryRowContext(ctx, `SELECT id, full_name, dni, email, password_hash FROM users WHERE email=$1`, email).Scan(&user.ID, &user.FullName, &user.DNI, &user.Email, &passwordHash)
	if errors.Is(err, sql.ErrNoRows) {
		return User{}, "", ErrInvalidCredentials
	}
	if err != nil {
		return User{}, "", err
	}
	if bcrypt.CompareHashAndPassword([]byte(passwordHash), []byte(password)) != nil {
		return User{}, "", ErrInvalidCredentials
	}

	raw, hash, err := newToken(32)
	if err != nil {
		return User{}, "", err
	}
	expires := time.Now().Add(s.SessionTTL)
	_, err = s.DB.ExecContext(ctx, `INSERT INTO sessions (user_id, token_hash, expires_at) VALUES ($1,$2,$3)`, user.ID, hash, expires)
	return user, raw, err
}

func (s *Service) UserBySession(ctx context.Context, rawToken string) (User, error) {
	digest := sha256.Sum256([]byte(rawToken))
	hash := hex.EncodeToString(digest[:])
	var u User
	err := s.DB.QueryRowContext(ctx, `SELECT u.id,u.full_name,u.dni,u.email FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=$1 AND s.expires_at>NOW()`, hash).Scan(&u.ID, &u.FullName, &u.DNI, &u.Email)
	if errors.Is(err, sql.ErrNoRows) {
		return User{}, ErrInvalidCredentials
	}
	return u, err
}

func (s *Service) Logout(ctx context.Context, rawToken string) error {
	digest := sha256.Sum256([]byte(rawToken))
	_, err := s.DB.ExecContext(ctx, `DELETE FROM sessions WHERE token_hash=$1`, hex.EncodeToString(digest[:]))
	return err
}

func (s *Service) RequestPasswordReset(ctx context.Context, email string) (string, error) {
	email = normalizeEmail(email)
	var userID string
	err := s.DB.QueryRowContext(ctx, `SELECT id FROM users WHERE email=$1`, email).Scan(&userID)
	if errors.Is(err, sql.ErrNoRows) {
		return "", nil
	}
	if err != nil {
		return "", err
	}

	_, _ = s.DB.ExecContext(ctx, `UPDATE password_reset_tokens SET used_at=NOW() WHERE user_id=$1 AND used_at IS NULL`, userID)
	raw, hash, err := newToken(32)
	if err != nil {
		return "", err
	}
	expires := time.Now().Add(s.ResetTTL)
	if _, err = s.DB.ExecContext(ctx, `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1,$2,$3)`, userID, hash, expires); err != nil {
		return "", err
	}
	return fmt.Sprintf("%s/restablecer-contrasena?token=%s", strings.TrimRight(s.FrontendURL, "/"), raw), nil
}

func (s *Service) ResetPassword(ctx context.Context, rawToken, newPassword string) error {
	digest := sha256.Sum256([]byte(rawToken))
	hash := hex.EncodeToString(digest[:])

	tx, err := s.DB.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	var tokenID int64
	var userID string
	err = tx.QueryRowContext(ctx, `SELECT id,user_id FROM password_reset_tokens WHERE token_hash=$1 AND used_at IS NULL AND expires_at>NOW() FOR UPDATE`, hash).Scan(&tokenID, &userID)
	if errors.Is(err, sql.ErrNoRows) {
		return ErrInvalidResetToken
	}
	if err != nil {
		return err
	}

	passwordHash, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	if _, err = tx.ExecContext(ctx, `UPDATE users SET password_hash=$1, updated_at=NOW() WHERE id=$2`, string(passwordHash), userID); err != nil {
		return err
	}
	if _, err = tx.ExecContext(ctx, `UPDATE password_reset_tokens SET used_at=NOW() WHERE id=$1`, tokenID); err != nil {
		return err
	}
	if _, err = tx.ExecContext(ctx, `DELETE FROM sessions WHERE user_id=$1`, userID); err != nil {
		return err
	}
	return tx.Commit()
}
