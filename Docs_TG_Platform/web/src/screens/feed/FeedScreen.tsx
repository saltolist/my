"use client";

import { useNavigationStore, useUiStore } from "@/app/model/store";
import { useMobile760 } from "@/shared/lib/hooks/useMobile760";
import { useScreenBack } from "@/shared/lib/hooks/useScreenBack";
import { FeedComposer } from "@/screens/feed/ui/FeedComposer";
import { FeedPublishedSection } from "@/screens/feed/ui/FeedPublishedSection";
import { FeedScheduledSection } from "@/screens/feed/ui/FeedScheduledSection";
import { useFeedScreen } from "@/screens/feed/model/useFeedScreen";
import { FeedDraftsSection } from "@/widgets/feed";
import {
  createFeedHeaderSearchRow,
  createFeedPostWidthSelect,
} from "@/widgets/feed/ui/feed-header-toolbar";
import { PageHeader } from "@/widgets/page-header";

export function FeedScreen() {
  const onBack = useScreenBack();
  const isMobile = useMobile760();
  const search = useNavigationStore((s) => s.feedSearch);
  const setFeedSearch = useNavigationStore((s) => s.setFeedSearch);
  const feedPostWidth = useUiStore((s) => s.feedCardWidth);
  const setFeedPostWidth = useUiStore((s) => s.setFeedCardWidth);
  const { data, ui, actions } = useFeedScreen();
  const {
    layoutClassName,
    layoutStyle,
    feedScrollRef,
    composerReady,
    taRef,
    draft,
    setDraft,
    pendingMedia,
  } = ui;
  const {
    openPost,
    openPostComments,
    submitDraft,
    removePendingMedia,
    handleDraftKeyDown,
    handleAttach,
  } = actions;

  return (
    <div className={`feed-screen-wrap${layoutClassName}`} style={layoutStyle}>
      <PageHeader
        title="Лента"
        onBack={onBack}
        compactSearchAtWidth={804}
        mobileSelect={
          isMobile
            ? undefined
            : createFeedPostWidthSelect({
                feedPostWidth,
                onFeedPostWidthChange: setFeedPostWidth,
              })
        }
        search={createFeedHeaderSearchRow({
          value: search,
          onChange: setFeedSearch,
          feedPostWidth,
          onFeedPostWidthChange: setFeedPostWidth,
        })}
      />
      <div className="feed-layout">
        <div className="composer-scroll-wrap">
          <div className="feed-scroll" id="feed-scroll" ref={feedScrollRef}>
            <div className="composer-scroll-body">
              <div className="feed-inner">
                {data.isLoading ? (
                  <p className="screen-placeholder">Загрузка ленты…</p>
                ) : data.isEmpty && search.trim() ? (
                  <p className="screen-placeholder">Ничего не найдено по запросу «{search.trim()}»</p>
                ) : (
                  <>
                    <FeedPublishedSection
                      groups={data.publishedDayGroups}
                      onOpen={openPost}
                      onOpenComments={openPostComments}
                    />
                    <FeedScheduledSection posts={data.scheduled} onOpen={openPost} />
                    <FeedDraftsSection drafts={data.drafts} onOpen={openPost} />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        <FeedComposer
          ui={{ composerReady, taRef, draft, setDraft, pendingMedia }}
          actions={{ submitDraft, removePendingMedia, handleDraftKeyDown, handleAttach }}
        />
      </div>
    </div>
  );
}
