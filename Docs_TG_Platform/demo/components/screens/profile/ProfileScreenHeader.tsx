"use client";

import PageHeader from "@/components/PageHeader";
import PageHeaderSelect from "@/components/PageHeaderSelect";
import { PLATFORM_ANALYTICS_PERIODS } from "@/lib/platformAnalyticsPeriods";
import { PROFILE_TABS } from "@/lib/profileTabs";
import type { ProfileScreenState } from "@/lib/hooks/useProfileScreen";

type Props = ProfileScreenState;

function ProfileTabToolbar({
  tab,
  onSwitchTab,
}: {
  tab: number;
  onSwitchTab: (index: number) => void;
}) {
  return (
    <div className="page-header-profile-tabs" role="tablist" aria-label="Раздел профиля">
      {PROFILE_TABS.map((label, i) => (
        <button
          key={label}
          type="button"
          role="tab"
          aria-selected={i === tab}
          className={`period-tab${i === tab ? " active" : ""}`}
          onClick={() => onSwitchTab(i)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export default function ProfileScreenHeader({
  tab,
  platformPeriod,
  setPlatformPeriod,
  switchTab,
  profileTabSelectProps,
  isMobile,
  isCompactHeader,
  platformPeriodInHeader,
}: Props) {
  const platformPeriodHeaderPicker = platformPeriodInHeader ? (
    <PageHeaderSelect
      ariaLabel="Период"
      chevron="down"
      className="page-header-select--profile-tabs"
      value={String(platformPeriod)}
      options={PLATFORM_ANALYTICS_PERIODS.map((item, index) => ({
        value: String(index),
        label: item.label,
      }))}
      onChange={(id) => setPlatformPeriod(Number(id))}
    />
  ) : null;

  const tabToolbar = <ProfileTabToolbar tab={tab} onSwitchTab={switchTab} />;

  return (
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
            />
            {platformPeriodHeaderPicker}
          </div>
        ) : undefined
      }
    />
  );
}
