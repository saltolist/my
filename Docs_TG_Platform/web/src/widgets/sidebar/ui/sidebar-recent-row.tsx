"use client";

export type SidebarRecentRowItem = {
  key: string;
  title: string;
  active?: boolean;
  onOpen: () => void;
};

type SidebarRecentRowProps = {
  item: SidebarRecentRowItem;
};

export function SidebarRecentRow({ item }: SidebarRecentRowProps) {
  return (
    <div className={`nav-recent-chat-row${item.active ? " active" : ""}`}>
      <button type="button" className="nav-recent-chat" onClick={item.onOpen}>
        <span className="nav-recent-chat-title">{item.title}</span>
      </button>
    </div>
  );
}
