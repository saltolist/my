"use client";

import { Suspense } from "react";

import { SidebarFallback } from "@/widgets/sidebar/ui/sidebar-fallback";
import { SidebarInner } from "@/widgets/sidebar/ui/sidebar-inner";

type SidebarProps = {
  className?: string;
  onNavigate?: () => void;
};

export function Sidebar(props: SidebarProps) {
  return (
    <Suspense fallback={<SidebarFallback className={props.className} />}>
      <SidebarInner {...props} />
    </Suspense>
  );
}
