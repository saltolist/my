"use client";

import PageHeader from "@/widgets/page-header/ui/PageHeader";
import PageHeaderSelect from "@/widgets/page-header/ui/PageHeaderSelect";
import type { AnalyticsScreenState } from "@/screens/analytics/model/useAnalyticsScreen";

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
