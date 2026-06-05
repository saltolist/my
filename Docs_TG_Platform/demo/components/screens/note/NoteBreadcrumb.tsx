"use client";

import { postTitle } from "@/lib/helpers";
import type { ActiveNote, Post } from "@/lib/types";

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
      <div className="breadcrumb">
        <span className="bc-link" onClick={onNavigateNotes}>
          Заметки
        </span>
        <span className="bc-sep">/</span>
        <span className="crumb-current">{title}</span>
      </div>
    );
  }

  return (
    <div className="breadcrumb">
      <span className="bc-link" onClick={onNavigateFeed}>
        Лента
      </span>
      <span className="bc-sep">/</span>
      {parentPost ? (
        <>
          <span className="bc-link bc-post-title" onClick={() => onOpenPost(note.postId)}>
            {postTitle(parentPost)}
          </span>
          <span className="bc-sep">/</span>
        </>
      ) : null}
      <span className="crumb-current">{title}</span>
    </div>
  );
}
