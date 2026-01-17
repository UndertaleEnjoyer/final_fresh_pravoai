import { Plus, Settings, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { Scale } from "lucide-react";

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
}

export const ChatSidebar = ({
  chatSessions,
  currentChatId,
  onNewChat,
  onSelectChat,
  onOpenSettings,
  onLogout,
}: ChatSidebarProps) => {
  return (
    <div className="w-64 bg-card border-r border-border flex flex-col h-screen fixed left-0 top-0">
      {/* Logo and New Chat */}
      <div className="p-4 border-b border-border">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg mb-4">
          <Scale className="w-5 h-5 text-accent" />
          <span className="text-foreground">LegalAI</span>
        </Link>
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-accent text-accent-foreground font-medium hover:opacity-90 transition-opacity"
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
            <div className="space-y-2">
              {chatSessions.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => onSelectChat(chat.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors truncate ${
                    currentChatId === chat.id
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                  title={chat.title}
                >
                  {chat.title}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Settings and Logout */}
      <div className="border-t border-border p-4 space-y-2">
        <button
          onClick={onOpenSettings}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
        >
          <Settings className="w-4 h-4" />
          <span>Параметры</span>
        </button>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Выход</span>
        </button>
      </div>
    </div>
  );
};
