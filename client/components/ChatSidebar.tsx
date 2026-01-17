import { Plus, Settings, LogOut, Trash2, X, Check, ChevronLeft } from "lucide-react";
import { Scale } from "lucide-react";
import { useState } from "react";

interface ChatSession {
  id: string;
  title: string;
  messages: any[];
  createdAt: Date;
}

interface ChatSidebarProps {
  chatSessions: ChatSession[];
  currentChatId: string | null;
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
  onOpenSettings: () => void;
  onLogout: () => void;
  onDeleteChat: (chatId: string) => void;
  onToggleCollapse?: () => void;
}

export const ChatSidebar = ({
  chatSessions,
  currentChatId,
  onNewChat,
  onSelectChat,
  onOpenSettings,
  onLogout,
  onDeleteChat,
  onToggleCollapse,
}: ChatSidebarProps) => {
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    setChatToDelete(chatId);
  };

  const confirmDelete = async () => {
    if (chatToDelete) {
      setIsDeleting(true);
      try {
        await onDeleteChat(chatToDelete);
      } finally {
        setIsDeleting(false);
        setChatToDelete(null);
      }
    }
  };

  const cancelDelete = () => {
    setChatToDelete(null);
  };

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col h-screen fixed left-0 top-0 transition-all duration-300 ease-in-out">
      {/* Logo and New Chat */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 font-bold text-lg">
            <Scale className="w-5 h-5 text-accent" />
            <span className="text-foreground">PravoAI</span>
          </div>
          
          {/* Кнопка сворачивания сайдбара - справа от логотипа */}
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="p-1.5 rounded-lg hover:bg-secondary/60 transition-colors"
              title="Скрыть панель"
            >
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>
        
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-gray-800 hover:bg-gray-900 text-white font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Новый чат
        </button>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-4">
        {chatSessions.length > 0 && (
          <>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-3">
              История
            </h3>
            <div className="space-y-1">
              {chatSessions.map((chat) => (
                <div
                  key={chat.id}
                  className="group relative flex items-center"
                >
                  <button
                    onClick={() => onSelectChat(chat.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors truncate ${
                      currentChatId === chat.id
                        ? "bg-secondary/80 text-foreground font-medium pr-12"
                        : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground pr-12"
                    }`}
                    title={chat.title}
                    disabled={chatToDelete === chat.id}
                  >
                    {chat.title}
                  </button>

                  {chatToDelete === chat.id ? (
                    <div className="absolute right-2 flex items-center gap-2">
                      <button
                        onClick={confirmDelete}
                        disabled={isDeleting}
                        className="p-1.5 rounded-full bg-green-500/20 hover:bg-green-500/30 text-green-600 hover:text-green-700 transition-colors"
                        title="Подтвердить удаление"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={cancelDelete}
                        disabled={isDeleting}
                        className="p-1.5 rounded-full bg-red-500/20 hover:bg-red-500/30 text-red-600 hover:text-red-700 transition-colors"
                        title="Отмена"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => handleDeleteClick(e, chat.id)}
                      className={`absolute right-2 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${
                        currentChatId === chat.id
                          ? "bg-red-500/20 hover:bg-red-500/30 text-red-600 hover:text-red-700"
                          : "bg-red-500/10 hover:bg-red-500/20 text-red-500 hover:text-red-600"
                      }`}
                      title="Удалить чат"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Settings and Logout */}
      <div className="border-t border-border p-4 space-y-2">
        <button
          onClick={onOpenSettings}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-secondary/60 hover:text-foreground transition-colors"
        >
          <Settings className="w-4 h-4" />
          <span>Параметры</span>
        </button>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-secondary/60 hover:text-foreground transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Выход</span>
        </button>
      </div>
    </div>
  );
};