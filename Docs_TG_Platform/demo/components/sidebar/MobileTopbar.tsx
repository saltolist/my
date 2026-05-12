"use client";

import { useApp } from "@/state/AppContext";

export default function MobileTopbar() {
  const { setMobileSidebarOpen, goHome } = useApp();
  return (
    <header className="mobile-topbar">
      <button
        className="mobile-menu-btn"
        type="button"
        onClick={() => setMobileSidebarOpen(true)}
        aria-label="Открыть меню"
      >
        ☰
      </button>
      <button className="mobile-brand" type="button" onClick={goHome}>
        <span className="mobile-brand-mark">TG</span>
        <span>TG Platform</span>
      </button>
    </header>
  );
}
