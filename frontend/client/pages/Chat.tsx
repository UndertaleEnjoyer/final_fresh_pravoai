import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Send, Menu, X, Square } from "lucide-react";
import { ChatSidebar } from "@/components/ChatSidebar";
import { SettingsModal } from "@/components/SettingsModal";
import { useAuth } from "@/hooks/use-auth";

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
  const { user: authUser, isAuthenticated, logout: authLogout } = useAuth();
  const [user, setUser] = useState<any>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>(() => {
    const savedChats = localStorage.getItem("chatSessions");
    return savedChats ? JSON.parse(savedChats) : [];
  });
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Для управления новым чатом
  const [isNewChatActive, setIsNewChatActive] = useState(false);

  // Для управления автопрокруткой
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  // Добавляем стили для скроллбара через useEffect
  useEffect(() => {
    // Создаем стили для скроллбара
    const style = document.createElement('style');
    style.textContent = `
      /* Стили для скроллбара в контейнере сообщений */
      .chat-messages-container::-webkit-scrollbar {
        width: 8px;
      }
      
      .chat-messages-container::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.05);
        border-radius: 4px;
      }
      
      .chat-messages-container::-webkit-scrollbar-thumb {
        background: rgba(0, 0, 0, 0.2);
        border-radius: 4px;
        transition: background 0.2s;
      }
      
      .chat-messages-container::-webkit-scrollbar-thumb:hover {
        background: rgba(0, 0, 0, 0.3);
      }
      
      /* Стили для скроллбара в textarea */
      .chat-textarea::-webkit-scrollbar {
        width: 6px;
      }
      
      .chat-textarea::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.05);
        border-radius: 3px;
      }
      
      .chat-textarea::-webkit-scrollbar-thumb {
        background: rgba(0, 0, 0, 0.15);
        border-radius: 3px;
      }
      
      .chat-textarea::-webkit-scrollbar-thumb:hover {
        background: rgba(0, 0, 0, 0.25);
      }
      
      /* Для Firefox */
      .chat-messages-container {
        scrollbar-width: thin;
        scrollbar-color: rgba(0, 0, 0, 0.2) rgba(0, 0, 0, 0.05);
      }
      
      .chat-textarea {
        scrollbar-width: thin;
        scrollbar-color: rgba(0, 0, 0, 0.15) rgba(0, 0, 0, 0.05);
      }
    `;
    
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("chatSessions", JSON.stringify(chatSessions));
  }, [chatSessions]);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/auth");
      return;
    }
    setUser(authUser);

    // Не создаем чат автоматически - только когда пользователь напишет первое сообщение
    if (chatSessions.length === 0) {
      setCurrentChatId(null);
      setIsNewChatActive(true);
    } else if (!currentChatId) {
      // Выбираем последний активный чат
      setCurrentChatId(chatSessions[0].id);
    }
  }, [navigate]);

  // Автопрокрутка только если пользователь не прокручивал вверх
  useEffect(() => {
    if (shouldAutoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatSessions, currentChatId, streamingText, shouldAutoScroll]);

  // Обработчик прокрутки для отключения автопрокрутки
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 100; // 100px от низа
      setShouldAutoScroll(isAtBottom);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);


  // Функция для сброса высоты textarea
  const resetTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '56px'; // Возвращаем исходную высоту
      textareaRef.current.focus(); // Возвращаем фокус
    }
  };


  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const createNewChatSession = (firstMessage: string): ChatSession => {
    const title = firstMessage.length > 15 
      ? firstMessage.substring(0, 15) + "..." 
      : firstMessage;
    
    return {
      id: Date.now().toString(),
      title,
      messages: [], // НЕ добавляем приветственное сообщение автоматически
      createdAt: new Date(),
    };
  };

  const handleDeleteChat = async (chatId: string) => {
    // Не позволяем удалять чат во время загрузки
    if (loading) return;
    
    setChatSessions((prev) => {
      const newChats = prev.filter((chat) => chat.id !== chatId);
      
      if (currentChatId === chatId) {
        if (newChats.length > 0) {
          setCurrentChatId(newChats[0].id);
        } else {
          setCurrentChatId(null);
          setIsNewChatActive(true);
        }
      }
      
      return newChats;
    });
  };

  const getCurrentChat = (): ChatSession | undefined => {
    return chatSessions.find((chat) => chat.id === currentChatId);
  };

  const handleLogout = () => {
    localStorage.removeItem("chatSessions");
    authLogout();
  };

  const handleNewChat = () => {
    // Не позволяем создавать новый чат во время загрузки
    if (loading) return;
    
    // Просто активируем режим нового чата, но не создаем его
    setCurrentChatId(null);
    setIsNewChatActive(true);
    setInput("");
    setShowSidebar(false);
    setIsSidebarCollapsed(false);
    setShouldAutoScroll(true); // Сброс автопрокрутки для нового чата
    
    // Сбрасываем высоту textarea
    resetTextareaHeight();
  };

  const handleChatSelect = (chatId: string) => {
    // Не позволяем переключать чаты во время генерации
    if (isStreaming) return;
    
    setCurrentChatId(chatId);
    setIsNewChatActive(false);
    setShowSidebar(false);
    setIsSidebarCollapsed(false);
    setInput("");
    setShouldAutoScroll(true); // Сброс автопрокрутки при переключении чата
    
    // Сбрасываем высоту textarea
    resetTextareaHeight();
  };


  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading || isStreaming) return;

    const userMessage = input;
    let targetChatId = currentChatId;

    // Сбрасываем высоту textarea ПЕРЕД отправкой сообщения
    resetTextareaHeight();

    // Если это новый чат (еще не создан)
    if (isNewChatActive || !currentChatId) {
      // Создаем новый чат с первым сообщением
      const newChat = createNewChatSession(userMessage);
      targetChatId = newChat.id;
      
      // Добавляем пользовательское сообщение
      newChat.messages.push({ role: "user" as const, content: userMessage });
      
      setChatSessions((prev) => [newChat, ...prev]);
      setCurrentChatId(newChat.id);
      setIsNewChatActive(false);
    } else {
      // Добавляем сообщение в существующий чат
      setChatSessions((prev) =>
        prev.map((chat) => {
          if (chat.id === currentChatId) {
            return {
              ...chat,
              messages: [
                ...chat.messages,
                { role: "user" as const, content: userMessage },
              ],
            };
          }
          return chat;
        }),
      );
    }

    setInput("");
    setLoading(true);
    setShouldAutoScroll(true); // Включаем автопрокрутку при отправке сообщения

    // Send request to backend API
    fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: userMessage,
        user_id: authUser?.id || '',
      }),
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`API error: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setLoading(false);

        if (data.error) {
          // Show error message in chat
          setChatSessions((prev) =>
            prev.map((chat) => {
              if (chat.id === targetChatId) {
                return {
                  ...chat,
                  messages: [
                    ...chat.messages,
                    {
                      role: "assistant" as const,
                      content: `Ошибка: ${data.error}`,
                    },
                  ],
                };
              }
              return chat;
            })
          );
        } else {
          // Add the response directly to messages (no streaming)
          setChatSessions((prev) =>
            prev.map((chat) => {
              if (chat.id === targetChatId) {
                return {
                  ...chat,
                  messages: [
                    ...chat.messages,
                    {
                      role: "assistant" as const,
                      content: data.response,
                    },
                  ],
                };
              }
              return chat;
            })
          );
        }

        // Reset textarea height
        resetTextareaHeight();
      })
      .catch((error) => {
        console.error('Chat error:', error);
        setLoading(false);

        // Show error message to user
        setChatSessions((prev) =>
          prev.map((chat) => {
            if (chat.id === targetChatId) {
              return {
                ...chat,
                messages: [
                  ...chat.messages,
                  {
                    role: "assistant" as const,
                    content: `Произошла ошибка при обработке вашего запроса: ${error.message}`,
                  },
                ],
              };
            }
            return chat;
          })
        );

        resetTextareaHeight();
      });
  };

  if (!user) {
    return null;
  }

  const currentChat = getCurrentChat();
  const messages = currentChat?.messages || [];
  const showWelcomeMessage = (!currentChatId || isNewChatActive) && messages.length === 0 && !isStreaming && !loading;

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar - Desktop */}
      {!isSidebarCollapsed && (
        <div className="hidden md:block">
          <ChatSidebar
            chatSessions={chatSessions}
            currentChatId={currentChatId}
            onNewChat={handleNewChat}
            onSelectChat={handleChatSelect}
            onOpenSettings={() => setShowSettings(true)}
            onLogout={handleLogout}
            onDeleteChat={handleDeleteChat}
            onToggleCollapse={toggleSidebarCollapse}
          />
        </div>
      )}

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
              onDeleteChat={handleDeleteChat}
            />
          </div>
        </div>
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />

      {/* Desktop Burger - отдельно плавающий, когда сайдбар свернут */}
      {isSidebarCollapsed && (
        <button
          onClick={toggleSidebarCollapse}
          className="hidden md:flex fixed left-4 top-4 z-10 p-2 text-muted-foreground hover:text-foreground transition-colors"
          title="Раскрыть панель"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
        !isSidebarCollapsed ? "md:ml-64" : ""
      }`}>
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
            {currentChat?.title || (isNewChatActive ? "Новый чат" : "PravoAI Chat")}
          </span>
        </div>

        {/* Chat Messages - ШИРОКИЙ как у DeepSeek с красивым скроллом */}
        <div 
          className="flex-1 overflow-y-auto chat-messages-container" 
          ref={messagesContainerRef}
        >
          <div className={`mx-auto py-8 space-y-6 transition-all duration-300 ease-in-out ${
            isSidebarCollapsed ? "px-4 md:px-8 max-w-5xl" : "px-4 md:px-8 max-w-5xl"
          }`}>
            {/* Приветственное сообщение посередине, когда нет чата */}
            {showWelcomeMessage && (
              <div className="flex items-center justify-center h-full min-h-[60vh]">
                <div className="text-center max-w-2xl">
                  <div className="text-2xl font-medium text-foreground mb-4">
                    PravoAI
                  </div>
                  <p className="text-lg text-muted-foreground">
                    Задайте ваш вопрос, чтобы начать диалог.
                  </p>
                </div>
              </div>
            )}
            
            {/* Сообщения из чата */}
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`px-4 py-3 rounded-2xl ${
                    message.role === "user"
                      ? "bg-secondary text-secondary-foreground max-w-3xl"
                      : "max-w-4xl"
                  }`}
                >
                  <p className="text-base whitespace-pre-wrap leading-relaxed">
                    {message.content}
                  </p>
                </div>
              </div>
            ))}
            
            {/* Потоковый ответ AI */}
            {isStreaming && (
              <div className="flex justify-start">
                <div className="px-4 py-3 rounded-2xl max-w-4xl">
                  <p className="text-base whitespace-pre-wrap leading-relaxed">
                    {streamingText}
                    <span className="inline-block w-2 h-4 ml-1 bg-foreground animate-pulse"></span>
                  </p>
                </div>
              </div>
            )}
            
            {loading && (
              <div className="flex justify-start">
                <div className="px-4 py-3 rounded-2xl">
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

        {/* Input Area - тоже шире */}
        <div className="border-t border-border bg-background">
          <div className={`mx-auto py-6 transition-all duration-300 ease-in-out ${
            isSidebarCollapsed ? "px-4 md:px-8 max-w-5xl" : "px-4 md:px-8 max-w-5xl"
          }`}>
            <form onSubmit={handleSendMessage} className="space-y-3">
              <div className="flex gap-3">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    
                    // Автоматическое изменение высоты
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    const newHeight = Math.min(target.scrollHeight, 200);
                    target.style.height = `${newHeight}px`;
                  }}
                  placeholder="Жду Ваш вопрос..."
                  className="flex-1 px-5 py-3.5 rounded-2xl border-0 bg-secondary text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent text-base resize-none min-h-[56px] max-h-[200px] leading-relaxed chat-textarea"
                  disabled={loading || isStreaming}
                  autoFocus
                  rows={1}
                  style={{
                    height: '56px', // Фиксированная начальная высота
                    minHeight: '56px',
                    maxHeight: '200px',
                    overflowY: 'auto'
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                />
                {isStreaming ? (
                  <button
                    type="button"
                    onClick={handleStopGeneration}
                    className="px-5 py-3.5 rounded-full bg-accent text-accent-foreground transition-colors flex items-center justify-center gap-2 text-base self-end h-[56px]"
                    title="Остановить генерацию"
                  >
                    <Square className="w-5 h-5 fill-white" style={{ borderRadius: '3px' }} />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading || isStreaming || !input.trim()}
                    className="px-5 py-3.5 rounded-full bg-accent text-accent-foreground hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base self-end h-[56px]"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                )}
              </div>
              <p className="text-xs text-muted-foreground text-center pt-2">
                PravoAI может делать ошибки. Для важных решений проконсультируйтесь с адвокатом.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
