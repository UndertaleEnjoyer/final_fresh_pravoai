package auth

type RegisterDTO struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	Name     string `json:"name"`
}

type LoginDTO struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}
