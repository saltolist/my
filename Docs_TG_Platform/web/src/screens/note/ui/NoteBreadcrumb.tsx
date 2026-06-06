"use client";

import { postTitle } from "@/shared/lib/helpers";
import { Breadcrumb, type BreadcrumbItem } from "@/shared/ui/breadcrumb";
import type { ActiveNote, Post } from "@/shared/types";

type Props = {
  note: ActiveNote;
  parentPost: Post | null;
  onNavigateNotes: () => void;
  onNavigateFeed: () => void;
  onOpenPost: (postId: number) => void;
  titleLabel?: string;
};

export default function NoteBreadcrumb({
  note,
  parentPost,
  onNavigateNotes,
  onNavigateFeed,
  onOpenPost,
  titleLabel,
}: Props) {
  const title = titleLabel ?? (note.title || "Новая заметка");

  if (note.isGlobal) {
    return (
      <Breadcrumb
        items={[
          { label: "Заметки", onClick: onNavigateNotes },
          { label: title, current: true },
        ]}
      />
    );
  }

  const items: BreadcrumbItem[] = [{ label: "Лента", onClick: onNavigateFeed }];
  if (parentPost) {
    items.push({
      label: postTitle(parentPost),
      onClick: () => onOpenPost(note.postId),
      variant: "title",
    });
  }
  items.push({ label: title, current: true });

  return <Breadcrumb items={items} />;
}
