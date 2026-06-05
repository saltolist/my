"use client";

import DraftsCardStack from "@/widgets/feed/ui/drafts/DraftsCardStack";
import { useDraftsSection } from "@/features/manage-drafts/model/useDraftsSection";
import type { Post } from "@/shared/types";

export default function DraftsSection({ drafts }: { drafts: Post[] }) {
  const ds = useDraftsSection(drafts);

  return (
    <div className="feed-section">
      <div className="section-label">Черновики</div>
      <DraftsCardStack
        containerRef={ds.containerRef}
        cardRefs={ds.cardRefs}
        draggingId={ds.draggingId}
        gapHeight={ds.gapHeight}
        displayItems={ds.displayItems}
        onDraftsDragOver={ds.onDraftsDragOver}
        onDrop={ds.onDrop}
        onDragStart={ds.onDragStart}
        onDragEnd={ds.onDragEnd}
        onOpenPost={ds.openPost}
      />
    </div>
  );
}
