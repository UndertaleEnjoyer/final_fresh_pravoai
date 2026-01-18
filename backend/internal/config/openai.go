package config

import "os"

var openAIKeys = []string{
	os.Getenv("OPENAI_KEY_1"),
	os.Getenv("OPENAI_KEY_2"),
	os.Getenv("OPENAI_KEY_3"),
}

var idx = 0

func GetOpenAIKey() string {
	key := openAIKeys[idx]
	idx = (idx + 1) % len(openAIKeys)
	return key
}
