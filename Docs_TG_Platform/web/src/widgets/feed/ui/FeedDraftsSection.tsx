"use client";

import type { Post } from "@/shared/types";
import PostCard from "./PostCard";

type Props = {
  drafts: Post[];
  onOpen: (id: number) => void;
};

export function FeedDraftsSection({ drafts, onOpen }: Props) {
  if (drafts.length === 0) return null;

  return (
    <div className="feed-section">
      <div className="section-label">Черновики</div>
      <div className="feed-section-cards">
        {drafts.map((post) => (
          <PostCard key={post.id} post={post} onOpen={() => onOpen(post.id)} />
        ))}
      </div>
    </div>
  );
}
