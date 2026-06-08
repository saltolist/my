"use client";

import { PageHeaderMenuButton } from "@/widgets/page-header";
import type { ContextMenuItem } from "@/shared/ui/context-menu-button";
import type { Post } from "@/shared/types";

export type PostContextMenuProps = {
  post: Post;
  onPublish: () => void;
  onSchedule: () => void;
  onDelete: () => void;
  "aria-label"?: string;
};

export function buildPostContextMenuItems({
  post,
  onPublish,
  onSchedule,
  onDelete,
}: PostContextMenuProps): ContextMenuItem[] {
  return [
    ...(post.status === "draft" || post.status === "scheduled"
      ? [
          { label: "Опубликовать", onClick: onPublish },
          {
            label: post.status === "scheduled" ? "Перенести публикацию" : "Запланировать",
            onClick: onSchedule,
          },
        ]
      : []),
    { label: "Удалить", onClick: onDelete, variant: "destructive" as const },
  ];
}

export function PostContextMenu(props: PostContextMenuProps) {
  const items = buildPostContextMenuItems(props);

  return (
    <PageHeaderMenuButton
      items={items}
      aria-label={props["aria-label"] ?? "Меню поста"}
    />
  );
}
