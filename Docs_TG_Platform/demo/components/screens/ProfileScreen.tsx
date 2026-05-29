"use client";

import { useState } from "react";
import ChannelTab from "../profile/ChannelTab";
import AiModelsBlock from "../profile/AiModelsBlock";
import SystemPromptBlock from "../profile/SystemPromptBlock";
import TelegramBlock from "../profile/TelegramBlock";
import ThemeBlock from "../profile/ThemeBlock";
import PlatformAnalyticsBlock from "../profile/PlatformAnalyticsBlock";
import PageHeader from "../PageHeader";
import PageHeaderSelect from "../PageHeaderSelect";
import { useApp } from "@/state/AppContext";
import { useCompactHeader1000 } from "@/lib/hooks/useCompactHeader1000";

const PROFILE_TABS = ["Настройки", "Канал", "Аналитика платформы"] as const;

export default function ProfileScreen() {
  const [tab, setTab] = useState(0);
  const { state, profileChannelDirty, profileSettingsDirty, discardProfileEdits } = useApp();
  const profileScreenActive = state.screen === "profile";
  const isCompactHeader = useCompactHeader1000();
  const settingsTabActive = tab === 0 && profileScreenActive;
  const channelTabActive = tab === 1 && profileScreenActive;

  const switchTab = (next: number) => {
    if (tab === 0 && next !== 0 && profileSettingsDirty) {
      const ok = window.confirm(
        "Есть несохранённые изменения в настройках профиля. Перейти без сохранения?",
      );
      if (!ok) return;
      discardProfileEdits();
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
      discardProfileEdits();
    }
    setTab(next);
  };

  const profileTabSelectProps = {
    ariaLabel: "Раздел профиля",
    value: String(tab),
    options: PROFILE_TABS.map((label, i) => ({ value: String(i), label })),
    onChange: (v: string) => switchTab(Number(v)),
  };

  const tabToolbar = (
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
      <PageHeader
        title="Профиль канала"
        backTo="home"
        center={
          isCompactHeader ? undefined : (
            <div className="page-header-toolbar--desktop">{tabToolbar}</div>
          )
        }
        mobileSelect={
          isCompactHeader ? <PageHeaderSelect {...profileTabSelectProps} /> : undefined
        }
      />
      <div className="profile-page" id="screen-profile">
        <div className="profile-scroll-inner">
          <ChannelTab active={channelTabActive} />

          <div className={`profile-panel profile-panel--settings${tab === 0 ? " active" : ""}`}>
            <ThemeBlock />
            <AiModelsBlock />
            <SystemPromptBlock active={settingsTabActive} />
            <TelegramBlock />
          </div>

          <div className={`profile-panel${tab === 2 ? " active" : ""}`}>
            <PlatformAnalyticsBlock />
          </div>
        </div>
      </div>
    </>
  );
}
