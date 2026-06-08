import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/shared/ui/button";

type ChatBranchNavProps = {
  branchIdx: number;
  branchCount: number;
  onBranchChange: (branchIdx: number) => void;
};

export function ChatBranchNav({ branchIdx, branchCount, onBranchChange }: ChatBranchNavProps) {
  if (branchCount <= 1) return null;

  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="size-6"
        disabled={branchIdx <= 0}
        aria-label="Предыдущая версия"
        onClick={() => onBranchChange(branchIdx - 1)}
      >
        <ChevronLeft className="size-3.5" />
      </Button>
      <span>
        {branchIdx + 1} / {branchCount}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="size-6"
        disabled={branchIdx >= branchCount - 1}
        aria-label="Следующая версия"
        onClick={() => onBranchChange(branchIdx + 1)}
      >
        <ChevronRight className="size-3.5" />
      </Button>
    </div>
  );
}
