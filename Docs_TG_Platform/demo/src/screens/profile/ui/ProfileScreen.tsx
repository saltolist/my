"use client";

import ChannelTab from "@/widgets/profile-settings/ui/ChannelTab";
import ProfileAnalyticsPanel from "@/screens/profile/ui/ProfileAnalyticsPanel";
import ProfileScreenHeader from "@/screens/profile/ui/ProfileScreenHeader";
import ProfileSettingsPanel from "@/screens/profile/ui/ProfileSettingsPanel";
import { useProfileScreen } from "@/screens/profile/model/useProfileScreen";

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
