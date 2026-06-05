"use client";

import PostCard from "@/components/feed/PostCard";
import type { DraftDisplayItem } from "@/lib/drafts/draftDnDUtils";
import type { Post } from "@/lib/types";
import type { DragEvent as ReactDragEvent, RefObject } from "react";

type Props = {
  containerRef: RefObject<HTMLDivElement | null>;
  cardRefs: RefObject<Map<number, HTMLDivElement>>;
  draggingId: number | null;
  gapHeight: number;
  displayItems: DraftDisplayItem[];
  onDraftsDragOver: (e: ReactDragEvent) => void;
  onDrop: (e: ReactDragEvent) => void;
  onDragStart: (id: number) => (e: ReactDragEvent) => void;
  onDragEnd: () => void;
  onOpenPost: (id: number) => void;
};

export default function DraftsCardStack({
  containerRef,
  cardRefs,
  draggingId,
  gapHeight,
  displayItems,
  onDraftsDragOver,
  onDrop,
  onDragStart,
  onDragEnd,
  onOpenPost,
}: Props) {
  return (
    <div
      className={`feed-section-cards draft-cards-stack${draggingId != null ? " draft-cards-stack--dragging" : ""}`}
      ref={containerRef}
      onDragOver={onDraftsDragOver}
      onDrop={onDrop}
    >
      {displayItems.map((item) =>
        item.kind === "gap" ? (
          <div key={item.key} className="draft-drop-gap" style={{ height: gapHeight }} aria-hidden />
        ) : (
          <DraftCardWrap
            key={item.post.id}
            post={item.post}
            cardRefs={cardRefs}
            onOpen={() => onOpenPost(item.post.id)}
            onDragStart={onDragStart(item.post.id)}
            onDragEnd={onDragEnd}
          />
        ),
      )}
    </div>
  );
}

function DraftCardWrap({
  post,
  cardRefs,
  onOpen,
  onDragStart,
  onDragEnd,
}: {
  post: Post;
  cardRefs: RefObject<Map<number, HTMLDivElement>>;
  onOpen: () => void;
  onDragStart: (e: ReactDragEvent) => void;
  onDragEnd: () => void;
}) {
  return (
    <div
      className="draft-card-wrap"
      ref={(el) => {
        if (el) cardRefs.current.set(post.id, el);
        else cardRefs.current.delete(post.id);
      }}
      data-draft-id={post.id}
    >
      <PostCard
        post={post}
        onOpen={onOpen}
        draftHandleProps={{
          onClickStop: (ev) => ev.stopPropagation(),
          onDragStart,
          onDragEnd,
        }}
      />
    </div>
  );
}
