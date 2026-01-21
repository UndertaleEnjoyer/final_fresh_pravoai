import { RequestHandler } from "express";

interface ChatRequest {
  message: string;
  user_id?: string;
}

interface ChatResponse {
  response?: string;
  error?: string;
}

export const handleChat: RequestHandler = async (req, res) => {
  const { message, user_id } = req.body as ChatRequest;

  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    // Get OpenAI API key from environment
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("OPENAI_API_KEY environment variable is not set");
      return res.status(500).json({
        error: "OpenAI API key is not configured",
      });
    }

    // Create system prompt for legal advisor context
    const systemPrompt = `Ты - опытный русский юридический консультант, специализирующийся на российском законодательстве. 
Твоя задача помогать людям с правовыми вопросами на основе Гражданского кодекса РФ и других применимых законов.

При ответе:
1. Будь точным и основывайся на действующем законодательстве
2. Используй примеры из судебной практики когда уместно
3. Указывай на необходимость обращения к профессиональному юристу при необходимости
4. Структурируй ответы понятным образом
5. Если вопрос вне твоей компетенции, скажи об этом честно`;

    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        max_tokens: 2048,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("OpenAI API error:", error);
      return res.status(response.status).json({
        error: `OpenAI API error: ${error.error?.message || "Unknown error"}`,
      });
    }

    const data = await response.json();

    if (!data.choices || data.choices.length === 0) {
      return res.status(500).json({
        error: "No response from OpenAI",
      });
    }

    const responseText = data.choices[0].message.content;
    const responsePayload: ChatResponse = {
      response: responseText,
    };

    res.json(responsePayload);
  } catch (error) {
    console.error("Chat route error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({
      error: `Server error: ${errorMessage}`,
    });
  }
};
