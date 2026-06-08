"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";

import { useUiStore } from "@/app/model/store";
import { screenFromPath } from "@/shared/config/routes";
import { Sheet, SheetContent } from "@/shared/ui/sheet";
import { MobileTopbar } from "@/widgets/app-shell/ui/MobileTopbar";
import { Sidebar } from "@/widgets/sidebar";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const mobileSidebarOpen = useUiStore((s) => s.mobileSidebarOpen);
  const setMobileSidebarOpen = useUiStore((s) => s.setMobileSidebarOpen);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMobileSidebarOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [setMobileSidebarOpen]);

  useEffect(() => {
    const screen = screenFromPath(pathname ?? "/");
    document.body.dataset.screen = screen;
  }, [pathname]);

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-background">
      <div className="hidden h-full shrink-0 min-[761px]:block">
        <Sidebar />
      </div>

      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent side="left" showCloseButton className="w-[15.5rem] max-w-[85vw] p-0 sm:max-w-sm">
          <Sidebar onNavigate={() => setMobileSidebarOpen(false)} className="border-0" />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <MobileTopbar />
        <main className="min-h-0 flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
