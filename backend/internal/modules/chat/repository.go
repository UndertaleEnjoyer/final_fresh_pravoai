package chat

import (
	"database/sql"
	"pravoai/internal/config"
)

type Repository struct {
	db *sql.DB
}

func NewRepository() *Repository {
	return &Repository{db: config.DB}
}

func (r *Repository) SaveMessage(userID, question, answer string) {
	r.db.Exec(`
		INSERT INTO chat_messages (user_id, question, answer)
		VALUES ($1,$2,$3)
	`, userID, question, answer)
}
