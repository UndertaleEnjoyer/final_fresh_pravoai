package chat

// ChatRequest represents the incoming chat request from the client
type ChatRequest struct {
	Message string `json:"message" binding:"required"`
	UserID  string `json:"user_id"`
}

// ChatResponse represents the response sent to the client
type ChatResponse struct {
	Response string `json:"response"`
	Error    string `json:"error,omitempty"`
}
