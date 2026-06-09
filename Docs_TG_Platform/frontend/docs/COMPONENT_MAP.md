# Component map

Where each UI slice and feature hook is consumed. Paths relative to `src/`.

## `shared/ui/*`

| Path | Export | Used in |
|------|--------|---------|
| `shared/ui/ai-context-badge` | `AiContextBadge` | `entities/note/ui/note-ai-toggle` |
| `shared/ui/avatar` | `Avatar`, `AvatarImage`, `AvatarFallback`, `AvatarGroup` | — (gallery / future) |
| `shared/ui/back-button` | `BackButton` | `widgets/page-header/ui/page-header-right` |
| `shared/ui/badge` | `Badge` | `entities/note`, `entities/post`, `widgets/analytics-dashboard`, `widgets/composer`, `widgets/post-workspace`, `widgets/profile-settings` |
| `shared/ui/breadcrumb` | `Breadcrumb`, `BreadcrumbItem` | `widgets/page-header` |
| `shared/ui/button` | `Button` | Wide internal + widget usage |
| `shared/ui/card` | `Card`, `CardHeader`, … | `entities/chat`, `entities/note`, `entities/post`, `widgets/analytics-dashboard`, `widgets/post-workspace`, `widgets/profile-settings` |
| `shared/ui/checkbox` | `Checkbox` | — (gallery) |
| `shared/ui/command` | `Command`, `CommandDialog`, … | Internal (`dialog`, `input-group`) |
| `shared/ui/context-menu-button` | `ContextMenuButton` | `screens/gchat`, `widgets/page-header`, `widgets/post-workspace`, `widgets/sidebar` |
| `shared/ui/copy-button` | `CopyButton` | `entities/message` |
| `shared/ui/dialog` | `Dialog`, … | `shared/ui/command` |
| `shared/ui/dropdown-menu` | `DropdownMenu`, … | `shared/ui/context-menu-button`, `shared/ui/filter-tabs`, `shared/ui/model-picker`, `widgets/composer` |
| `shared/ui/empty-section` | `EmptySection` | `widgets/feed/ui/feed-section` (internal) |
| `shared/ui/empty-state` | `EmptyState` | `screens/chats`, `screens/notes` |
| `shared/ui/error-fallback` | `ErrorFallback` | `app/error`, `app/(shell)/error` |
| `shared/ui/feed-card-width-toggle` | `FeedCardWidthToggle` | `widgets/feed/ui/feed-search-bar` |
| `shared/ui/filter-tabs` | `FilterTabs` | `screens/chats`, `screens/notes`, `widgets/analytics-dashboard` |
| `shared/ui/icon-button` | `IconButton` | `widgets/composer`, `widgets/page-header` |
| `shared/ui/input` | `Input` | `shared/ui/search-field`, `widgets/note-editor`, `widgets/profile-settings` |
| `shared/ui/input-group` | `InputGroup`, … | `shared/ui/command` |
| `shared/ui/label` | `Label` | `widgets/note-editor`, `widgets/profile-settings` |
| `shared/ui/model-picker` | `ModelPicker` | `shared/ui/web-search-picker`, `widgets/composer` |
| `shared/ui/multi-reply-toggle` | `MultiReplyToggle` | `widgets/composer/ui/composer-controls` |
| `shared/ui/password-toggle` | `PasswordToggle` | `widgets/profile-settings` (telegram sections) |
| `shared/ui/popover` | `Popover`, … | — (gallery) |
| `shared/ui/scroll-area` | `ScrollArea` | `widgets/chat-thread`, `widgets/feed`, `widgets/sidebar` |
| `shared/ui/search-field` | `SearchField` | `screens/chats`, `screens/notes`, `widgets/feed`, `widgets/post-workspace` |
| `shared/ui/separator` | `Separator` | `widgets/profile-settings`, `widgets/sidebar` |
| `shared/ui/sheet` | `Sheet`, … | `widgets/app-shell` |
| `shared/ui/skeleton` | `Skeleton` | `app/(shell)/*` loading, `screens/*`, `widgets/sidebar` |
| `shared/ui/summary-metric-card` | `SummaryMetricCard` | `widgets/analytics-dashboard` |
| `shared/ui/switch` | `Switch` | `entities/note`, `shared/ui/multi-reply-toggle`, `widgets/note-editor`, `widgets/profile-settings` |
| `shared/ui/tabs` | `Tabs`, … | `entities/message`, `widgets/profile-settings` |
| `shared/ui/textarea` | `Textarea` | `entities/message`, `widgets/composer`, `widgets/note-editor`, `widgets/post-workspace`, `widgets/profile-settings` |
| `shared/ui/tooltip` | `Tooltip`, … | `app/providers/AppProviders`, `widgets/sidebar` |
| `shared/ui/web-search-picker` | `WebSearchPicker` | `widgets/composer/ui/composer-controls` |

