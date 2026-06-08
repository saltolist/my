"use client";

import { NoteIconAttach } from "@/widgets/note-editor";
import { isImageMedia, isVideoMedia } from "@/shared/lib/helpers";
import type { PostMedia } from "@/shared/types";

type GridItem = { media: PostMedia; title: string; onPick: () => void };

export function AttachMediaGrid({ items }: { items: GridItem[] }) {
  if (items.length === 0) return <div className="ctx-item disabled">Нет медиа</div>;
  const n = items.length;
  const cols = n === 1 ? 1 : n === 2 ? 2 : n === 4 ? 2 : 3;
  return (
    <div
      className="attach-media-grid"
      data-count={n}
      style={{ gridTemplateColumns: `repeat(${cols}, 72px)` }}
    >
      {items.map((it, i) => (
        <button
          key={`${it.media.name}-${i}`}
          type="button"
          className="attach-media-thumb"
          title={it.title}
          onClick={(e) => {
            e.stopPropagation();
            it.onPick();
          }}
        >
          <AttachMediaThumbInner media={it.media} />
        </button>
      ))}
    </div>
  );
}

function AttachMediaThumbInner({ media }: { media: PostMedia }) {
  if (isImageMedia(media) && media.url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img className="attach-media-thumb-img" src={media.url} alt={media.name} />;
  }
  if (isVideoMedia(media) && media.url) {
    return (
      <video
        className="attach-media-thumb-img"
        src={media.url}
        muted
        playsInline
        preload="metadata"
      />
    );
  }
  return (
    <span className="attach-media-thumb-doc" aria-hidden="true">
      <NoteIconAttach size={22} />
    </span>
  );
}
