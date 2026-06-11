"use client";

import { useCallback, useMemo, useState } from "react";
import { useNavigation } from "@/app/model/store";
import { useUi } from "@/app/model/store";
import { useCompactHeader1000 } from "@/shared/lib/hooks/useCompactHeader1000";
import { useMobile760 } from "@/shared/lib/hooks/useMobile760";
import { usePageHeaderLe650 } from "@/widgets/page-header";
import { PROFILE_TABS } from "@/shared/lib/profileTabs";

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
    data: {
      tab,
      platformPeriod,
      settingsTabActive,
      channelTabActive,
    },
    ui: {
      isMobile,
      isCompactHeader,
      platformPeriodInHeader,
      profileTabSelectProps,
    },
    actions: {
      setPlatformPeriod,
      switchTab,
    },
  };
}

export type ProfileScreenState = ReturnType<typeof useProfileScreen>;
