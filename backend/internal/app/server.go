package app

import (
	"log"
	"net/http"
	"os"
)

func Run() {
	r := SetupRouter()

	port := os.Getenv("APP_PORT")
	if port == "" {
		port = "8080"
	}

	log.Println("🚀 Server started on :" + port)
	log.Fatal(http.ListenAndServe(":"+port, r))
}
