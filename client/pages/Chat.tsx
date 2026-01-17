import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Send } from "lucide-react";
import { ChatSidebar } from "@/components/ChatSidebar";

export default function Chat() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([
    {
      role: "assistant",
      content: "Добро пожаловать в LegalAI! 👋 Я ваш персональный юридический консультант на основе ИИ. Как я могу вам помочь? Задайте любой юридический вопрос, и я предоставлю вам профессиональную консультацию.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/auth");
      return;
    }
    setUser(JSON.parse(userData));
  }, [navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleNewChat = () => {
    setMessages([
      {
        role: "assistant",
        content: "Добро пожаловать в LegalAI! 👋 Я ваш персональный юридический консультант на основе ИИ. Как я могу вам помочь? Задайте любой юридический вопрос, и я предоставлю вам профессиональную консультацию.",
      },
    ]);
    setInput("");
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setInput("");
    setLoading(true);

    setTimeout(() => {
      const responses = [
        "Отличный вопрос! В соответствии с действующим законодательством...",
        "Это важный момент для вашей ситуации. Рекомендую рассмотреть следующие варианты...",
        "Согласно судебной практике, в подобных случаях...",
        "Пожалуйста, уточните детали. Это поможет мне дать более точный совет...",
        "В этом вопросе ключевую роль играет принцип добросовестности. Давайте разберемся подробнее...",
      ];

      const response = responses[Math.floor(Math.random() * responses.length)];
      setMessages((prev) => [...prev, { role: "assistant", content: response }]);
      setLoading(false);
    }, 800);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <ChatSidebar onNewChat={handleNewChat} onLogout={handleLogout} />

      {/* Main Chat Area */}
      <div className="flex-1 ml-64 flex flex-col">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl px-4 md:px-8 py-8 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-sm lg:max-w-md xl:max-w-lg px-4 py-3 rounded-2xl ${
                    message.role === "user"
                      ? "bg-accent text-accent-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-secondary text-secondary-foreground px-4 py-3 rounded-2xl">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"></div>
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-border bg-background">
          <div className="mx-auto max-w-3xl px-4 md:px-8 py-4">
            <form onSubmit={handleSendMessage} className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Задайте ваш юридический вопрос..."
                  className="flex-1 px-4 py-3 rounded-full border-0 bg-secondary text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="px-4 py-3 rounded-full bg-accent text-accent-foreground hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                LegalAI может делать ошибки. Для важных решений проконсультируйтесь с адвокатом.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
