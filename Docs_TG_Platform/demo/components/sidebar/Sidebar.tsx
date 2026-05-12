"use client";

import { useApp } from "@/state/AppContext";
import type { ScreenId } from "@/lib/types";

const NAV_MAP: Record<string, ScreenId> = {
  feed: "feed",
  post: "feed",
  note: "notes",
  chats: "chats",
  notes: "notes",
  analytics: "analytics",
  profile: "profile",
};

export default function Sidebar() {
  const { state, navigate, goHome } = useApp();
  const activeNav = NAV_MAP[state.screen];

  return (
    <nav id="sidebar">
      <div className="sidebar-logo" onClick={goHome}>
        <div className="logo-mark">TG</div>
        <div className="logo-name">TG Platform</div>
      </div>

      <button className="new-chat-btn" onClick={goHome} type="button">
        <span>＋</span> Новый чат
      </button>

      <div className="nav-items">
        <NavItem id="feed" label="Лента" icon="📋" active={activeNav === "feed"} onClick={() => navigate("feed")} />
        <NavItem id="chats" label="Чаты" icon="🗂" active={activeNav === "chats"} onClick={() => navigate("chats")} />
        <NavItem id="notes" label="Заметки" icon="📝" active={activeNav === "notes"} onClick={() => navigate("notes")} />
        <NavItem
          id="analytics"
          label="Аналитика"
          icon="📊"
          active={activeNav === "analytics"}
          onClick={() => navigate("analytics")}
        />
      </div>

      <div className="sidebar-bottom">
        <NavItem
          id="profile"
          label="Профиль"
          icon="⚙️"
          active={activeNav === "profile"}
          onClick={() => navigate("profile")}
        />
      </div>
    </nav>
  );
}

function NavItem({
  id,
  label,
  icon,
  active,
  onClick,
}: {
  id: string;
  label: string;
  icon: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <div id={`nav-${id}`} className={`nav-item${active ? " active" : ""}`} onClick={onClick}>
      <span className="nav-icon">{icon}</span> {label}
    </div>
  );
}
