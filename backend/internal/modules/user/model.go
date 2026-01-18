package user

import "time"

type User struct {
	ID           string
	Email        string
	Name         string
	PasswordHash string
	IsVerified   bool
	CreatedAt    time.Time
}
