import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Send, Menu, X } from "lucide-react";
import { ChatSidebar } from "@/components/ChatSidebar";
import { SettingsModal } from "@/components/SettingsModal";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}

export default function Chat() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
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

    // Initialize with first new chat
    const newChat = createNewChat();
    setCurrentChatId(newChat.id);
  }, [navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatSessions, currentChatId]);

  const createNewChat = (): ChatSession => {
    const newChat: ChatSession = {
      id: Date.now().toString(),
      title: "Новый чат",
      messages: [
        {
          role: "assistant",
          content:
            "Добро пожаловать в LegalAI! 👋 Я ваш персональный юридический консультант на основе ИИ. Как я могу вам помочь? Задайте любой юридический вопрос, и я предоставлю вам профессиональную консультацию.",
        },
      ],
      createdAt: new Date(),
    };
    setChatSessions((prev) => [newChat, ...prev]);
    return newChat;
  };

  const generateChatTitle = (text: string): string => {
    return text.length > 20 ? text.substring(0, 20) + "..." : text;
  };

  const getCurrentChat = (): ChatSession | undefined => {
    return chatSessions.find((chat) => chat.id === currentChatId);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleNewChat = () => {
    const newChat = createNewChat();
    setCurrentChatId(newChat.id);
    setInput("");
    setShowSidebar(false);
  };

  const handleChatSelect = (chatId: string) => {
    setCurrentChatId(chatId);
    setShowSidebar(false);
    setInput("");
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !currentChatId) return;

    const userMessage = input;

    setChatSessions((prev) =>
      prev.map((chat) => {
        if (chat.id === currentChatId) {
          const updatedChat = {
            ...chat,
            messages: [
              ...chat.messages,
              { role: "user" as const, content: userMessage },
            ],
          };

          // Auto-generate title from first user message
          if (chat.title === "Новый чат" && chat.messages.length === 1) {
            updatedChat.title = generateChatTitle(userMessage);
          }

          return updatedChat;
        }
        return chat;
      }),
    );

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

      setChatSessions((prev) =>
        prev.map((chat) => {
          if (chat.id === currentChatId) {
            return {
              ...chat,
              messages: [
                ...chat.messages,
                { role: "assistant" as const, content: response },
              ],
            };
          }
          return chat;
        }),
      );

      setLoading(false);
    }, 800);
  };

  if (!user) {
    return null;
  }

  const currentChat = getCurrentChat();
  const messages = currentChat?.messages || [];

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar - Desktop */}
      <div className="hidden md:block">
        <ChatSidebar
          chatSessions={chatSessions}
          currentChatId={currentChatId}
          onNewChat={handleNewChat}
          onSelectChat={handleChatSelect}
          onOpenSettings={() => setShowSettings(true)}
          onLogout={handleLogout}
        />
      </div>

      {/* Sidebar - Mobile */}
      {showSidebar && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setShowSidebar(false)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <ChatSidebar
              chatSessions={chatSessions}
              currentChatId={currentChatId}
              onNewChat={handleNewChat}
              onSelectChat={handleChatSelect}
              onOpenSettings={() => setShowSettings(true)}
              onLogout={handleLogout}
            />
          </div>
        </div>
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />

      {/* Main Chat Area */}
      <div className="flex-1 md:ml-64 flex flex-col">
        {/* Mobile Header */}
        <div className="md:hidden border-b border-border bg-card px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            {showSidebar ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
          <span className="text-sm font-medium text-foreground truncate">
            {currentChat?.title || "LegalAI Chat"}
          </span>
        </div>

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
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">
                    {message.content}
                  </p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-secondary text-secondary-foreground px-4 py-3 rounded-2xl">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"></div>
                    <div
                      className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                    <div
                      className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"
                      style={{ animationDelay: "0.4s" }}
                    ></div>
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
                LegalAI может делать ошибки. Для важных решений
                проконсультируйтесь с адвокатом.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
