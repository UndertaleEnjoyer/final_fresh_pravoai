package auth

import (
	"encoding/json"
	"net/http"
	"pravoai/internal/middleware"
	"pravoai/pkg/jwt"
)

type Handler struct {
	service *Service
}

func NewHandler() *Handler {
	return &Handler{service: NewService()}
}

func (h *Handler) Register(w http.ResponseWriter, r *http.Request) {
	var dto RegisterDTO
	json.NewDecoder(r.Body).Decode(&dto)

	if err := h.service.Register(dto); err != nil {
		middleware.JSONError(w, 400, err.Error(), "Ошибка регистрации")
		return
	}

	w.Write([]byte(`{"status":"ok"}`))
}

func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
	var dto LoginDTO
	json.NewDecoder(r.Body).Decode(&dto)

	userID, err := h.service.Login(dto)
	if err != nil {
		middleware.JSONError(w, 401, err.Error(), "Ошибка входа")
		return
	}

	token, _ := jwt.Generate(userID)
	json.NewEncoder(w).Encode(map[string]string{"token": token})
}

func (h *Handler) VerifyEmail(w http.ResponseWriter, r *http.Request) {
	token := r.URL.Query().Get("token")
	if !h.service.repo.VerifyEmail(token) {
		middleware.JSONError(w, 400, "INVALID_TOKEN", "Ссылка недействительна")
		return
	}
	w.Write([]byte(`{"status":"verified"}`))
}
