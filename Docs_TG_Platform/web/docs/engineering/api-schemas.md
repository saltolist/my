# API schemas

Human-readable REST contract. OpenAPI — [API_CONTRACT.yaml](./API_CONTRACT.yaml). MSW handlers — [`web/src/shared/api/msw/handlers.ts`](../../src/shared/api/msw/handlers.ts).

Base path: `/api/v1`. Errors: `{ "error": "message" }` with HTTP 400/404.

---

## Posts

### GET `/posts`

| | |
|---|---|
| Response | `Post[]` |
| MSW | Returns `mswStore.posts` |
| Schema | `postsListSchema` |

### POST `/posts`

| | |
|---|---|
| Body | Full `Post` object |
| Response | `Post` (201) |
| MSW | Upsert by id at list head |

### PATCH `/posts/{id}`

| | |
|---|---|
| Body | `Partial<Post>` |
| Response | Updated `Post` |
| Errors | 404 if not found |

### PUT `/posts/reorder`

| | |
|---|---|
| Body | `{ "posts": Post[] }` |
| Response | `Post[]` |
| MSW | Replaces entire list order |

### DELETE `/posts/{id}`

| | |
|---|---|
| Response | 204 empty |
| Errors | 404 if not found |

---

## Global chats

### GET `/global-chats`

| | |
|---|---|
| Response | `GlobalChat[]` |

### POST `/global-chats`

| | |
|---|---|
| Body | `GlobalChat` |
| Response | `GlobalChat` (201) |
| MSW | Upsert by id |

### POST `/global-chats/{chatId}/messages` (legacy / MSW only)

| | |
|---|---|
| Body | `{ "text": string }` |
| Response | Updated `GlobalChat` |
| Note | **Клиент не вызывает.** История меняется только через `PATCH` с полным `history` (ветки, `activeUserBranch`). MSW handler оставлен для совместимости. |

### PATCH `/global-chats/{chatId}`

| | |
|---|---|
| Body | `Partial<GlobalChat>` — `title`, `preview`, `date`, **`history`** (полное дерево `ChatMessage[]`) |
| Response | Updated `GlobalChat` (источник правды для React Query) |
| Client | Все мутации треда: edit, branch switch, append message → `GET` + transform + `PATCH` (`patchGlobalChatHistory`) |

### DELETE `/global-chats/{chatId}`

| | |
|---|---|
| Response | 204 |

---

## Global notes

### GET `/global-notes`

| | |
|---|---|
| Response | `GlobalNote[]` |

### PUT `/global-notes/{noteId}`

| | |
|---|---|
| Body | Full `GlobalNote` (id must match path) |
| Response | `GlobalNote` |
| Errors | 400 id mismatch |

### DELETE `/global-notes/{noteId}`

| | |
|---|---|
| Response | 204 |

---

## Profile

### GET/PUT `/profile/channel`

| | |
|---|---|
| Body (PUT) | `ChannelProfileConfig` |
| Response | `ChannelProfileConfig` |

### GET/PUT `/profile/ai`

| | |
|---|---|
| Body (PUT) | `AiProfileConfig` |
| Response | `AiProfileConfig` |

### GET/PUT `/profile/telegram`

| | |
|---|---|
| Body (PUT) | `TelegramProfileConfig` |
| Response | `TelegramProfileConfig` |

---

## AI (future)

### POST `/ai/chat`

| | |
|---|---|
| Body | TBD — scope, text, postId, attachments |
| Response | SSE stream (not implemented) |
| Frontend | Stub `AiProvider` until backend ready |

---

## Entity schemas (summary)

See [data-model.md](./data-model.md) for field details. Zod definitions in `web/src/shared/api/schemas/`.

**Post** — nested `notes`, `chats`, optional `comments`, `metrics`, `media`.

**GlobalChat** — `id: string`, optional `kind`, `history: ChatMessage[]`.

**GlobalNote** — `id: string`, `title`, `body`, `ai`, `date`, optional `files`.

**ChatMessage** — `role`, optional branches/variants for edit and multi-reply.

---

## Backend checklist

→ [BACKEND_READINESS.md](./BACKEND_READINESS.md)
