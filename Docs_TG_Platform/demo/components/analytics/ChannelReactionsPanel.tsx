"use client";

import { PostReactionPills } from "@/components/feed/PostEngagement";
import type { PostReaction } from "@/lib/types";

const REACTIONS: PostReaction[] = [
  { emoji: "🔥", count: 412 },
  { emoji: "❤️", count: 134 },
  { emoji: "👍", count: 222 },
  { emoji: "🤔", count: 34 },
];

export default function ChannelReactionsPanel() {
  return (
    <div className="channel-reactions-panel" aria-label="Популярные реакции">
      <PostReactionPills reactions={REACTIONS} />
    </div>
  );
}
