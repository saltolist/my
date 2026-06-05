"use client";

import { useCallback, useMemo, useState } from "react";
import { useNavigation } from "@/state/navigation-store";
import { useUi } from "@/state/ui-store";
import { useCompactHeader1000 } from "@/lib/hooks/useCompactHeader1000";
import { useMobile760 } from "@/lib/hooks/useMobile760";
import { usePageHeaderLe650 } from "@/lib/hooks/usePageHeaderLe650";
import { PROFILE_TABS } from "@/lib/profileTabs";

export function useProfileScreen() {
  const [tab, setTab] = useState(0);
  const [platformPeriod, setPlatformPeriod] = useState(2);
  const { screen, discardProfileEdits } = useNavigation();
  const { profileChannelDirty, profileSettingsDirty } = useUi();
  const profileScreenActive = screen === "profile";
  const isMobile = useMobile760();
  const isCompactHeader = useCompactHeader1000();
  const isHeaderLe650 = usePageHeaderLe650();
  const platformPeriodInHeader = tab === 2 && !isMobile && isHeaderLe650;
  const settingsTabActive = tab === 0 && profileScreenActive;
  const channelTabActive = tab === 1 && profileScreenActive;

  const switchTab = useCallback(
    (next: number) => {
      if (tab === 0 && next !== 0 && profileSettingsDirty) {
        const ok = window.confirm(
          "Есть несохранённые изменения в настройках профиля. Перейти без сохранения?",
        );
        if (!ok) return;
        discardProfileEdits();
      }
      if (tab === 1 && next !== 1 && profileChannelDirty) {
        const ok = window.confirm(
          "Есть несохранённые изменения в профиле канала. Перейти без сохранения?",
        );
        if (!ok) return;
        discardProfileEdits();
      }
      setTab(next);
    },
    [discardProfileEdits, profileChannelDirty, profileSettingsDirty, tab],
  );

  const profileTabSelectProps = useMemo(
    () => ({
      ariaLabel: "Раздел профиля",
      value: String(tab),
      options: PROFILE_TABS.map((label, i) => ({ value: String(i), label })),
      onChange: (v: string) => switchTab(Number(v)),
    }),
    [switchTab, tab],
  );

  return {
    tab,
    platformPeriod,
    setPlatformPeriod,
    switchTab,
    profileTabSelectProps,
    isMobile,
    isCompactHeader,
    platformPeriodInHeader,
    settingsTabActive,
    channelTabActive,
  };
}

export type ProfileScreenState = ReturnType<typeof useProfileScreen>;
