"use client";

import DraftsSection from "@/components/feed/DraftsSection";
import FeedComposer from "@/components/screens/feed/FeedComposer";
import FeedPublishedSection from "@/components/screens/feed/FeedPublishedSection";
import FeedScheduledSection from "@/components/screens/feed/FeedScheduledSection";
import FeedScreenHeader from "@/components/screens/feed/FeedScreenHeader";
import { useFeedScreen } from "@/lib/hooks/useFeedScreen";

export default function FeedScreen() {
  const feed = useFeedScreen();

  return (
    <div className={`feed-screen-wrap${feed.layoutClassName}`} style={feed.layoutStyle}>
      <FeedScreenHeader {...feed} />
      <div className="feed-layout">
        <div className="composer-scroll-wrap">
          <div className="feed-scroll" id="feed-scroll" ref={feed.feedScrollRef}>
            <div className="composer-scroll-body">
              <div className="feed-inner">
                <FeedPublishedSection
                  groups={feed.publishedDayGroups}
                  onOpen={feed.openPost}
                  onOpenComments={feed.openPostComments}
                />
                <FeedScheduledSection posts={feed.scheduled} onOpen={feed.openPost} />
                <DraftsSection drafts={feed.drafts} />
              </div>
            </div>
          </div>
        </div>
        <FeedComposer {...feed} />
      </div>
    </div>
  );
}
