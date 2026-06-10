"use client";

import { useSidebar } from "@/widgets/sidebar/model/useSidebar";
import { SidebarNavItem } from "@/widgets/sidebar/ui/SidebarNavItem";
import { NavIconProfile } from "@/shared/ui/nav-icons";
import { SidebarHeader } from "@/widgets/sidebar/ui/sidebar-header";
import { SidebarNav } from "@/widgets/sidebar/ui/sidebar-nav";

type SidebarInnerProps = {
  onNavigate?: () => void;
};

export function SidebarInner({ onNavigate }: SidebarInnerProps) {
  const sb = useSidebar({ onNavigate });

  return (
    <nav id="sidebar" className={sb.railActive ? "sidebar--collapsed" : undefined}>
      <SidebarHeader
        railActive={sb.railActive}
        railAllowed={sb.railAllowed}
        onGoHome={sb.goHome}
        onExpand={() => sb.setSidebarCollapsed(false)}
        onCollapse={() => sb.setSidebarCollapsed(true)}
      />

      <div className="nav-items">
        <SidebarNav sb={sb} />
      </div>

      <div className="sidebar-bottom">
        <SidebarNavItem
          id="profile"
          label="Профиль"
          icon={<NavIconProfile />}
          active={sb.isScreenActive("profile")}
          onClick={() => sb.navigateScreen("profile")}
        />
      </div>
    </nav>
  );
}
