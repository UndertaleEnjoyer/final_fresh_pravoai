package password

import "golang.org/x/crypto/bcrypt"

func Hash(p string) (string, error) {
	b, err := bcrypt.GenerateFromPassword([]byte(p), 12)
	return string(b), err
}

func Compare(hash, p string) bool {
	return bcrypt.CompareFromPassword([]byte(hash), []byte(p)) == nil
}
