import { X } from "lucide-react";

import type { ComposerAttachment } from "@/shared/types";
import { Badge } from "@/shared/ui/badge";

type ComposerChipProps = {
  attachment: ComposerAttachment;
  onRemove: () => void;
};

export function ComposerChip({ attachment, onRemove }: ComposerChipProps) {
  const label =
    attachment.kind === "post"
      ? attachment.title
      : attachment.kind === "file"
        ? attachment.name
        : attachment.media;

  return (
    <Badge variant="secondary" className="gap-1 pr-1">
      <span className="max-w-[140px] truncate">{label}</span>
      <button
        type="button"
        className="rounded-sm p-0.5 hover:bg-muted"
        onClick={onRemove}
        aria-label="Удалить вложение"
      >
        <X className="size-3" />
      </button>
    </Badge>
  );
}
