import { ChatMessage } from "./types/chat";

const chatSessions = new Map<string, ChatMessage[]>();

export const getSession = (sessionId: string): ChatMessage[] => {
  return chatSessions.get(sessionId) || [];
};

export const initSession = (
  sessionId: string,
  systemPrompt: string,
): ChatMessage[] => {
  const session: ChatMessage[] = [{ role: "system", content: systemPrompt }];
  chatSessions.set(sessionId, session);
  return session;
};

export const saveSession = (sessionId: string, messages: ChatMessage[]) => {
  chatSessions.set(sessionId, messages);
};
