package chat

import (
	"context"
	"fmt"

	"github.com/openai/openai-go"
	"github.com/openai/openai-go/option"
)

// Service handles chat operations
type Service struct {
	client *openai.Client
}

// NewService creates a new chat service
func NewService(apiKey string) *Service {
	client := openai.NewClient(
		option.WithAPIKey(apiKey),
	)
	return &Service{
		client: client,
	}
}

// ProcessMessage sends a message to OpenAI and gets a response
func (s *Service) ProcessMessage(ctx context.Context, userMessage string) (string, error) {
	if userMessage == "" {
		return "", fmt.Errorf("message cannot be empty")
	}

	// Create system prompt for legal advisor context
	systemPrompt := `Ты - опытный русский юридический консультант, специализирующийся на российском законодательстве. 
Твоя задача помогать людям с правовыми вопросами на основе Гражданского кодекса РФ и других применимых законов.

При ответе:
1. Будь точным и основывайся на действующем законодательстве
2. Используй примеры из судебной практики когда уместно
3. Указывай на необходимость обращения к профессиональному юристу при необходимости
4. Структурируй ответы понятным образом
5. Если вопрос вне твоей компетенции, скажи об этом честно`

	// Call OpenAI API
	message, err := s.client.Chat.Completions.New(ctx, openai.ChatCompletionNewParams{
		Model: openai.F(openai.ChatModelGPT4oMini),
		Messages: openai.F([]openai.ChatCompletionMessageParamUnion{
			openai.SystemMessage(systemPrompt),
			openai.UserMessage(userMessage),
		}),
		MaxTokens: openai.Int(2048),
		Temperature: openai.Float(0.7),
	})

	if err != nil {
		return "", fmt.Errorf("openai api error: %w", err)
	}

	if len(message.Choices) == 0 {
		return "", fmt.Errorf("no response from OpenAI")
	}

	response := message.Choices[0].Message.Content
	return response, nil
}
