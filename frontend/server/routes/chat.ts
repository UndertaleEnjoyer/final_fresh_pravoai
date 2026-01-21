import { Request, Response } from "express";
import OpenAI from "openai";
import { SYSTEM_PROMPT } from "../systemPrompt";
import { getSession, initSession, saveSession } from "../chatStore";
import { ChatMessage } from "../types/chat";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const handleChat = async (req: Request, res: Response) => {
  try {
    const { message, sessionId } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Invalid message" });
    }

    const effectiveSessionId =
      typeof sessionId === "string" ? sessionId : "default";

    let history: ChatMessage[] = getSession(effectiveSessionId);

    if (history.length === 0) {
      history = initSession(effectiveSessionId, SYSTEM_PROMPT);
    }

    history.push({ role: "user", content: message });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: history,
      temperature: 0.3,
      max_tokens: 900,
    });

    const assistantContent = completion.choices[0]?.message?.content?.trim();

    if (!assistantContent) {
      throw new Error("Empty response from OpenAI");
    }

    history.push({
      role: "assistant",
      content: assistantContent,
    });

    saveSession(effectiveSessionId, history);

    return res.json({
      response: assistantContent,
    });
  } catch (err) {
    console.error("GPT chat error:", err);
    return res.status(500).json({
      error: "Failed to generate response",
    });
  }
};
