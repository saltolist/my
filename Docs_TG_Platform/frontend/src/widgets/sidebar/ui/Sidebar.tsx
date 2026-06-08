"use client";

import { Suspense } from "react";

import { cn } from "@/shared/lib/utils";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { Separator } from "@/shared/ui/separator";
import { Skeleton } from "@/shared/ui/skeleton";
import { TooltipProvider } from "@/shared/ui/tooltip";
import { useSidebar } from "@/widgets/sidebar/model/useSidebar";
import { SidebarNavItem } from "@/widgets/sidebar/ui/SidebarNavItem";
import { NavIconProfile } from "@/widgets/sidebar/ui/nav-icons";
import { SidebarHeader } from "@/widgets/sidebar/ui/sidebar-header";
import { SidebarNav } from "@/widgets/sidebar/ui/sidebar-nav";

type SidebarProps = {
  className?: string;
  onNavigate?: () => void;
};

function SidebarInner({ className, onNavigate }: SidebarProps) {
  const sb = useSidebar({ onNavigate });
  const showLabels = !sb.railActive;

  return (
    <TooltipProvider>
      <aside
        className={cn(
          "glass-sidebar flex h-full flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground",
          sb.railActive ? "w-[4.25rem]" : "w-[15.5rem]",
          className,
        )}
      >
        <SidebarHeader
          railActive={sb.railActive}
          railAllowed={sb.railAllowed}
          onGoHome={sb.goHome}
          onExpand={() => sb.setSidebarCollapsed(false)}
          onCollapse={() => sb.setSidebarCollapsed(true)}
        />

        <ScrollArea className="min-h-0 flex-1">
          <SidebarNav sb={sb} showLabels={showLabels} />
        </ScrollArea>

        <div className="mt-auto shrink-0 p-2">
          <Separator className="mb-2" />
          <SidebarNavItem
            label="Профиль"
            icon={<NavIconProfile />}
            active={sb.isScreenActive("profile")}
            onClick={() => sb.navigateScreen("profile")}
            showLabel={showLabels}
          />
        </div>
      </aside>
    </TooltipProvider>
  );
}

function SidebarFallback({ className }: { className?: string }) {
  return (
    <aside
      className={cn(
        "flex h-full w-[15.5rem] flex-col gap-2 border-r border-sidebar-border bg-sidebar p-3",
        className,
      )}
    >
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-full" />
    </aside>
  );
}

export function Sidebar(props: SidebarProps) {
  return (
    <Suspense fallback={<SidebarFallback className={props.className} />}>
      <SidebarInner {...props} />
    </Suspense>
  );
}
