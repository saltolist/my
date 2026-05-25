"use client";

import { Suspense, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useApp } from "@/state/AppContext";
import Sidebar from "./sidebar/Sidebar";
import RouteSync from "./RouteSync";
import { screenFromPath } from "@/lib/routes";

function RouteSyncGate() {
  return (
    <Suspense fallback={null}>
      <RouteSync />
    </Suspense>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { mobileSidebarOpen, setMobileSidebarOpen } = useApp();
  const pathname = usePathname();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMobileSidebarOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [setMobileSidebarOpen]);

  useEffect(() => {
    document.body.classList.toggle("mobile-sidebar-open", mobileSidebarOpen);
  }, [mobileSidebarOpen]);

  useEffect(() => {
    const screen = screenFromPath(pathname ?? "/");
    document.body.dataset.screen = screen;
  }, [pathname]);

  return (
    <div id="app">
      <RouteSyncGate />
      <div
        className="mobile-sidebar-backdrop"
        onClick={() => setMobileSidebarOpen(false)}
      />
      <Sidebar />
      <div id="main">
        <div className="screen active" id={`screen-${screenFromPath(pathname ?? "/")}`}>
          {children}
        </div>
      </div>
    </div>
  );
}
