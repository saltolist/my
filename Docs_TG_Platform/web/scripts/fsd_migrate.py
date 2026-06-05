#!/usr/bin/env python3
"""
One-shot migration to FSD layout under src/.
Run from web/: python3 scripts/fsd_migrate.py
"""

from __future__ import annotations

import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "src"

# old relative to ROOT -> new relative to SRC
MOVES: list[tuple[str, str]] = [
    # ── app: Next.js + styles ──
    ("app/layout.tsx", "app/layout.tsx"),
    ("app/(shell)", "app/(shell)"),
    ("app/globals.css", "app/styles/globals.css"),
    ("app/profile.css", "app/styles/profile.css"),
    ("app/analytics.css", "app/styles/analytics.css"),
    ("app/post.css", "app/styles/post.css"),
    ("app/notes.css", "app/styles/notes.css"),
    ("app/feed.css", "app/styles/feed.css"),
    ("app/chats.css", "app/styles/chats.css"),
    ("app/gchat.css", "app/styles/gchat.css"),
    ("app/media.css", "app/styles/media.css"),
    # ── app: global store ──
    ("state", "app/model/store"),
    # ── shared ──
    ("lib/types.ts", "shared/types/index.ts"),
    ("lib/data.ts", "shared/data/demo-data.ts"),
    ("lib/routes.ts", "shared/lib/routes.ts"),
    ("lib/helpers.ts", "shared/lib/helpers.ts"),
    ("lib/floatingPanel.ts", "shared/lib/floatingPanel.ts"),
    ("lib/composer-config.ts", "shared/config/composer.ts"),
    ("lib/composerPointerDown.ts", "shared/lib/composerPointerDown.ts"),
    ("lib/replies.ts", "shared/lib/replies.ts"),
    ("lib/staticParams.ts", "shared/lib/staticParams.ts"),
    ("lib/chatPaths.ts", "shared/lib/chatPaths.ts"),
    ("lib/postComments.ts", "shared/lib/postComments.ts"),
    ("lib/postView.ts", "shared/lib/postView.ts"),
    ("lib/noteDraft.ts", "shared/lib/noteDraft.ts"),
    ("lib/noteEmbeds.ts", "shared/lib/noteEmbeds.ts"),
    ("lib/noteEmbeds", "shared/lib/noteEmbeds"),
    ("lib/feedTimeline.ts", "shared/lib/feedTimeline.ts"),
    ("lib/feedPostWidth.ts", "shared/lib/feedPostWidth.ts"),
    ("lib/contentAdaptWidth.ts", "shared/lib/contentAdaptWidth.ts"),
    ("lib/viewportZoomLock.ts", "shared/lib/viewportZoomLock.ts"),
    ("lib/routeLabels.ts", "shared/lib/routeLabels.ts"),
    ("lib/listContextFilter.ts", "shared/lib/listContextFilter.ts"),
    ("lib/omnichannel.ts", "shared/lib/omnichannel.ts"),
    ("lib/profileDiscard.ts", "shared/lib/profileDiscard.ts"),
    ("lib/profileTabs.ts", "shared/lib/profileTabs.ts"),
    ("lib/profileBreakpoints.ts", "shared/lib/profileBreakpoints.ts"),
    ("lib/platformModelFilters.ts", "shared/lib/platformModelFilters.ts"),
    ("lib/platformAnalyticsPeriods.ts", "shared/lib/platformAnalyticsPeriods.ts"),
    ("lib/analyticsDemoData.ts", "shared/lib/analyticsDemoData.ts"),
    ("lib/channelMetricsDb.ts", "shared/lib/channelMetricsDb.ts"),
    ("lib/channelAnalyticsTrend.ts", "shared/lib/channelAnalyticsTrend.ts"),
    ("lib/check-password-strength.ts", "shared/lib/check-password-strength.ts"),
    ("lib/format-telegram-phone.ts", "shared/lib/format-telegram-phone.ts"),
    ("lib/use-fit-title.ts", "shared/lib/use-fit-title.ts"),
    ("lib/use-profile-textarea-auto-resize.ts", "shared/lib/use-profile-textarea-auto-resize.ts"),
    ("lib/trendChart", "shared/lib/trendChart"),
    ("lib/profile", "shared/lib/profile"),
    ("lib/post", "shared/lib/post"),
    ("lib/drafts", "shared/lib/drafts"),
    # shared cross-cutting hooks
    ("lib/hooks/useFloatingPanelScrollListeners.ts", "shared/lib/hooks/useFloatingPanelScrollListeners.ts"),
    ("lib/hooks/useOverlayDismissOnPointer.ts", "shared/lib/hooks/useOverlayDismissOnPointer.ts"),
    ("lib/hooks/useMobile760.ts", "shared/lib/hooks/useMobile760.ts"),
    ("lib/hooks/usePreventIosInputZoom.ts", "shared/lib/hooks/usePreventIosInputZoom.ts"),
    ("lib/hooks/useDesktopBarTooltipPortal.ts", "shared/lib/hooks/useDesktopBarTooltipPortal.ts"),
    ("lib/hooks/useAnchoredBarRowTooltip.ts", "shared/lib/hooks/useAnchoredBarRowTooltip.ts"),
    ("lib/hooks/useChartSeriesVisibility.ts", "shared/lib/hooks/useChartSeriesVisibility.ts"),
    ("lib/hooks/useCompactHeader1000.ts", "shared/lib/hooks/useCompactHeader1000.ts"),
    # shared ui
    ("components/ContextMenu.tsx", "shared/ui/context-menu/ui/ContextMenu.tsx"),
    ("components/contextMenu", "shared/ui/context-menu"),
    ("components/composer/ModelPicker.tsx", "shared/ui/model-picker/ui/ModelPicker.tsx"),
    ("components/composer/ModelPickerDropdown.tsx", "shared/ui/model-picker/ui/ModelPickerDropdown.tsx"),
    ("components/composer/ModelPickerIcons.tsx", "shared/ui/model-picker/ui/ModelPickerIcons.tsx"),
    ("components/composer/modelPickerTypes.ts", "shared/ui/model-picker/model/types.ts"),
    ("components/composer/modelPickerUtils.ts", "shared/ui/model-picker/lib/utils.ts"),
    ("lib/hooks/useContextMenu.ts", "shared/ui/context-menu/model/useContextMenu.ts"),
    ("lib/hooks/useModelPicker.ts", "shared/ui/model-picker/model/useModelPicker.ts"),
    # widgets: app-shell
    ("components/AppShell.tsx", "widgets/app-shell/ui/AppShell.tsx"),
    ("components/RouteSync.tsx", "widgets/app-shell/ui/RouteSync.tsx"),
    ("components/ContentAdaptSync.tsx", "widgets/app-shell/ui/ContentAdaptSync.tsx"),
    # widgets: sidebar
    ("components/sidebar", "widgets/sidebar/ui"),
    ("lib/hooks/useSidebar.ts", "widgets/sidebar/model/useSidebar.ts"),
    # widgets: page-header
    ("components/PageHeader.tsx", "widgets/page-header/ui/PageHeader.tsx"),
    ("components/PageHeaderMenuButton.tsx", "widgets/page-header/ui/PageHeaderMenuButton.tsx"),
    ("components/PageHeaderOverflow.tsx", "widgets/page-header/ui/PageHeaderOverflow.tsx"),
    ("components/PageHeaderSearchInput.tsx", "widgets/page-header/ui/PageHeaderSearchInput.tsx"),
    ("components/PageHeaderSelect.tsx", "widgets/page-header/ui/PageHeaderSelect.tsx"),
    ("components/HeaderMenuIcons.tsx", "widgets/page-header/ui/HeaderMenuIcons.tsx"),
    ("components/pageHeader", "widgets/page-header/ui/parts"),
    ("lib/pageHeader", "widgets/page-header/lib"),
    ("lib/hooks/usePageHeader.ts", "widgets/page-header/model/usePageHeader.ts"),
    ("lib/hooks/usePageHeaderLe640.ts", "widgets/page-header/model/usePageHeaderLe640.ts"),
    ("lib/hooks/usePageHeaderLe650.ts", "widgets/page-header/model/usePageHeaderLe650.ts"),
    ("lib/hooks/usePageHeaderLe780.ts", "widgets/page-header/model/usePageHeaderLe780.ts"),
    ("lib/hooks/usePageHeaderLe1080.ts", "widgets/page-header/model/usePageHeaderLe1080.ts"),
    # widgets: composer
    ("components/composer/Composer.tsx", "widgets/composer/ui/Composer.tsx"),
    ("components/composer/ComposerToolbar.tsx", "widgets/composer/ui/ComposerToolbar.tsx"),
    ("components/composer/ComposerMentionDropdown.tsx", "widgets/composer/ui/ComposerMentionDropdown.tsx"),
    ("components/composer/AttachMenu.tsx", "widgets/composer/ui/AttachMenu.tsx"),
    ("components/composer/AttachHomeScopeMenu.tsx", "widgets/composer/ui/AttachHomeScopeMenu.tsx"),
    ("components/composer/AttachPostScopeMenu.tsx", "widgets/composer/ui/AttachPostScopeMenu.tsx"),
    ("components/composer/AttachMenuIcons.tsx", "widgets/composer/ui/AttachMenuIcons.tsx"),
    ("components/composer/attachMenuUtils.ts", "widgets/composer/lib/attachMenuUtils.ts"),
    ("components/composer/composerChipUtils.ts", "widgets/composer/lib/composerChipUtils.ts"),
    ("lib/hooks/useComposerEditor.ts", "widgets/composer/model/useComposerEditor.ts"),
    ("lib/hooks/useAttachMenu.ts", "widgets/composer/model/useAttachMenu.ts"),
    # widgets: charts
    ("components/charts", "widgets/charts/ui"),
    ("lib/hooks/useMultiSeriesTrendChart.ts", "widgets/charts/model/useMultiSeriesTrendChart.ts"),
    # entities: post
    ("components/post/PostMediaBlock.tsx", "entities/post/ui/PostMediaBlock.tsx"),
    ("components/post/PostStatusBadge.tsx", "entities/post/ui/PostStatusBadge.tsx"),
    ("components/feed/PostStatus.tsx", "entities/post/ui/PostStatus.tsx"),
    ("components/feed/PostMetricIcons.tsx", "entities/post/ui/PostMetricIcons.tsx"),
    # entities: chat / message
    ("components/chat/chatMessageTypes.ts", "entities/message/model/types.ts"),
    ("components/chat/chatMessageUtils.ts", "entities/message/lib/utils.ts"),
    ("components/chat/ChatMessageIcons.tsx", "entities/message/ui/MessageIcons.tsx"),
    ("components/chat/MessageRenameIcon.tsx", "entities/message/ui/MessageRenameIcon.tsx"),
    # widgets: chat-thread
    ("components/chat/ChatMessage.tsx", "widgets/chat-thread/ui/ChatMessage.tsx"),
    ("components/chat/ChatUserMessage.tsx", "widgets/chat-thread/ui/ChatUserMessage.tsx"),
    ("components/chat/ChatAiMessage.tsx", "widgets/chat-thread/ui/ChatAiMessage.tsx"),
    ("components/chat/ChatBranchNav.tsx", "widgets/chat-thread/ui/ChatBranchNav.tsx"),
    ("components/chat/ChatAiVariantNav.tsx", "widgets/chat-thread/ui/ChatAiVariantNav.tsx"),
    ("components/chat/AiMessageToolbar.tsx", "widgets/chat-thread/ui/AiMessageToolbar.tsx"),
    ("components/chat/ChatListCardMenu.tsx", "widgets/chat-thread/ui/ChatListCardMenu.tsx"),
    ("lib/hooks/useChatMessage.ts", "widgets/chat-thread/model/useChatMessage.ts"),
    # features
    ("components/post/postCtxMenu.tsx", "features/post-context-menu/ui/postCtxMenu.tsx"),
    ("components/post/buildPostCtxMenuItems.tsx", "features/post-context-menu/lib/buildItems.tsx"),
    ("components/post/SchedulePickerModal.tsx", "features/schedule-post/ui/SchedulePickerModal.tsx"),
    ("lib/hooks/usePostCtxMenu.tsx", "features/post-context-menu/model/usePostCtxMenu.tsx"),
    ("lib/hooks/useDraftsSection.ts", "features/manage-drafts/model/useDraftsSection.ts"),
    # widgets: feed
    ("components/feed", "widgets/feed/ui"),
    ("lib/hooks/useFeedScreen.tsx", "pages/feed/model/useFeedScreen.tsx"),
    ("lib/hooks/useFeedPostLayout.ts", "widgets/feed/model/useFeedPostLayout.ts"),
    # widgets: post-workspace + entities post components
    ("components/post", "widgets/post-workspace/ui"),
    ("lib/hooks/usePostWorkspace.tsx", "widgets/post-workspace/model/usePostWorkspace.tsx"),
    ("lib/hooks/usePostScreenHeader.tsx", "widgets/post-workspace/model/usePostScreenHeader.tsx"),
    ("lib/hooks/usePostHeaderCompact1200.ts", "widgets/post-workspace/model/usePostHeaderCompact1200.ts"),
    # pages (screens)
    ("components/screens/HomeScreen.tsx", "pages/home/ui/HomePage.tsx"),
    ("components/screens/feed", "pages/feed/ui"),
    ("components/screens/post", "pages/post/ui"),
    ("components/screens/note", "pages/note/ui"),
    ("components/screens/notes", "pages/notes/ui"),
    ("components/screens/chats", "pages/chats/ui"),
    ("components/screens/gchat", "pages/gchat/ui"),
    ("components/screens/analytics", "pages/analytics/ui"),
    ("components/screens/profile", "pages/profile/ui"),
    # screen hooks -> pages model
    ("lib/hooks/useGlobalChatScreen.tsx", "pages/gchat/model/useGlobalChatScreen.tsx"),
    ("lib/hooks/useChatsScreen.tsx", "pages/chats/model/useChatsScreen.tsx"),
    ("lib/hooks/useNotesScreen.tsx", "pages/notes/model/useNotesScreen.tsx"),
    ("lib/hooks/useNoteScreen.tsx", "pages/note/model/useNoteScreen.tsx"),
    ("lib/hooks/useNoteEditor.tsx", "pages/note/model/useNoteEditor.tsx"),
    ("lib/hooks/useAnalyticsScreen.tsx", "pages/analytics/model/useAnalyticsScreen.tsx"),
    ("lib/hooks/useProfileScreen.tsx", "pages/profile/model/useProfileScreen.tsx"),
    # widgets: note-editor
    ("components/note", "widgets/note-editor/ui"),
    ("lib/hooks/useNoteBodyEditor.ts", "widgets/note-editor/model/useNoteBodyEditor.ts"),
    # widgets: profile + analytics
    ("components/profile", "widgets/profile-settings/ui"),
    ("components/analytics", "widgets/analytics-dashboard/ui"),
    ("lib/hooks/useAiModelsBlock.ts", "widgets/profile-settings/model/useAiModelsBlock.ts"),
    ("lib/hooks/useChannelTab.ts", "widgets/profile-settings/model/useChannelTab.ts"),
    ("lib/hooks/useTelegramBlock.ts", "widgets/profile-settings/model/useTelegramBlock.ts"),
    ("lib/hooks/useUserBlock.ts", "widgets/profile-settings/model/useUserBlock.ts"),
    ("lib/hooks/usePlatformAnalyticsBlock.ts", "widgets/profile-settings/model/usePlatformAnalyticsBlock.ts"),
    # screen re-export stubs -> remove later
    ("components/screens/FeedScreen.tsx", "pages/feed/ui/FeedScreen.reexport.tsx"),
    ("components/screens/PostScreen.tsx", "pages/post/ui/PostScreen.reexport.tsx"),
    ("components/screens/NoteScreen.tsx", "pages/note/ui/NoteScreen.reexport.tsx"),
    ("components/screens/NotesScreen.tsx", "pages/notes/ui/NotesScreen.reexport.tsx"),
    ("components/screens/ChatsScreen.tsx", "pages/chats/ui/ChatsScreen.reexport.tsx"),
    ("components/screens/GlobalChatScreen.tsx", "pages/gchat/ui/GlobalChatScreen.reexport.tsx"),
    ("components/screens/AnalyticsScreen.tsx", "pages/analytics/ui/AnalyticsScreen.reexport.tsx"),
    ("components/screens/ProfileScreen.tsx", "pages/profile/ui/ProfileScreen.reexport.tsx"),
    ("data", "shared/data/json"),
]

