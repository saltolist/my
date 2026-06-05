"use client";

import DraftsSection from "@/widgets/feed/ui/DraftsSection";
import FeedComposer from "@/screens/feed/ui/FeedComposer";
import FeedPublishedSection from "@/screens/feed/ui/FeedPublishedSection";
import FeedScheduledSection from "@/screens/feed/ui/FeedScheduledSection";
import FeedScreenHeader from "@/screens/feed/ui/FeedScreenHeader";
import { useFeedScreen } from "@/screens/feed/model/useFeedScreen";

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
