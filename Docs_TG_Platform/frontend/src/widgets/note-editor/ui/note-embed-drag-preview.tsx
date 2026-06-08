"use client";

/**
 * Placeholder for inline embed drag preview (images, files in note body).
 * Full embed UI will replace this in a later phase.
 */
type NoteEmbedDragPreviewProps = {
  visible?: boolean;
  label?: string;
};

export function NoteEmbedDragPreview({
  visible = false,
  label = "Перетаскивание…",
}: NoteEmbedDragPreviewProps) {
  if (!visible) return null;

  return (
    <div
      className="pointer-events-none fixed z-50 rounded-md border bg-background/95 px-3 py-2 text-sm shadow-md"
      aria-hidden
    >
      {label}
    </div>
  );
}
