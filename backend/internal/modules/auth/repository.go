package auth

import (
	"database/sql"
	"errors"
	"pravoai/internal/config"

	"github.com/google/uuid"
)

type Repository struct {
	db *sql.DB
}

func NewRepository() *Repository {
	return &Repository{db: config.DB}
}

func (r *Repository) CreateUser(id, email, name, hash string) error {
	_, err := r.db.Exec(`
		INSERT INTO users (id, email, name, password_hash)
		VALUES ($1,$2,$3,$4)
	`, id, email, name, hash)
	return err
}

func (r *Repository) GetUserByEmail(email string) (*User, error) {
	row := r.db.QueryRow(`
		SELECT id, password_hash, is_verified FROM users WHERE email=$1
	`, email)

	u := &User{}
	err := row.Scan(&u.ID, &u.PasswordHash, &u.IsVerified)
	if err != nil {
		return nil, errors.New("not found")
	}
	return u, nil
}

func (r *Repository) CreateVerifyToken(userID string, token string) {
	r.db.Exec(`
		INSERT INTO email_verifications (id, user_id, token)
		VALUES ($1,$2,$3)
	`, uuid.New(), userID, token)
}

func (r *Repository) VerifyEmail(token string) bool {
	res, _ := r.db.Exec(`
		UPDATE users SET is_verified=true
		WHERE id=(SELECT user_id FROM email_verifications WHERE token=$1)
	`, token)

	rows, _ := res.RowsAffected()
	return rows > 0
}
