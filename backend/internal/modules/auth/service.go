package auth

import (
	"errors"
	"pravoai/pkg/password"

	"github.com/google/uuid"
)

var (
	ErrUserExists       = errors.New("USER_EXISTS")
	ErrInvalidCreds     = errors.New("INVALID_CREDENTIALS")
	ErrEmailNotVerified = errors.New("EMAIL_NOT_VERIFIED")
)

type Service struct {
	repo *Repository
}

func NewService() *Service {
	return &Service{repo: NewRepository()}
}

func (s *Service) Register(dto RegisterDTO) error {
	hash, _ := password.Hash(dto.Password)
	id := uuid.New().String()

	if _, err := s.repo.GetUserByEmail(dto.Email); err == nil {
		return ErrUserExists
	}

	s.repo.CreateUser(id, dto.Email, dto.Name, hash)
	s.repo.CreateVerifyToken(id, uuid.New().String())
	return nil
}

func (s *Service) Login(dto LoginDTO) (string, error) {
	u, err := s.repo.GetUserByEmail(dto.Email)
	if err != nil {
		return "", ErrInvalidCreds
	}

	if !password.Compare(u.PasswordHash, dto.Password) {
		return "", ErrInvalidCreds
	}

	if !u.IsVerified {
		return "", ErrEmailNotVerified
	}

	return u.ID, nil
}
