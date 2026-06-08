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
        menuBtnRef={h.menuBtnRef}
        title={h.title}
        left={h.left}
        showTitle={!h.mobileSearchOpen || !h.searchOverlayMode}
        showLeft={!(h.mobileSearchOpen && h.searchOverlayMode)}
      />
      <PageHeaderCenter
        mobileOverlaySearch={h.mobileOverlaySearch}
        compactSearch={h.compactSearch}
        compactSearchOverlay={h.compactSearchOverlay}
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
        overflowWrapRef={h.overflowWrapRef}
        headerRightRef={h.headerRightRef}
        searchToggleAnchorRef={h.searchToggleAnchorRef}
        hasTrailingToolbar={h.hasTrailingToolbar}
      />
    </div>
  );
}
