import { Brain, Search } from "lucide-react";
import { CopyButton } from "@/shared/ui/copy-button";
import type { AiVariant } from "@/shared/types";

type AiMessageToolbarProps = {
  text: string;
  llmLabel?: string;
  webLabel?: string;
  activeVariant?: AiVariant;
};

export function AiMessageToolbar({
  text,
  llmLabel,
  webLabel,
  activeVariant,
}: AiMessageToolbarProps) {
  const shownLlm = llmLabel ?? activeVariant?.llmCaption;
  const shownWeb = webLabel ?? activeVariant?.webCaption;

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      {shownLlm ? (
        <span className="inline-flex items-center gap-1">
          <Brain className="size-3" />
          {shownLlm}
        </span>
      ) : null}
      {shownWeb ? (
        <span className="inline-flex items-center gap-1">
          <Search className="size-3" />
          {shownWeb}
        </span>
      ) : null}
      <div className="flex-1" />
      <CopyButton text={text} className="size-7" />
    </div>
  );
}
