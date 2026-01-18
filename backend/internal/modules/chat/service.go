package chat

type Service struct {
	repo *Repository
}

func NewService() *Service {
	return &Service{repo: NewRepository()}
}

func (s *Service) SendMessage(userID, message string) (string, error) {
	// TODO: OpenAI call
	answer := "Ответ ИИ будет здесь"
	s.repo.SaveMessage(userID, message, answer)
	return answer, nil
}