# Import path replacements (order matters — longer first)
IMPORT_REPLACEMENTS: list[tuple[str, str]] = [
    ("@/state/navigation-provider", "@/app/model/store/navigation-provider"),
    ("@/state/navigation-store", "@/app/model/store/navigation-store"),
    ("@/state/composer-store", "@/app/model/store/composer-store"),
    ("@/state/domain-store", "@/app/model/store/domain-store"),
    ("@/state/ui-store", "@/app/model/store/ui-store"),
    ("@/state/navigation/", "@/app/model/store/navigation/"),
    ("@/state/domain/", "@/app/model/store/domain/"),
    ("@/state/composer/", "@/app/model/store/composer/"),
    ("@/state/", "@/app/model/store/"),
    ("@/components/contextMenu/", "@/shared/ui/context-menu/"),
    ("@/components/ContextMenu", "@/shared/ui/context-menu/ui/ContextMenu"),
    ("@/components/composer/ModelPicker", "@/shared/ui/model-picker/ui/ModelPicker"),
    ("@/components/composer/modelPicker", "@/shared/ui/model-picker/model/types"),
    ("@/components/composer/", "@/widgets/composer/ui/"),
    ("@/components/AppShell", "@/widgets/app-shell/ui/AppShell"),
    ("@/components/RouteSync", "@/widgets/app-shell/ui/RouteSync"),
    ("@/components/ContentAdaptSync", "@/widgets/app-shell/ui/ContentAdaptSync"),
    ("@/components/sidebar/", "@/widgets/sidebar/ui/"),
    ("@/components/pageHeader/", "@/widgets/page-header/ui/parts/"),
    ("@/components/PageHeader", "@/widgets/page-header/ui/PageHeader"),
    ("@/components/HeaderMenuIcons", "@/widgets/page-header/ui/HeaderMenuIcons"),
    ("@/components/charts/", "@/widgets/charts/ui/"),
    ("@/components/chat/", "@/widgets/chat-thread/ui/"),
    ("@/components/feed/", "@/widgets/feed/ui/"),
    ("@/components/post/", "@/widgets/post-workspace/ui/"),
    ("@/components/note/", "@/widgets/note-editor/ui/"),
    ("@/components/profile/", "@/widgets/profile-settings/ui/"),
    ("@/components/analytics/", "@/widgets/analytics-dashboard/ui/"),
    ("@/components/screens/gchat/", "@/pages/gchat/ui/"),
    ("@/components/screens/feed/", "@/pages/feed/ui/"),
    ("@/components/screens/post/", "@/pages/post/ui/"),
    ("@/components/screens/note/", "@/pages/note/ui/"),
    ("@/components/screens/notes/", "@/pages/notes/ui/"),
    ("@/components/screens/chats/", "@/pages/chats/ui/"),
    ("@/components/screens/analytics/", "@/pages/analytics/ui/"),
    ("@/components/screens/profile/", "@/pages/profile/ui/"),
    ("@/components/screens/HomeScreen", "@/pages/home/ui/HomePage"),
    ("@/components/screens/FeedScreen", "@/pages/feed/ui/FeedScreen"),
    ("@/components/screens/PostScreen", "@/pages/post/ui/PostScreen"),
    ("@/components/screens/NoteScreen", "@/pages/note/ui/NoteScreen"),
    ("@/components/screens/NotesScreen", "@/pages/notes/ui/NotesScreen"),
    ("@/components/screens/ChatsScreen", "@/pages/chats/ui/ChatsScreen"),
    ("@/components/screens/GlobalChatScreen", "@/pages/gchat/ui/GlobalChatScreen"),
    ("@/components/screens/AnalyticsScreen", "@/pages/analytics/ui/AnalyticsScreen"),
    ("@/components/screens/ProfileScreen", "@/pages/profile/ui/ProfileScreen"),
    ("@/lib/hooks/useContextMenu", "@/shared/ui/context-menu/model/useContextMenu"),
    ("@/lib/hooks/useModelPicker", "@/shared/ui/model-picker/model/useModelPicker"),
    ("@/lib/hooks/useSidebar", "@/widgets/sidebar/model/useSidebar"),
    ("@/lib/hooks/usePageHeader", "@/widgets/page-header/model/usePageHeader"),
    ("@/lib/hooks/useComposerEditor", "@/widgets/composer/model/useComposerEditor"),
    ("@/lib/hooks/useAttachMenu", "@/widgets/composer/model/useAttachMenu"),
    ("@/lib/hooks/useChatMessage", "@/widgets/chat-thread/model/useChatMessage"),
    ("@/lib/hooks/useFeedScreen", "@/pages/feed/model/useFeedScreen"),
    ("@/lib/hooks/usePostWorkspace", "@/widgets/post-workspace/model/usePostWorkspace"),
    ("@/lib/hooks/usePostScreenHeader", "@/widgets/post-workspace/model/usePostScreenHeader"),
    ("@/lib/hooks/usePostCtxMenu", "@/features/post-context-menu/model/usePostCtxMenu"),
    ("@/lib/hooks/useDraftsSection", "@/features/manage-drafts/model/useDraftsSection"),
    ("@/lib/hooks/useGlobalChatScreen", "@/pages/gchat/model/useGlobalChatScreen"),
    ("@/lib/hooks/useChatsScreen", "@/pages/chats/model/useChatsScreen"),
    ("@/lib/hooks/useNotesScreen", "@/pages/notes/model/useNotesScreen"),
    ("@/lib/hooks/useNoteScreen", "@/pages/note/model/useNoteScreen"),
    ("@/lib/hooks/useNoteEditor", "@/pages/note/model/useNoteEditor"),
    ("@/lib/hooks/useNoteBodyEditor", "@/widgets/note-editor/model/useNoteBodyEditor"),
    ("@/lib/hooks/useAnalyticsScreen", "@/pages/analytics/model/useAnalyticsScreen"),
    ("@/lib/hooks/useProfileScreen", "@/pages/profile/model/useProfileScreen"),
    ("@/lib/hooks/useAiModelsBlock", "@/widgets/profile-settings/model/useAiModelsBlock"),
    ("@/lib/hooks/useChannelTab", "@/widgets/profile-settings/model/useChannelTab"),
    ("@/lib/hooks/useTelegramBlock", "@/widgets/profile-settings/model/useTelegramBlock"),
    ("@/lib/hooks/useUserBlock", "@/widgets/profile-settings/model/useUserBlock"),
    ("@/lib/hooks/usePlatformAnalyticsBlock", "@/widgets/profile-settings/model/usePlatformAnalyticsBlock"),
    ("@/lib/hooks/useMultiSeriesTrendChart", "@/widgets/charts/model/useMultiSeriesTrendChart"),
    ("@/lib/hooks/useFeedPostLayout", "@/widgets/feed/model/useFeedPostLayout"),
    ("@/lib/hooks/useFloatingPanelScrollListeners", "@/shared/lib/hooks/useFloatingPanelScrollListeners"),
    ("@/lib/hooks/useOverlayDismissOnPointer", "@/shared/lib/hooks/useOverlayDismissOnPointer"),
    ("@/lib/hooks/useMobile760", "@/shared/lib/hooks/useMobile760"),
    ("@/lib/hooks/usePreventIosInputZoom", "@/shared/lib/hooks/usePreventIosInputZoom"),
    ("@/lib/hooks/useDesktopBarTooltipPortal", "@/shared/lib/hooks/useDesktopBarTooltipPortal"),
    ("@/lib/hooks/useAnchoredBarRowTooltip", "@/shared/lib/hooks/useAnchoredBarRowTooltip"),
    ("@/lib/hooks/useChartSeriesVisibility", "@/shared/lib/hooks/useChartSeriesVisibility"),
    ("@/lib/hooks/useCompactHeader1000", "@/shared/lib/hooks/useCompactHeader1000"),
    ("@/lib/pageHeader/", "@/widgets/page-header/lib/"),
    ("@/lib/composer-config", "@/shared/config/composer"),
    ("@/lib/data", "@/shared/data/demo-data"),
    ("@/lib/types", "@/shared/types"),
    ("@/lib/noteEmbeds/", "@/shared/lib/noteEmbeds/"),
    ("@/lib/noteEmbeds", "@/shared/lib/noteEmbeds"),
    ("@/lib/trendChart/", "@/shared/lib/trendChart/"),
    ("@/lib/profile/", "@/shared/lib/profile/"),
    ("@/lib/post/", "@/shared/lib/post/"),
    ("@/lib/drafts/", "@/shared/lib/drafts/"),
    ("@/lib/", "@/shared/lib/"),
]

