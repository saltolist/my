import type { PostMedia } from "@/shared/types";
import { cn } from "@/shared/lib/utils";

type PostMediaBlockProps = {
  media: PostMedia;
  className?: string;
};

export function PostMediaBlock({ media, className }: PostMediaBlockProps) {
  return (
    <div className={cn("overflow-hidden rounded-lg border bg-muted/30", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={media.url}
        alt={media.name}
        className="aspect-video w-full object-cover"
      />
    </div>
  );
}
