package chat

import (
	"context"
	"fmt"

	"github.com/openai/openai-go"
	"github.com/openai/openai-go/option"
)

type Service struct {
	client *openai.Client
}

func NewService(apiKey string) *Service {
	client := openai.NewClient(option.WithAPIKey(apiKey))
	return &Service{client: client}
}

func (s *Service) ProcessMessage(ctx context.Context, userMessage string) (string, error) {
	if userMessage == "" {
		return "", fmt.Errorf("message cannot be empty")
	}

	systemPrompt := `Ты - опытный русский юридический консультант...`

	resp, err := s.client.Chat.Completions.Create(ctx, openai.ChatCompletionCreateParams{
		Model: openai.ChatModelGPT4oMini,
		Messages: []openai.ChatCompletionMessage{
			{Role: openai.ChatMessageRoleSystem, Content: systemPrompt},
			{Role: openai.ChatMessageRoleUser, Content: userMessage},
		},
		MaxTokens:   2048,
		Temperature: 0.7,
	})

	if err != nil {
		return "", fmt.Errorf("openai api error: %w", err)
	}

	if len(resp.Choices) == 0 {
		return "", fmt.Errorf("no response from OpenAI")
	}

	return resp.Choices[0].Message.Content, nil
}
