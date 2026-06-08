"use client";

import { cn } from "@/shared/lib/utils";
import { ContextMenuButton } from "@/shared/ui/context-menu-button";

export type SidebarRecentRowItem = {
  key: string;
  title: string;
  active?: boolean;
  onOpen: () => void;
};

type SidebarRecentRowProps = {
  item: SidebarRecentRowItem;
  menuItems?: { label: string; onClick: () => void }[];
};

export function SidebarRecentRow({ item, menuItems = [] }: SidebarRecentRowProps) {
  return (
    <div className="group flex items-center gap-1 rounded-md pr-1 hover:bg-sidebar-accent/50">
      <button
        type="button"
        onClick={item.onOpen}
        className={cn(
          "min-w-0 flex-1 truncate px-2 py-1.5 text-left text-xs transition-colors",
          item.active ? "font-medium text-foreground" : "text-muted-foreground hover:text-foreground",
        )}
      >
        {item.title}
      </button>
      {menuItems.length > 0 ? (
        <ContextMenuButton
          items={menuItems}
          aria-label="Действия"
          size="icon-xs"
          triggerClassName="opacity-0 group-hover:opacity-100"
          contentClassName="min-w-[8rem]"
        />
      ) : null}
    </div>
  );
}
