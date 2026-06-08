"use client";

import { DraftsSection } from "@/widgets/feed";
import FeedComposer from "@/screens/feed/ui/FeedComposer";
import FeedPublishedSection from "@/screens/feed/ui/FeedPublishedSection";
import FeedScheduledSection from "@/screens/feed/ui/FeedScheduledSection";
import FeedScreenHeader from "@/screens/feed/ui/FeedScreenHeader";
import { useFeedScreen } from "@/screens/feed/model/useFeedScreen";

export default function FeedScreen() {
  const { data, ui, actions } = useFeedScreen();

  return (
    <div className={`feed-screen-wrap${ui.layoutClassName}`} style={ui.layoutStyle}>
      <FeedScreenHeader ui={ui} actions={actions} />
      <div className="feed-layout">
        <div className="composer-scroll-wrap">
          <div className="feed-scroll" id="feed-scroll" ref={ui.feedScrollRef}>
            <div className="composer-scroll-body">
              <div className="feed-inner">
                <FeedPublishedSection
                  groups={data.publishedDayGroups}
                  onOpen={actions.openPost}
                  onOpenComments={actions.openPostComments}
                />
                <FeedScheduledSection posts={data.scheduled} onOpen={actions.openPost} />
                <DraftsSection drafts={data.drafts} />
              </div>
            </div>
          </div>
        </div>
        <FeedComposer ui={ui} actions={actions} />
      </div>
    </div>
  );
}