TEXT_EXTENSIONS = {".ts", ".tsx", ".css", ".mjs", ".json", ".md"}


def move_tree(src: Path, dst: Path) -> None:
    if not src.exists():
        print(f"  skip (missing): {src.relative_to(ROOT)}")
        return
    dst.parent.mkdir(parents=True, exist_ok=True)
    if dst.exists():
        if dst.is_dir():
            shutil.rmtree(dst)
        else:
            dst.unlink()
    shutil.move(str(src), str(dst))
    print(f"  moved: {src.relative_to(ROOT)} -> {dst.relative_to(ROOT)}")


def apply_moves() -> None:
    print("Moving files to src/ …")
    for old, new in MOVES:
        move_tree(ROOT / old, SRC / new)


def rewrite_imports_in_file(path: Path) -> bool:
    text = path.read_text(encoding="utf-8")
    original = text
    for old, new in IMPORT_REPLACEMENTS:
        text = text.replace(old, new)
    # relative imports fixes for moved css in layout
    text = text.replace('import "./globals.css"', 'import "./styles/globals.css"')
    text = text.replace('import "./profile.css"', 'import "./styles/profile.css"')
    text = text.replace('import "./analytics.css"', 'import "./styles/analytics.css"')
    text = text.replace('import "./post.css"', 'import "./styles/post.css"')
    text = text.replace('import "./notes.css"', 'import "./styles/notes.css"')
    text = text.replace('import "./feed.css"', 'import "./styles/feed.css"')
    text = text.replace('import "./chats.css"', 'import "./styles/chats.css"')
    text = text.replace('import "./gchat.css"', 'import "./styles/gchat.css"')
    text = text.replace('import "./media.css"', 'import "./styles/media.css"')
    if text != original:
        path.write_text(text, encoding="utf-8")
        return True
    return False


def rewrite_all_imports() -> int:
    print("Rewriting imports …")
    count = 0
    for base in (SRC, ROOT / "scripts"):
        if not base.exists():
            continue
        for path in base.rglob("*"):
            if path.suffix not in TEXT_EXTENSIONS:
                continue
            if rewrite_imports_in_file(path):
                count += 1
    return count


def cleanup_empty_legacy() -> None:
    for name in ("components", "lib", "state", "app", "data"):
        p = ROOT / name
        if p.exists() and p.is_dir():
            try:
                remaining = list(p.rglob("*"))
                if not remaining or all(x.name == ".DS_Store" for x in remaining):
                    shutil.rmtree(p)
                    print(f"  removed empty: {name}/")
            except OSError:
                print(f"  legacy not empty: {name}/")


def main() -> None:
    apply_moves()
    n = rewrite_all_imports()
    cleanup_empty_legacy()
    print(f"Done. Updated {n} files.")


if __name__ == "__main__":
    main()
