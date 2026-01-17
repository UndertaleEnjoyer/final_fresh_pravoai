import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Scale, LogOut, Send } from "lucide-react";

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

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/auth");
      return;
    }
    setUser(JSON.parse(userData));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
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
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card">
        <div className="container h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-lg">
            <Scale className="w-6 h-6 text-accent" />
            <span className="text-foreground">LegalAI Chat</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user.email}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Выход
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="container max-w-2xl py-8 space-y-6">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                  message.role === "user"
                    ? "bg-accent text-accent-foreground"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-secondary text-secondary-foreground px-4 py-3 rounded-lg">
                <div className="flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-border bg-card">
        <div className="container max-w-2xl py-4">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Задайте ваш юридический вопрос..."
              className="flex-1 px-4 py-3 rounded-lg border border-border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-4 py-3 rounded-lg bg-accent text-accent-foreground hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Отправить</span>
            </button>
          </form>
          <p className="text-xs text-muted-foreground mt-3">
            LegalAI может делать ошибки. Для важных решений проконсультируйтесь с адвокатом.
          </p>
        </div>
      </div>
    </div>
  );
}
