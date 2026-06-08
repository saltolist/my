import { cn } from "@/shared/lib/utils";
import type { MediaAttachItem } from "@/features/attach-to-message";

type AttachMediaGridProps = {
  items: MediaAttachItem[];
  onSelect: (postId: number, mediaName: string) => void;
};

export function AttachMediaGrid({ items, onSelect }: AttachMediaGridProps) {
  if (items.length === 0) return null;

  const gridClass =
    items.length === 1
      ? "grid-cols-1"
      : items.length === 2
        ? "grid-cols-2"
        : items.length === 3
          ? "grid-cols-3"
          : items.length === 4
            ? "grid-cols-2"
            : "grid-cols-3 max-h-[180px] overflow-y-auto";

  return (
    <div className={cn("grid gap-1.5 p-1", gridClass)}>
      {items.map(({ postId, media }) => (
        <button
          key={`${postId}-${media.name}`}
          type="button"
          className="size-[72px] overflow-hidden rounded-md border hover:ring-2 hover:ring-primary/50"
          onClick={() => onSelect(postId, media.name)}
          title={media.name}
        >
          {media.type.startsWith("image/") ? (
            <img src={media.url} alt={media.name} className="size-full object-cover" />
          ) : (
            <span className="flex size-full items-center justify-center bg-muted px-1 text-center text-[10px] leading-tight">
              {media.name}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
