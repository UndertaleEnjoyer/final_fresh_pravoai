package chat

import (
	"context"
	"fmt"

	"github.com/openai/openai-go"
	"github.com/openai/openai-go/option"
)

type Service struct {
	client openai.Client
}

func NewService(apiKey string) *Service {
	client := openai.NewClient(
		option.WithAPIKey(apiKey),
	)

	return &Service{
		client: client,
	}
}

func (s *Service) ProcessMessage(ctx context.Context, userMessage string) (string, error) {
	if userMessage == "" {
		return "", fmt.Errorf("message cannot be empty")
	}

	systemPrompt := `Ты - опытный русский юридический консультант...`

	message, err := s.client.Chat.Completions.New(ctx, openai.ChatCompletionNewParams{
		Model: openai.F(openai.ChatModelGPT4oMini),
		Messages: openai.F([]openai.ChatCompletionMessageParamUnion{
			openai.SystemMessage(systemPrompt),
			openai.UserMessage(userMessage),
		}),
		MaxTokens:   openai.Int(2048),
		Temperature: openai.Float(0.7),
	})

	if err != nil {
		return "", fmt.Errorf("openai api error: %w", err)
	}

	if len(message.Choices) == 0 {
		return "", fmt.Errorf("no response from OpenAI")
	}

	return message.Choices[0].Message.Content, nil
}
