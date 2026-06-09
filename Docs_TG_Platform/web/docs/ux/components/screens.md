# Screens

Композиция экранов (1 URL ≈ 1 slice). Путь: `web-legacy/src/screens/`.

| Screen | Route | Header | Основные widgets |
|--------|-------|--------|------------------|
| **home** | `/` | `PageHeader` (brand) | `Composer` |
| **gchat** | `/gchat/?id=` | `GlobalChatScreenHeader` | `ChatThread`, `Composer` |
| **feed** | `/feed/` | `FeedScreenHeader` | `FeedPublishedSection`, `FeedScheduledSection`, `DraftsSection`, `FeedComposer` |
| **post** | `/post/{id}/` | `PostScreenHeader` | `PostWorkspace` (chat/notes/chats/comments) |
| **note** | `/note/global\|post/...` | `PageHeader` + breadcrumb | `NoteEditor` |
| **notes** | `/notes/` | `NotesScreenHeader` | `FilterToolbar`, `NotesDesktopGrid` / `NotesMobileGrid` |
| **chats** | `/chats/` | `ChatsScreenHeader` | `ChatsList`, `ChatListCards` |
| **analytics** | `/analytics/` | `AnalyticsScreenHeader` | `ChannelAnalyticsSection`, `AnalyticsHeatmap`, `AnalyticsTopPostsTable` |
| **profile** | `/profile/` | `ProfileScreenHeader` | `ProfileSettingsPanel`, `ChannelTab`, `ProfileAnalyticsPanel` |

## Shell

Все screen routes — в `app/(shell)/`. Layout: `AppShell` + `Sidebar`.

## Post modes

URL query / internal state: `chat` (default), `chats`, `notes`, `comments`.

Breadcrumb trails: `shared/lib/nav/breadcrumbTrails.ts`.

## Dirty guards

- Note editor: `beforeunload` + confirm
- Profile tabs: `window.confirm` on tab switch
- Navigation: `useNavDirtyGuards`, `confirmDiscardAnyEdit`
