# Features

Пользовательские сценарии — hooks и lib без UI разметки (кроме modals).  
Путь: `web-legacy/src/features/`.

---

## post-context-menu

**Path:** `features/post-context-menu/`

### buildPostCtxMenuItems(post, handlers)

Returns `CtxMenuItem[]` based on `post.status`:

| Status | Items |
|--------|-------|
| all | Новый чат, Новая заметка |
| draft | + Опубликовать, Запланировать, Удалить |
| scheduled | + Опубликовать, Перенести публикацию, Отменить публикацию, Удалить |
| published | + Удалить |

### usePostCtxMenuItems(post)

Hook wrapping build + wiring to workspace actions.

---

## schedule-post

**Path:** `features/schedule-post/`

### SchedulePickerModal

- Date/time picker for schedule and reschedule
- Opened from context menu actions
- Updates post.status and post.date in domain store

---

## manage-drafts

**Path:** `features/manage-drafts/`

### useDraftsSection

| Concern | Behavior |
|---------|----------|
| dragIndex | Currently dragged draft index |
| autoScroll | Scroll feed when drag near edges |
| onReorder | domainActions.updatePosts new order |

Used by `widgets/feed/DraftsSection`.

---

## send-message

**Path:** `features/send-message/`

### useSendMessage

- Appends user message to chat history
- Triggers AI stub reply (keyword rules in shared/lib/replies.ts)
- Handles attachments on message

---

## rename-chat / delete-chat

| Feature | UI trigger |
|---------|------------|
| rename-chat | ChatListCardMenu, message menu |
| delete-chat | Gchat header, ChatListCardMenu |

delete-chat: removes from global or local chat store.

---

## rename-note / delete-note / toggle-note-ai

| Feature | Trigger |
|---------|---------|
| rename-note | Note title edit (implicit) |
| delete-note | NoteListCardMenu, header overflow |
| toggle-note-ai | NoteCardAiToggle, header menu |

toggle-note-ai: flips `note.ai` boolean, affects AI context filtering.

---

## Interaction with domain store

Features call `domainActions` / reducers in `app/model/store/domain/`:

- posts CRUD, schedule, publish
- chats CRUD, messages
- notes CRUD, ai flag

All in-memory until backend exists.

---

## Stub AI replies

| Function | Context |
|----------|---------|
| `getGlobalReply(text)` | Global chat keywords |
| `getPostReply(text)` | Local chat keywords |
| `STUB_REPLY_AFTER_USER_EDIT` | After user message edit |

Defined in `shared/lib/replies.ts`, `shared/lib/chatPaths.ts`.
