package config

import (
	"fmt"
	"net/smtp"
	"os"
)

type Mailer struct {
	host string
	port string
	user string
	pass string
}

func NewMailer() *Mailer {
	return &Mailer{
		host: os.Getenv("SMTP_HOST"),
		port: os.Getenv("SMTP_PORT"),
		user: os.Getenv("SMTP_USER"),
		pass: os.Getenv("SMTP_PASS"),
	}
}

func (m *Mailer) Send(to, subject, body string) error {
	auth := smtp.PlainAuth("", m.user, m.pass, m.host)

	msg := fmt.Sprintf(
		"From: %s\r\nTo: %s\r\nSubject: %s\r\nMIME-Version: 1.0\r\nContent-Type: text/html; charset=UTF-8\r\n\r\n%s",
		m.user, to, subject, body,
	)

	return smtp.SendMail(
		m.host+":"+m.port,
		auth,
		m.user,
		[]string{to},
		[]byte(msg),
	)
}
