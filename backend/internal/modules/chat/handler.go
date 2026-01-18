package chat

import (
	"encoding/json"
	"net/http"
)

type Handler struct {
	service *Service
}

func NewHandler() *Handler {
	return &Handler{service: NewService()}
}

type ChatRequest struct {
	Message string `json:"message"`
}

func (h *Handler) Send(w http.ResponseWriter, r *http.Request) {
	var req ChatRequest
	json.NewDecoder(r.Body).Decode(&req)

	// userID позже вытащим из JWT
	answer, _ := h.service.SendMessage("test-user", req.Message)

	json.NewEncoder(w).Encode(map[string]string{
		"answer": answer,
	})
}
