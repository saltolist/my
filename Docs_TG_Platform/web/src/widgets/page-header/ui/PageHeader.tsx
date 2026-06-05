"use client";

import PageHeaderCenter from "@/widgets/page-header/ui/parts/PageHeaderCenter";
import PageHeaderLeft from "@/widgets/page-header/ui/parts/PageHeaderLeft";
import PageHeaderRight from "@/widgets/page-header/ui/parts/PageHeaderRight";
import { usePageHeader, type PageHeaderProps } from "@/widgets/page-header/model/usePageHeader";

export type { PageHeaderProps };

export default function PageHeader(props: PageHeaderProps) {
  const h = usePageHeader(props);

  return (
    <div ref={h.headerRef} className={h.headerClassName}>
      <PageHeaderLeft
        leftRef={h.mobileSearchLeftRef}
        title={h.title}
        left={h.left}
        showTitle={!h.mobileSearchOpen || h.compactSearch}
        showLeft={!h.mobileSearchOpen}
      />
      <PageHeaderCenter
        mobileOverlaySearch={h.mobileOverlaySearch}
        compactSearch={h.compactSearch}
        mobileSearchOpen={h.mobileSearchOpen}
        expandableSearchContent={h.expandableSearchContent}
        mobileSearchWrapRef={h.mobileSearchWrapRef}
        center={h.center}
        search={h.search}
      />
      <PageHeaderRight
        isMobile={h.isMobile}
        showMobileRight={h.showMobileRight}
        compactSearch={h.compactSearch}
        showSearchToggle={h.showSearchToggle}
        mobileSearchOpen={h.mobileSearchOpen}
        setMobileSearchOpen={h.setMobileSearchOpen}
        showCompactToolbarSelect={h.showCompactToolbarSelect}
        trailingDesktopSelect={h.trailingDesktopSelect}
        mobileSelect={h.mobileSelect}
        mobileSelectWrapRef={h.mobileSelectWrapRef}
        handleBack={h.handleBack}
        backLabel={h.backLabel}
        actions={h.actions}
        overflowItems={h.overflowItems}
        hasTrailingToolbar={h.hasTrailingToolbar}
      />
    </div>
  );
}
