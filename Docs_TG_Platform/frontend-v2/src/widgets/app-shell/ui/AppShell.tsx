"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";

import { useUiStore } from "@/app/model/store";
import { screenFromPath } from "@/shared/config/routes";
import { cn } from "@/shared/lib/utils";
import { Sidebar } from "@/widgets/sidebar";
import { MobileTopbar } from "./MobileTopbar";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const mobileSidebarOpen = useUiStore((s) => s.mobileSidebarOpen);
  const setMobileSidebarOpen = useUiStore((s) => s.setMobileSidebarOpen);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setMobileSidebarOpen(false);
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

      {mobileSidebarOpen ? (
        <button
          type="button"
          aria-label="Закрыть меню"
          className="fixed inset-0 z-40 bg-black/40 min-[761px]:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      ) : null}

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 min-[761px]:hidden",
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full",
          "transition-transform duration-200 ease-out",
        )}
      >
        <Sidebar onNavigate={() => setMobileSidebarOpen(false)} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <MobileTopbar />
        <main className="min-h-0 flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
