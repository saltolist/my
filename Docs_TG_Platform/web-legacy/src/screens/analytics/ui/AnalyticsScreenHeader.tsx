"use client";

import { PageHeader, PageHeaderSelect } from "@/widgets/page-header";
import type { AnalyticsScreenState } from "@/screens/analytics/model/useAnalyticsScreen";

type Props = {
  ui: Pick<AnalyticsScreenState["ui"], "isMobile" | "periodSelectProps">;
};

export default function AnalyticsScreenHeader({ ui }: Props) {
  const { isMobile, periodSelectProps } = ui;

  return (
    <PageHeader
      title="Аналитика канала"
      backTo="home"
      mobileSelect={isMobile ? <PageHeaderSelect {...periodSelectProps} /> : undefined}
    />
  );
}
