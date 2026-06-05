"use client";

import ChannelTab from "@/components/profile/ChannelTab";
import ProfileAnalyticsPanel from "@/components/screens/profile/ProfileAnalyticsPanel";
import ProfileScreenHeader from "@/components/screens/profile/ProfileScreenHeader";
import ProfileSettingsPanel from "@/components/screens/profile/ProfileSettingsPanel";
import { useProfileScreen } from "@/lib/hooks/useProfileScreen";

export default function ProfileScreen() {
  const ps = useProfileScreen();

  return (
    <>
      <ProfileScreenHeader {...ps} />
      <div className="profile-page" id="screen-profile">
        <div className="profile-scroll-inner">
          <ChannelTab active={ps.channelTabActive} />
          <ProfileSettingsPanel active={ps.tab === 0} settingsTabActive={ps.settingsTabActive} />
          <ProfileAnalyticsPanel
            active={ps.tab === 2}
            period={ps.platformPeriod}
            onPeriodChange={ps.setPlatformPeriod}
            periodInHeader={ps.platformPeriodInHeader}
          />
        </div>
      </div>
    </>
  );
}
