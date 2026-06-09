"use client";

import { SidebarFallback } from "@/widgets/sidebar/ui/sidebar-fallback";
import { SidebarInner } from "@/widgets/sidebar/ui/sidebar-inner";

type SidebarProps = {
  className?: string;
  onNavigate?: () => void;
};

export function Sidebar(props: SidebarProps) {
  return <SidebarInner {...props} />;
}

export { SidebarFallback };
