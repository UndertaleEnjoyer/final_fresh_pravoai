import { useState } from "react";
import { X, Moon, Sun } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  const [activeTab, setActiveTab] = useState<"appearance" | "account" | "plan">(
    "appearance",
  );
  const [theme, setTheme] = useState<"light" | "dark" | "auto">("dark");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card">
          <h2 className="text-xl font-bold text-foreground">Параметры</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-border">
          <button
            onClick={() => setActiveTab("appearance")}
            className={`flex-1 px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === "appearance"
                ? "border-accent text-accent"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Оформление
          </button>
          <button
            onClick={() => setActiveTab("account")}
            className={`flex-1 px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === "account"
                ? "border-accent text-accent"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Аккаунт
          </button>
          <button
            onClick={() => setActiveTab("plan")}
            className={`flex-1 px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === "plan"
                ? "border-accent text-accent"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            План
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Appearance Tab */}
          {activeTab === "appearance" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">
                  Тема
                </h3>
                <div className="space-y-2">
                  {(["light", "dark", "auto"] as const).map((t) => (
                    <label
                      key={t}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border cursor-pointer hover:bg-secondary transition-colors"
                    >
                      <input
                        type="radio"
                        name="theme"
                        value={t}
                        checked={theme === t}
                        onChange={(e) => setTheme(e.target.value as typeof t)}
                        className="w-4 h-4"
                      />
                      <div className="flex items-center gap-2">
                        {t === "light" && <Sun className="w-4 h-4" />}
                        {t === "dark" && <Moon className="w-4 h-4" />}
                        <span className="text-sm text-foreground capitalize">
                          {t === "light"
                            ? "Светлая"
                            : t === "dark"
                              ? "Тёмная"
                              : "Автоматически"}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Account Tab */}
          {activeTab === "account" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Старый пароль
                </label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Введите текущий пароль"
                  className="w-full px-4 py-2 rounded-lg border border-border bg-secondary text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Новый пароль
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Введите новый пароль"
                  className="w-full px-4 py-2 rounded-lg border border-border bg-secondary text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Подтвердите пароль
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Подтвердите новый пароль"
                  className="w-full px-4 py-2 rounded-lg border border-border bg-secondary text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <button className="w-full py-2 rounded-lg bg-accent text-accent-foreground font-medium hover:opacity-90 transition-opacity">
                Сохранить пароль
              </button>
            </div>
          )}

          {/* Plan Tab */}
          {activeTab === "plan" && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-secondary border border-border">
                <p className="text-sm text-muted-foreground mb-1">
                  Текущий план
                </p>
                <p className="text-lg font-bold text-foreground">
                  Профессиональный
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  ₽2990/месяц
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">
                  Включено:
                </p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>✓ Неограниченные консультации</li>
                  <li>✓ Продвинутый анализ документов</li>
                  <li>✓ Приоритетная поддержка</li>
                  <li>✓ Пользовательские шаблоны</li>
                </ul>
              </div>
              <button className="w-full py-2 rounded-lg bg-secondary text-foreground font-medium hover:opacity-90 transition-opacity border border-border">
                Изменить план
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
