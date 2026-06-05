"use client";

import PlatformAnalyticsBlock from "@/components/profile/PlatformAnalyticsBlock";

type Props = {
  active: boolean;
  period: number;
  onPeriodChange: (next: number) => void;
  periodInHeader: boolean;
};

export default function ProfileAnalyticsPanel({
  active,
  period,
  onPeriodChange,
  periodInHeader,
}: Props) {
  return (
    <div className={`profile-panel${active ? " active" : ""}`}>
      <PlatformAnalyticsBlock
        period={period}
        onPeriodChange={onPeriodChange}
        periodInHeader={periodInHeader}
      />
    </div>
  );
}
