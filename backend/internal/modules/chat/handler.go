package chat

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// Handler handles chat-related HTTP requests
type Handler struct {
	service *Service
}

// NewHandler creates a new chat handler
func NewHandler(service *Service) *Handler {
	return &Handler{
		service: service,
	}
}

// Chat handles POST /api/chat requests
func (h *Handler) Chat(c *gin.Context) {
	var req ChatRequest
	
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ChatResponse{
			Error: "Invalid request format",
		})
		return
	}

	// Create a context with timeout
	ctx, cancel := context.WithTimeout(c.Request.Context(), 30*time.Second)
	defer cancel()

	// Process the message with OpenAI
	response, err := h.service.ProcessMessage(ctx, req.Message)
	if err != nil {
		// Log the error (you can implement proper logging later)
		c.JSON(http.StatusInternalServerError, ChatResponse{
			Error: "Failed to process message: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, ChatResponse{
		Response: response,
	})
}
