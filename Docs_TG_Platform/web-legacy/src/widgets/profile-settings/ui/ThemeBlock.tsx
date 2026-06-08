"use client";

import { useUi } from "@/app/model/store";
import type { ThemeMode } from "@/shared/types";

const OPTIONS: { id: ThemeMode; label: string; icon: string; hint: string }[] = [
  { id: "light", label: "Светлая", icon: "☀️", hint: "Всегда светлая тема" },
  { id: "system", label: "Системная", icon: "🖥️", hint: "Следует за настройками ОС" },
  { id: "dark", label: "Тёмная", icon: "🌙", hint: "Всегда тёмная тема" },
];

export default function ThemeBlock() {
  const { theme, setTheme } = useUi();

  return (
    <div className="profile-section">
      <div className="profile-section-title">Тема</div>
      <div className="theme-switch" role="radiogroup" aria-label="Выбор темы">
        {OPTIONS.map((opt) => {
          const active = theme === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={active}
              title={opt.hint}
              className={`theme-switch-btn${active ? " active" : ""}`}
              onClick={() => setTheme(opt.id)}
            >
              <span className="theme-switch-icon">{opt.icon}</span>
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
