# post-workspace

**Путь:** `web-legacy/src/widgets/post-workspace/`

Пространство одного поста — все submodes и карточка поста.

---

## Mode diagram

```
post workspace
├── chat (default)
│   ├── PostMessageCard (view | edit)
│   ├── ChatThread
│   └── Composer (scope=post)
├── chats → PostChatsView
├── notes → PostNotesView
└── comments → PostCommentsPanel
```

---

## PostMessageCard

### View mode anatomy

```
┌─ post card ──────────────────────┐
│ PostMediaBlock                   │
│ post text                        │
│ PostReactionPills + views/reposts│
│ PostCardToolbar [copy][edit]     │
│ PostCommentsRow (published)      │
└──────────────────────────────────┘
```

### Edit mode

- Same media block top
- Icon attach (file picker) — adds PostMedia
- Textarea auto-height from content
- Buttons: **Сохранить** (primary), **Отмена** (ghost)

### PostCardToolbar

| Button | Action |
|--------|--------|
| Copy | `navigator.clipboard`; 2s «Скопировано» state |
| Edit | Enter inline edit mode |

---

## PostCommentsRow

```
Комментарии (N) ›
```

- Separate from metrics footer
- Click → `comments` mode (stopPropagation on feed)

---

## PostCommentsPanel

- Search filters comment list
- `PostCommentRow`: author, date, text, **Ответить**
- Reply quotes author in CommentComposer
- CommentComposer at bottom (no LLM pickers)

---

## PostChatsView / PostNotesView

Both use [FilterToolbar](./filter-toolbar.md):

```
[Все | В контексте ИИ | Не в контексте]     [+ Новый чат / + Новая заметка]
```

Lists:
- **PostChatsList** — local chat cards
- **PostNotesList** — note cards with NoteCardAiToggle

---

## usePostWorkspace

Key state:

| Field | Description |
|-------|-------------|
| `postMode` | chat \| chats \| notes \| comments |
| `currentPostChatId` | null until first message |
| `listSearch` | Submode search |
| `listContextFilter` | AI context filter |

Key actions:

| Action | Effect |
|--------|--------|
| `startNewChat` | Empty chat, mode→chat |
| `startNewNote` | Navigate to new note |
| `openLocalChat(id)` | mode→chat, set chatId |
| `openNote(id)` | Navigate note page |
| `setPostMode` | Switch submode |

---

## usePostScreenHeader

- Breadcrumb trail from `breadcrumbTrails.ts`
- `showJump` — scroll to post card visible
- `showPostModeButtons` — notes/chats toggles
- `PostHeaderDesktopActions` composition

---

## Navigation note

`← Назад` uses `router.back()` — **not** internal postViewStack (store field unused for nav).

---

## Related

- [composer](./composer.md) scope post
- [chat-thread](./chat-thread.md)
- [note-editor](./note-editor.md)
- [filter-toolbar](./filter-toolbar.md)
