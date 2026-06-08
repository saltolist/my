import { GripVertical } from "lucide-react";

type DraftDragHandleProps = {
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
};

export function DraftDragHandle({ onDragStart, onDragEnd }: DraftDragHandleProps) {
  return (
    <div
      className="flex cursor-grab items-center justify-center text-muted-foreground active:cursor-grabbing"
      draggable
      onClick={(e) => e.stopPropagation()}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      title="Перетащить"
    >
      <GripVertical className="size-4" />
    </div>
  );
}
