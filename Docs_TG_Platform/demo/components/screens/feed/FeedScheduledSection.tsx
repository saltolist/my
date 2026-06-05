"use client";

import PostCard from "@/components/feed/PostCard";
import type { Post } from "@/lib/types";

type Props = {
  posts: Post[];
  onOpen: (id: number) => void;
};

export default function FeedScheduledSection({ posts, onOpen }: Props) {
  return (
    <div className="feed-section">
      <div className="section-label">Отложенные</div>
      <div className="feed-section-cards">
        {posts.map((p) => (
          <PostCard key={p.id} post={p} onOpen={() => onOpen(p.id)} />
        ))}
      </div>
    </div>
  );
}