## `entities/*/ui/*`

| Path | Export | Used in |
|------|--------|---------|
| `entities/chat/ui/chat-list-card` | `ChatListCard` | `screens/chats` |
| `entities/message/ui/ai-chat-bubble` | `AiChatBubble` | `widgets/chat-thread` |
| `entities/message/ui/ai-message-toolbar` | `AiMessageToolbar` | `entities/message/ui/ai-chat-bubble` |
| `entities/message/ui/ai-variant-tabs` | `AiVariantTabs` | `entities/message/ui/ai-chat-bubble` |
| `entities/message/ui/chat-branch-nav` | `ChatBranchNav` | `entities/message/ui/user-chat-bubble` |
| `entities/message/ui/chat-bubble` | `ChatBubble`, `MessageText` | `entities/message` (internal) |
| `entities/message/ui/user-chat-bubble` | `UserChatBubble` | `widgets/chat-thread` |
| `entities/note/ui/note-ai-toggle` | `NoteAiToggle` | `entities/note/ui/note-card` |
| `entities/note/ui/note-card` | `NoteCard` | `screens/notes`, `widgets/post-workspace` |
| `entities/post/ui/draft-drag-handle` | `DraftDragHandle` | `entities/post/ui/PostCard` |
| `entities/post/ui/post-comment-row` | `PostCommentRow` | `widgets/post-workspace/ui/post-comments-panel` |
| `entities/post/ui/post-media-block` | `PostMediaBlock` | `entities/post/ui/PostCard`, `widgets/post-workspace` |
| `entities/post/ui/post-metrics-row` | `PostMetricsRow` | `entities/post/ui/PostCard` |
| `entities/post/ui/PostCard` | `PostCard` | `widgets/feed`, `widgets/post-workspace` |
| `entities/post/ui/PostStatusBadge` | `PostStatusBadge` | `entities/post/ui/PostCard`, `widgets/post-workspace` |
| `entities/post/ui/reaction-pills` | `ReactionPills` | `entities/post/ui/PostCard` |

## `widgets/*/ui/*` (and root exports)

