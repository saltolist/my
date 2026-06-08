import { Brain } from "lucide-react";

import { Badge } from "@/shared/ui/badge";

type AiContextBadgeProps = {
  ai: boolean;
};

export function AiContextBadge({ ai }: AiContextBadgeProps) {
  if (!ai) return null;

  return (
    <Badge variant="secondary" className="gap-1">
      <Brain className="size-3" />
      ИИ
    </Badge>
  );
}
