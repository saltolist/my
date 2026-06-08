# State management

## TanStack Query keys

Defined in `src/shared/api/queryKeys.ts`:

| Key | Data |
|-----|------|
| `['posts']` | All posts |
| `['posts', id]` | Single post |
| `['global-chats']` | Global chats list |
| `['global-notes']` | Global notes list |
| `['profile', 'channel']` | Channel profile |
| `['profile', 'ai']` | AI settings |
| `['profile', 'telegram']` | Telegram settings |

## Zustand slices

### ui-store

- `sidebarCollapsed` → localStorage `tg-platform-sidebar-collapsed`
- `mobileSidebarOpen`, `feedCardWidth`, `themePreference`
- Composer attachments per scope

### post-navigation-store

- Per-`postId` mode stack: `chat | chats | notes | comments`
- `pushMode`, `popMode`, `setMode`, `currentPostChatId`

## Optimistic updates

Implemented in entity mutation hooks:

- Draft reorder (`useReorderPosts`)
- Chat rename / delete
- Note upsert / AI toggle

## AI layer (temporary)

`shared/lib/ai/` — `AiProvider` interface; stub uses keyword replies from `shared/lib/replies.ts`. Replace with SSE endpoint without UI changes.
