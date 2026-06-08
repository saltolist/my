import type { ComposerAttachment } from "@/shared/types";

import { ComposerChip } from "./composer-chip";

type AttachmentChipsProps = {
  attachments: ComposerAttachment[];
  onRemove: (id: string) => void;
};

export function AttachmentChips({ attachments, onRemove }: AttachmentChipsProps) {
  if (attachments.length === 0) return null;

  return (
    <div className="mb-2 flex flex-wrap gap-1.5">
      {attachments.map((att) => (
        <ComposerChip key={att.id} attachment={att} onRemove={() => onRemove(att.id)} />
      ))}
    </div>
  );
}
