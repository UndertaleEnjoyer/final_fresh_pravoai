package mail

import (
	"fmt"
	"pravoai/internal/config"
)

func SendVerification(email, token string) error {
	mailer := config.NewMailer()

	link := fmt.Sprintf(
		"%s/api/auth/verify?token=%s",
		config.GetEnv("FRONTEND_URL", "http://localhost:8080"),
		token,
	)

	body := fmt.Sprintf(`
		<h2>Подтверждение аккаунта</h2>
		<p>Нажмите на ссылку:</p>
		<a href="%s">%s</a>
	`, link, link)

	return mailer.Send(email, "Подтверждение аккаунта", body)
}
