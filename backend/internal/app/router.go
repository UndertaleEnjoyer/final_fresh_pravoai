package app

import (
	"net/http"
	"pravoai/internal/middleware"
	"pravoai/internal/modules/auth"
)

func SetupRouter() http.Handler {
	mux := http.NewServeMux()

	authHandler := auth.NewHandler()

	mux.HandleFunc("/api/auth/register", authHandler.Register)
	mux.HandleFunc("/api/auth/login", authHandler.Login)
	mux.HandleFunc("/api/auth/verify", authHandler.VerifyEmail)

	return middleware.JSONMiddleware(mux)
}
