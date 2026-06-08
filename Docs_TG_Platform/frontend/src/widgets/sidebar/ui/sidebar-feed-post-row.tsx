"use client";

import { cn } from "@/shared/lib/utils";
import { postTitle } from "@/shared/lib/postTitle";
import { ContextMenuButton } from "@/shared/ui/context-menu-button";
import type { Post } from "@/shared/types";

type SidebarFeedPostRowProps = {
  post: Post;
  isFullActive: boolean;
  isSubActive: boolean;
  onOpen: () => void;
  menuItems?: { label: string; onClick: () => void }[];
};

export function SidebarFeedPostRow({
  post,
  isFullActive,
  isSubActive,
  onOpen,
  menuItems = [{ label: "Открыть", onClick: onOpen }],
}: SidebarFeedPostRowProps) {
  const title = postTitle(post);

  return (
    <div className="group flex items-center gap-1 rounded-md pl-7 pr-1 hover:bg-sidebar-accent/50">
      <button
        type="button"
        onClick={onOpen}
        className={cn(
          "min-w-0 flex-1 truncate px-2 py-1.5 text-left text-xs transition-colors",
          isFullActive
            ? "font-medium text-foreground"
            : isSubActive
              ? "text-foreground/90"
              : "text-muted-foreground hover:text-foreground",
        )}
      >
        {title}
      </button>
      {menuItems.length > 0 ? (
        <ContextMenuButton
          items={menuItems}
          aria-label="Действия поста"
          size="icon-xs"
          triggerClassName="opacity-0 group-hover:opacity-100"
          contentClassName="min-w-[8rem]"
        />
      ) : null}
    </div>
  );
}
