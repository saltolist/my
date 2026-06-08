import { Eye, MessageCircle, Repeat2 } from "lucide-react";
import type { PostMetrics } from "@/shared/types";

type PostMetricsRowProps = {
  metrics: PostMetrics;
  commentsCount?: number;
  onCommentsClick?: () => void;
};

export function PostMetricsRow({
  metrics,
  commentsCount = 0,
  onCommentsClick,
}: PostMetricsRowProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
      <span className="inline-flex items-center gap-1" title="Просмотры">
        <Eye className="size-3.5" />
        {metrics.views}
      </span>
      <span className="inline-flex items-center gap-1" title="Репосты">
        <Repeat2 className="size-3.5" />
        {metrics.reposts}
      </span>
      {commentsCount > 0 ? (
        <button
          type="button"
          className="inline-flex items-center gap-1 hover:text-foreground"
          title="Комментарии"
          onClick={(e) => {
            e.stopPropagation();
            onCommentsClick?.();
          }}
        >
          <MessageCircle className="size-3.5" />
          {commentsCount}
        </button>
      ) : null}
    </div>
  );
}
