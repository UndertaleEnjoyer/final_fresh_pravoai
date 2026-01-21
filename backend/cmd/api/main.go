package main

import (
	"database/sql"
	"log"
	"os"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"

	"pravoai/backend/internal/modules/auth"
	"pravoai/backend/internal/modules/chat"
	"pravoai/backend/internal/pkg/jwt"
)

func getDatabaseURL() string {
	if dbURL := os.Getenv("DATABASE_URL"); dbURL != "" {
		return dbURL
	}
	return "postgres://pravo:pravo@postgres:5432/pravoai?sslmode=disable"
}

func corsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}

func main() {
	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		jwtSecret = "super-secret-key-change-this-in-production"
	}
	dbURL := getDatabaseURL()
	log.Printf("Connecting to database: %s", dbURL)
	
	db, err := sql.Open("postgres", dbURL)
	if err != nil {
		log.Fatal("Failed to open database:", err)
	}
	if err := db.Ping(); err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	log.Println("Successfully connected to database")
	repo := auth.NewRepository(db)
	tokenManager := jwt.NewTokenManager(jwtSecret)
	handler := auth.NewHandler(repo, tokenManager)
	r := gin.Default()
	r.Use(corsMiddleware())
	
	// Регистрируем маршруты
	r.POST("/register", handler.Register)
	r.POST("/login", handler.Login)
	
	// Health check
	r.GET("/health", func(c *gin.Context) {
		if err := db.Ping(); err != nil {
			c.JSON(500, gin.H{"status": "error", "message": "Database connection failed"})
			return
		}
		c.JSON(200, gin.H{
			"status":   "ok",
			"service":  "pravoai-backend",
			"database": "connected",
		})
	})

	log.Println("Starting server on :8080")
	if err := r.Run(":8080"); err != nil {
		log.Fatal(err)
	}
}
