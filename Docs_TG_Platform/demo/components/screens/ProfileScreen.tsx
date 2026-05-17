"use client";

import { useState } from "react";
import ChannelTab from "../profile/ChannelTab";
import AiModelsBlock from "../profile/AiModelsBlock";
import SystemPromptBlock from "../profile/SystemPromptBlock";
import TelegramBlock from "../profile/TelegramBlock";
import ThemeBlock from "../profile/ThemeBlock";
import PageHeader from "../PageHeader";
import { useApp } from "@/state/AppContext";

const PROFILE_TABS = ["Настройки", "Канал", "Аналитика платформы"] as const;

export default function ProfileScreen() {
  const [tab, setTab] = useState(0);
  const { profileChannelDirty, profileSettingsDirty } = useApp();

  const switchTab = (next: number) => {
    if (tab === 0 && next !== 0 && profileSettingsDirty) {
      const ok = window.confirm(
        "Есть несохранённые изменения в настройках профиля. Перейти без сохранения?",
      );
      if (!ok) return;
    }
    if (
      tab === 1 &&
      next !== 1 &&
      profileChannelDirty
    ) {
      const ok = window.confirm(
        "Есть несохранённые изменения в профиле канала. Перейти без сохранения?",
      );
      if (!ok) return;
    }
    setTab(next);
  };

  const profileTabToolbar = (
    <div className="page-header-profile-tabs" role="tablist" aria-label="Раздел профиля">
      {PROFILE_TABS.map((label, i) => (
        <button
          key={label}
          type="button"
          role="tab"
          aria-selected={i === tab}
          className={`period-tab${i === tab ? " active" : ""}`}
          onClick={() => switchTab(i)}
        >
          {label}
        </button>
      ))}
    </div>
  );

  return (
    <>
      <PageHeader title="Профиль канала" backTo="home" search={profileTabToolbar} />
      <div className="profile-page">
        <div className="profile-scroll-inner">
          <ChannelTab active={tab === 1} />

          <div className={`profile-panel${tab === 0 ? " active" : ""}`}>
            <ThemeBlock />
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
      </div>
    </>
  );
}
