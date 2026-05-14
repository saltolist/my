"use client";

import type { PostMetrics } from "@/lib/types";

export function PostReactionPills({ reactions }: { reactions: PostMetrics["reactions"] }) {
  if (!reactions.length) return null;
  return (
    <div className="post-reactions-row">
      {reactions.map((r, i) => (
        <span key={`${r.emoji}-${i}`} className="post-reaction-pill">
          <span className="post-reaction-emoji" aria-hidden>
            {r.emoji}
          </span>
          <span className="post-reaction-count">{r.count}</span>
        </span>
      ))}
    </div>
  );
}

export function PostViewsReposts({ views, reposts }: Pick<PostMetrics, "views" | "reposts">) {
  return (
    <div className="post-metrics-views-reposts">
      <span className="post-metric-item" title="Просмотры">
        <span className="post-metric-ico" aria-hidden>
          👁
        </span>
        {views}
      </span>
      <span className="post-metric-item" title="Репосты">
        <span className="post-metric-ico" aria-hidden>
          ↗
        </span>
        {reposts}
      </span>
    </div>
  );
}
