# Routing

URL, query params, navigation stack. Reference: [`frontend-v2/src/shared/lib/routes.ts`](../../../frontend-v2/src/shared/lib/routes.ts), [`post-navigation-store.ts`](../../../frontend-v2/src/app/model/store/post-navigation-store.ts).

Screen layout — [pages.md](../ux/pages.md). Flows — [flows.md](../ux/flows.md).

---

## Conventions

- `trailingSlash: true` on all routes
- Static export: gchat uses query param `?id=` (not path segment)
- Post submodes (`chat` / `chats` / `notes` / `comments`) live in **Zustand**, not URL

---

## Canonical URLs

| Screen | URL | Query |
|--------|-----|-------|
| home | `/` | — |
| feed | `/feed/` | — |
| post | `/post/{id}/` | `?chat={localChatId}` optional |
| post (new) | `/post/new/` | — |
| gchat | `/gchat/` | `?id={globalChatId}` |
| note (global) | `/note/global/{id}/` | — |
| note (local) | `/note/post/{postId}/{noteId}/` | — |
| note (new) | `/note/new/` | `?from=notes\|post&postId=` |
| chats | `/chats/` | — |
| notes | `/notes/` | — |
| analytics | `/analytics/` | — |
| profile | `/profile/` | — |

Route builders: `routes.home()`, `routes.feed()`, `routes.post(id, chatId?)`, `routes.gchat(id)`, `routes.noteGlobal(id)`, `routes.notePost(postId, noteId)`, `routes.noteNew(from?, postId?)`.

---

## parseAppPath

Path → `ParsedAppPath`:

| Segment pattern | `screen` | Extracted |
|-----------------|----------|-----------|
| `/` | `home` | defaults |
| `/feed/` | `feed` | |
| `/post/new/` | `post` | `postId: null` |
| `/post/{n}/` | `post` | `postId`, `postMode: chat` (default) |
| `/gchat/` | `gchat` | `gchatId` from path segment if legacy |
| `/note/new/` | `note` | `noteIsNew: true` |
| `/note/global/{id}/` | `note` | `noteGlobalId` |
| `/note/post/{p}/{n}/` | `note` | `notePostId`, `noteId` |
| unknown | `home` | fallback |

Query params parsed separately:

- `?id=` on `/gchat/` → `gchatId` (canonical)
- `?chat=` on `/post/{id}/` → `currentPostChatId`
- `?from=&postId=` on `/note/new/` → note origin

---

## Legacy redirects

| Old URL | Redirect |
|---------|----------|
| `/gchat/{id}/` | `/gchat/?id={id}` |
| `/post/{id}/notes/` | `/post/{id}/` + mode `notes` in state |
| `/post/{id}/chats/` | `/post/{id}/` + mode `chats` |
| `/post/{id}/comments/` | `/post/{id}/` + mode `comments` |

Handled by `parseGChatLegacyPath`, `parsePostLegacySub` in RouteSync.

---

## Post navigation (Zustand)

Store: `usePostNavigationStore` — per `postId`:

| State | Purpose |
|-------|---------|
| `modes[postId]` | Current `PostMode` (default `chat`) |
| `chatIds[postId]` | Active local chat id in `chat` mode |
| `stacks[postId]` | Drill-down stack for back within post |

### Mode switching

- Header tabs / buttons call `setMode(postId, mode)`
- **Toggle:** clicking active tab among `notes` / `chats` / `comments` returns to `chat`
- `pushMode` saves current mode+chat to stack before drill-down
- `popMode` restores previous entry

**`← Назад` in PageHeader** uses `getParentPath` / browser history — **not** `postViewStack`.

### Parent paths (`getParentPath`)

| Current path | Back target |
|--------------|-------------|
| `/post/{id}/` | `/feed/` |
| `/gchat/` | `/chats/` |
| `/note/global/{id}/` | `/notes/` |
| `/note/post/{p}/{n}/` | `/post/{p}/` |
| `/note/new/` | `/notes/` |
| `/feed/`, `/chats/`, … | `/` |

---

## Dirty guards

| Screen | Trigger | Behavior |
|--------|---------|----------|
| Note editor | navigate away, `beforeunload` | Confirm if body/title changed |
| Profile (Настройки, Канал) | tab switch | `window.confirm` if dirty |

See [screens.md](../ux/components/screens.md).

---

## Screen ↔ href sync

`buildRoutePatch(parsed, data)` — URL → UI state patch (load note, gchat, post).

`statePatchToHref(patch, cur)` — UI state → URL for navigation.

Post mode changes do **not** update URL (except legacy redirect on load).

### Who reads what

| Concern | Source of truth | Read via | Write via |
|---------|-----------------|----------|-----------|
| Screen, post id, note path, gchat id | URL | `parseAppPath`, searchParams | `router.push`, `routes.*()` |
| Post submode | `post-navigation-store` | `getMode(postId)` | `setMode`, `pushMode`, `popMode` |
| Local chat in post | URL `?chat=` + store | RouteSync | `routes.post(id, chatId)` |
| Note edit context | `navigation-store` | `currentNote`, `noteMode` | RouteSync, note editor |
| List filters (chats, notes) | `navigation-store` | `chatsTab`, `noteScope`, `noteFilter` | `setChatsTab`, `setNoteScope`, `setNoteFilter` |
| Screen data (titles, bodies) | Repository + entity hooks | `usePost`, `useGlobalChat`, … | mutations |

Pure URL → store sync: `syncRouteFromUrl()` in `widgets/app-shell/lib/syncRoute.ts`, called from `RouteSync`.

---

## Related

- [architecture.md](./architecture.md)
- [data-model.md](./data-model.md)
- [flows.md](../ux/flows.md)
