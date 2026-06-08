import { Badge } from "@/shared/ui/badge";
import type { PostReaction } from "@/shared/types";

type ReactionPillsProps = {
  reactions: PostReaction[];
};

export function ReactionPills({ reactions }: ReactionPillsProps) {
  if (!reactions.length) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {reactions.map((r, i) => (
        <Badge key={`${r.emoji}-${i}`} variant="secondary" className="gap-1 px-2 font-normal">
          <span aria-hidden>{r.emoji}</span>
          <span>{r.count}</span>
        </Badge>
      ))}
    </div>
  );
}