| Path | Export | Used in |
|------|--------|---------|
| `widgets/analytics-dashboard` | `AnalyticsDashboard` | `screens/analytics` |
| `widgets/analytics-dashboard/SimpleLineChart` | `SimpleLineChart` | `screens/analytics` |
| `widgets/analytics-dashboard/ui/analytics-period-filter` | `AnalyticsPeriodFilter` | `widgets/analytics-dashboard` (internal) |
| `widgets/analytics-dashboard/ui/rubric-breakdown` | `RubricBreakdown` | `widgets/analytics-dashboard` (internal) |
| `widgets/analytics-dashboard/ui/top-posts-list` | `TopPostsList` | `widgets/analytics-dashboard` (internal) |
| `widgets/app-shell/ui/AppShell` | `AppShell` | `app/(shell)/layout` |
| `widgets/app-shell/ui/MobileTopbar` | `MobileTopbar` | `widgets/app-shell` (internal) |
| `widgets/chat-thread` | `ChatThread` | `screens/gchat`, `widgets/post-workspace` |
| `widgets/composer` | `Composer` | `screens/feed`, `screens/gchat`, `screens/home`, `widgets/post-workspace` |
| `widgets/composer/ui/*` | attach menus, controls, shell, … | `widgets/composer` (internal) |
| `widgets/feed` | `FeedWidget` | `screens/feed` |
| `widgets/feed/ui/feed-search-bar` | `FeedSearchBar` | `screens/feed` |
| `widgets/feed/ui/feed-section` | `FeedSection` | `widgets/feed` (internal) |
| `widgets/note-editor` | `NoteEditor` | `screens/note` |
| `widgets/note-editor/ui/note-body-editor` | `NoteBodyEditor` | `widgets/note-editor` (embed canvas + DnD) |
| `widgets/note-editor/ui/note-ai-panel` | `NoteAiPanel` | `widgets/note-editor` |
| `widgets/note-editor/ui/noteBodyEditor/*` | canvas, cells, drag preview | `note-body-editor` (internal) |
| `widgets/note-editor/ui/*` | toolbar, files, hidden input | `widgets/note-editor` (internal) |
| `widgets/page-header/ui/mode-cluster` | `ModeCluster` | `post-mode-switch` (internal) |
| `widgets/sidebar/ui/sidebar-inner` | `SidebarInner` | `Sidebar` (internal) |
| `widgets/sidebar/ui/sidebar-fallback` | `SidebarFallback` | `Sidebar` (internal) |
| `widgets/sidebar/ui/sidebar-recent-section` | `SidebarRecentSection` | `SidebarRecentList` (internal) |
| `widgets/profile-settings/ui/telegram-phone-input` | `TelegramPhoneInput` | `telegram-auth-section` |
| `widgets/profile-settings/ui/telegram-code-input` | `TelegramCodeInput` | `telegram-auth-section` (code-sent) |
| `widgets/profile-settings/ui/telegram-resend-code` | `TelegramResendCode` | `telegram-auth-section` (code-sent) |
| `widgets/composer/ui/composer-input-area` | `ComposerInputArea` | `Composer` (internal) |
| `widgets/composer/ui/composer-hidden-file-input` | `ComposerHiddenFileInput` | `Composer` (internal) |
| `shared/lib/truncate` | `truncate` | `screens/home` |
| `shared/lib/format-telegram-phone` | `formatTelegramPhoneInput` | `telegram-phone-input` |
| `widgets/page-header/ui/PageHeader` | `PageHeader` | All `screens/*` |
| `widgets/page-header/ui/page-header-center` | `PageHeaderCenter` | `widgets/page-header` (internal) |
| `widgets/page-header/ui/page-header-menu-button` | `PageHeaderMenuButton` | `widgets/post-workspace` |
| `widgets/page-header/ui/post-mode-switch` | `PostModeSwitch` | `widgets/post-workspace` |
| `widgets/page-header/ui/post-jump-button` | `PostJumpButton` | `widgets/post-workspace` |
| `widgets/post-workspace` | `PostWorkspace` | `screens/post` |
| `widgets/post-workspace/ui/*` | panels, header, lists | `widgets/post-workspace` (internal) |
| `widgets/profile-settings` | `ProfileSettings` | `screens/profile` |
| `widgets/profile-settings/ui/*` | forms, toggles, lists | `widgets/profile-settings` (internal) |
| `widgets/sidebar/ui/Sidebar` | `Sidebar` | `widgets/app-shell` |
| `widgets/sidebar/ui/*` | nav, recent rows, icons | `widgets/sidebar` (internal) |

## `features/*`

| Path | Export | Used in |
|------|--------|---------|
| `features/attach-to-message` | `useAttachPost`, `useAttachFile`, `useAttachMedia` | `widgets/composer` |
| `features/delete-chat` | `useDeleteChat` | `screens/gchat` |
| `features/delete-note` | `useDeleteNote` | `screens/note` |
| `features/rename-chat` | `useRenameChat` | `widgets/sidebar` (via context menu) |
| `features/rename-note` | `useRenameNote` | `widgets/sidebar` (via context menu) |
| `features/reorder-drafts` | `useReorderDrafts` | `widgets/feed` |
| `features/send-message` | `useSendGlobalMessage`, `useSendPostMessage` | `screens/gchat`, `widgets/post-workspace` |
| `features/toggle-note-ai` | `useToggleNoteAi` | `screens/notes` |
