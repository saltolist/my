"use client";

import { useState } from "react";
import ChannelTab from "../profile/ChannelTab";
import AiModelsBlock from "../profile/AiModelsBlock";
import SystemPromptBlock from "../profile/SystemPromptBlock";
import TelegramBlock from "../profile/TelegramBlock";
import { useApp } from "@/state/AppContext";

export default function ProfileScreen() {
  const [tab, setTab] = useState(0);
  const { profileSettingsDirty } = useApp();

  const switchTab = (next: number) => {
    if (tab === 1 && next !== 1 && profileSettingsDirty) {
      const ok = window.confirm(
        "Есть несохранённые изменения в настройках профиля. Перейти без сохранения?",
      );
      if (!ok) return;
    }
    setTab(next);
  };

  return (
    <>
      <div className="page-header">
        <h2>Профиль канала</h2>
      </div>
      <div className="profile-scroll">
        <div className="profile-tabs">
          {["Канал", "Настройки", "Аналитика платформы"].map((label, i) => (
            <div
              key={label}
              className={`profile-tab${tab === i ? " active" : ""}`}
              onClick={() => switchTab(i)}
            >
              {label}
            </div>
          ))}
        </div>

        <ChannelTab active={tab === 0} />

        <div className={`profile-panel${tab === 1 ? " active" : ""}`}>
          <AiModelsBlock />
          <SystemPromptBlock />
          <TelegramBlock />
        </div>

        <div className={`profile-panel${tab === 2 ? " active" : ""}`}>
          <div className="profile-section">
            <div className="profile-section-title">Использование ИИ</div>
            <div className="stat-grid" style={{ marginBottom: 0 }}>
              <div className="stat-card">
                <div className="stat-label">Запросов</div>
                <div className="stat-value">47</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Токенов</div>
                <div className="stat-value">182K</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Стоимость</div>
                <div className="stat-value">$1.40</div>
              </div>
            </div>
          </div>
          <div className="profile-section">
            <div className="profile-section-title">Активность</div>
            <div className="profile-val" style={{ fontSize: 13, color: "var(--text2)" }}>
              Чатов создано: 12 &nbsp;•&nbsp; Заметок: 8 &nbsp;•&nbsp; Постов: 6
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
