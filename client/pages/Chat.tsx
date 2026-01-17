import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Send, Menu, X, Square } from "lucide-react";
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
  const [chatSessions, setChatSessions] = useState<ChatSession[]>(() => {
    const savedChats = localStorage.getItem("chatSessions");
    return savedChats ? JSON.parse(savedChats) : [];
  });
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [streamingText, setStreamingText] = useState<string>("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentStreamingResponse, setCurrentStreamingResponse] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const streamingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Константа для скорости печати (можно менять в коде)
  const TYPING_SPEED = 10; // в ms

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
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/auth");
      return;
    }
    setUser(JSON.parse(userData));

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

  // Эффект для потоковой генерации текста
  useEffect(() => {
    if (isStreaming && currentStreamingResponse && streamingText.length < currentStreamingResponse.length) {
      if (streamingTimerRef.current) {
        clearTimeout(streamingTimerRef.current);
      }
      
      streamingTimerRef.current = setTimeout(() => {
        const nextChar = currentStreamingResponse[streamingText.length];
        setStreamingText(prev => prev + nextChar);
      }, TYPING_SPEED); // Используем константу скорости

      return () => {
        if (streamingTimerRef.current) {
          clearTimeout(streamingTimerRef.current);
        }
      };
    } else if (isStreaming && streamingText.length === currentStreamingResponse.length) {
      // Завершаем стриминг и сохраняем сообщение
      finishStreaming();
    }
  }, [isStreaming, streamingText, currentStreamingResponse, currentChatId]);

  // Функция для сброса высоты textarea
  const resetTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '56px'; // Возвращаем исходную высоту
      textareaRef.current.focus(); // Возвращаем фокус
    }
  };

  const finishStreaming = () => {
    setIsStreaming(false);
    if (currentChatId && streamingText) {
      setChatSessions(prev =>
        prev.map(chat => {
          if (chat.id === currentChatId) {
            return {
              ...chat,
              messages: [
                ...chat.messages,
                { role: "assistant" as const, content: streamingText },
              ],
            };
          }
          return chat;
        })
      );
    }
    setStreamingText("");
    setCurrentStreamingResponse("");
    
    // Сбрасываем высоту textarea после завершения генерации
    resetTextareaHeight();
    
    if (streamingTimerRef.current) {
      clearTimeout(streamingTimerRef.current);
      streamingTimerRef.current = null;
    }
  };

  const handleStopGeneration = () => {
    if (isStreaming) {
      finishStreaming();
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
    // Не позволяем удалять чат во время генерации
    if (isStreaming) return;
    
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
    localStorage.removeItem("user");
    localStorage.removeItem("chatSessions");
    navigate("/");
  };

  const handleNewChat = () => {
    // Не позволяем создавать новый чат во время генерации
    if (isStreaming) return;
    
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

  const responses = [
    "Отличный вопрос! В соответствии с действующим законодательством Российской Федерации, в частности Гражданским кодексом РФ, такие ситуации регулируются статьями 421-423 о свободе договора. Основной принцип заключается в том, что стороны свободны в заключении договора и определении его условий. Однако есть и ограничения: договор не должен противоречить закону и нарушать права третьих лиц. \n\nВ вашем случае важно обратить внимание на следующие моменты:\n1. Соответствие условий договора требованиям законодательства\n2. Наличие существенных условий договора\n3. Соблюдение формы договора, если она предусмотрена законом\n4. Отсутствие признаков кабальности сделки\n\nРекомендую проконсультироваться с юристом для детального анализа вашего конкретного случая.",
    
    "Это важный момент для вашей ситуации. Рекомендую рассмотреть следующие варианты:\n\n**Вариант 1:** Обращение в суд с исковым заявлением о признании права собственности. Этот путь наиболее надежный, но требует времени и финансовых затрат.\n\n**Вариант 2:** Досудебное урегулирование спора путем переговоров с контрагентом. Может быть эффективным, если сохранились хорошие отношения.\n\n**Вариант 3:** Обращение в прокуратуру или Роспотребнадзор, если есть признаки нарушения ваших прав как потребителя.\n\n**Сроки исковой давности:** По общему правилу составляют 3 года с момента, когда вы узнали о нарушении своего права.\n\n**Документы, которые потребуются:**\n- Договор и все дополнительные соглашения\n- Платежные документы\n- Переписка с контрагентом\n- Доказательства выполнения вами обязательств\n\nКаждый случай уникален, поэтому рекомендую собрать все документы и обратиться к практикующему юристу.",
    
    "Согласно судебной практике Верховного Суда РФ и арбитражных судов, в подобных случаях суды учитывают следующие обстоятельства:\n\n1. **Принцип добросовестности** - одна из основополагающих принципов гражданского права (ст. 1 ГК РФ)\n2. **Соразмерность ответственности** - наказание должно соответствовать нарушению\n3. **Реальный ущерб** - необходимо доказать фактические потери\n4. **Причинно-следственная связь** - между действиями ответчика и ущербом\n\n**Последние тенденции в судебной практике:**\n- Суды все чаще встают на сторону потребителей\n- Ужесточается ответственность за нарушение договорных обязательств\n- Учитывается экономическое положение сторон\n- Применяется принцип пропорциональности\n\n**Рекомендации:**\n1. Тщательно документируйте все этапы взаимодействия\n2. Сохраняйте всю переписку (электронную и бумажную)\n3. Фиксируйте сроки выполнения обязательств\n4. Получайте письменные подтверждения от контрагента\n\nДля точной оценки перспектив вашего дела нужна очная консультация.",
    
    "Пожалуйста, уточните детали. Это поможет мне дать более точный ответ:\n\n1. **Субъекты правоотношений:** Кто являются сторонами (физические/юридические лица, ИП)?\n2. **Предмет спора:** О чем именно договор или спор?\n3. **Сумма требований:** Какая сумма взыскивается или оспаривается?\n4. **Сроки:** Когда были совершены действия/бездействия?\n5. **Документы:** Какие документы у вас имеются на руках?\n6. **Цель:** Что вы хотите достичь (вернуть деньги, исполнить договор, расторгнуть сделку)?\n\n**Общие рекомендации на данный момент:**\n- Не подписывайте никаких дополнительных документов без консультации с юристом\n- Сохраняйте все имеющиеся доказательства\n- Не удаляйте переписку и документы\n- Фиксируйте все контакты с противоположной стороной\n\nЮридические вопросы требуют детального изучения документов и обстоятельств. Чем больше информации вы предоставите, тем точнее будет мой ответ.",
    
    "В этом вопросе ключевую роль играет принцип добросовестности, закрепленный в статье 1 Гражданского кодекса РФ. Давайте разберемся подробнее:\n\n**Правовая база:**\n1. Гражданский кодекс РФ (особенно главы 9, 27, 28)\n2. Закон о защите прав потребителей\n3. Судебная практика высших судов\n\n**Ключевые аспекты:**\n- **Прозрачность условий** - все существенные условия должны быть ясны сторонам\n- **Баланс интересов** - договор не должен явно нарушать интересы одной из сторон\n- **Исполнение обязательств** - каждая сторона должна добросовестно выполнять свои обязанности\n- **Последствия нарушения** - ответственность должна быть адекватной нарушению\n\n**Что делать в вашей ситуации:**\n1. Провести правовой анализ договора\n2. Оценить риски и последствия\n3. Рассмотреть возможность досудебного урегулирования\n4. При необходимости подготовиться к судебному разбирательству\n\n**Важно:** Юридические вопросы часто имеют нюансы, которые сложно учесть в общем ответе. Для принятия окончательного решения рекомендую обратиться к практикующему юристу с полным пакетом документов."
  ];

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

    // Симуляция подготовки ответа AI
    setTimeout(() => {
      setLoading(false);
      
      // Выбираем случайный ответ
      const response = responses[Math.floor(Math.random() * responses.length)];
      setCurrentStreamingResponse(response);
      setStreamingText(""); // Начинаем с пустой строки
      setIsStreaming(true);
    }, 600);
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
                  placeholder="Задайте ваш юридический вопрос..."
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