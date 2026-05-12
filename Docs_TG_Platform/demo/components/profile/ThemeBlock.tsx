"use client";

import { useApp } from "@/state/AppContext";
import type { ThemeMode } from "@/lib/types";

const OPTIONS: { id: ThemeMode; label: string; icon: string; hint: string }[] = [
  { id: "light", label: "Светлая", icon: "☀️", hint: "Всегда светлая тема" },
  { id: "system", label: "Системная", icon: "🖥️", hint: "Следует за настройками ОС" },
  { id: "dark", label: "Тёмная", icon: "🌙", hint: "Всегда тёмная тема" },
];

export default function ThemeBlock() {
  const { state, dispatch } = useApp();

  return (
    <div className="profile-section">
      <div className="profile-section-title">Тема</div>
      <div className="theme-switch" role="radiogroup" aria-label="Выбор темы">
        {OPTIONS.map((opt) => {
          const active = state.theme === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={active}
              title={opt.hint}
              className={`theme-switch-btn${active ? " active" : ""}`}
              onClick={() => dispatch({ type: "SET_STATE", patch: { theme: opt.id } })}
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
