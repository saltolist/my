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
import { useMobile760 } from "@/lib/hooks/useMobile760";
import { usePageHeaderLe650 } from "@/lib/hooks/usePageHeaderLe650";
import { PLATFORM_ANALYTICS_PERIODS } from "@/lib/platformAnalyticsPeriods";

const PROFILE_TABS = ["Настройки", "Канал", "Аналитика платформы"] as const;

export default function ProfileScreen() {
  const [tab, setTab] = useState(0);
  const [platformPeriod, setPlatformPeriod] = useState(2);
  const { state, profileChannelDirty, profileSettingsDirty, discardProfileEdits } = useApp();
  const profileScreenActive = state.screen === "profile";
  const isMobile = useMobile760();
  const isCompactHeader = useCompactHeader1000();
  const isHeaderLe650 = usePageHeaderLe650();
  const platformPeriodInHeader = tab === 2 && !isMobile && isHeaderLe650;
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

  const platformPeriodHeaderPicker = platformPeriodInHeader ? (
    <PageHeaderSelect
      ariaLabel="Период"
      chevron="down"
      value={String(platformPeriod)}
      options={PLATFORM_ANALYTICS_PERIODS.map((item, index) => ({
        value: String(index),
        label: item.label,
      }))}
      onChange={(id) => setPlatformPeriod(Number(id))}
    />
  ) : null;

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
            <div className="page-header-toolbar--desktop page-header-profile-center-toolbar">
              {tabToolbar}
              {platformPeriodHeaderPicker}
            </div>
          )
        }
        mobileSelect={
          isCompactHeader ? (
            <div className="page-header-profile-trailing-toolbar">
              <PageHeaderSelect
                {...profileTabSelectProps}
                className="page-header-select--profile-tabs"
                tightWidth
              />
              {platformPeriodHeaderPicker}
            </div>
          ) : undefined
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
            <PlatformAnalyticsBlock
              period={platformPeriod}
              onPeriodChange={setPlatformPeriod}
              periodInHeader={platformPeriodInHeader}
            />
          </div>
        </div>
      </div>
    </>
  );
}
