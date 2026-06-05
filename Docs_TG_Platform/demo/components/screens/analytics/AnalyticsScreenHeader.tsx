"use client";

import PageHeader from "@/components/PageHeader";
import PageHeaderSelect from "@/components/PageHeaderSelect";
import type { AnalyticsScreenState } from "@/lib/hooks/useAnalyticsScreen";

type Props = Pick<AnalyticsScreenState, "isMobile" | "periodSelectProps">;

export default function AnalyticsScreenHeader({ isMobile, periodSelectProps }: Props) {
  return (
    <PageHeader
      title="Аналитика канала"
      backTo="home"
      mobileSelect={isMobile ? <PageHeaderSelect {...periodSelectProps} /> : undefined}
    />
  );
}
