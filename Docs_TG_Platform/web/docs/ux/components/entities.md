# Entities UI

Доменные presentational-компоненты. Код: `web-legacy/src/entities/*/ui/`.

---

## PostStatus

**Файл:** `post/ui/PostStatus.tsx`

### Anatomy (footer карточки)

```
[SVG icon] [Status title · date/time]
```

| status | Icon | Title | Extra |
|--------|------|-------|-------|
| `published` | CheckIcon | Опубликован | `post.date` |
| `scheduled` | ClockIcon | Отложено | scheduled datetime |
| `draft` | PencilIcon | Черновик | `создан {post.created}` |

### CSS

- `.post-status`, `.post-status-icon--published/scheduled`
- `.post-status-text`, `.post-status-title`, `.post-status-time`

---

## PostMediaBlock

**Файл:** `post/ui/PostMediaBlock.tsx`

TG-стиль сетка медиа над текстом поста.

- Single image / album grid
- Used in PostCard, PostMessageCard
- Edit mode: attach adds to post.media array

---

## PostCard (widget feed, entity patterns)

См. [feed.md](./widgets/feed.md) — композиция в `widgets/feed/ui/PostCard.tsx`.

Entity parts: PostStatus, PostMediaBlock, PostMetricIcons.

---

## PostCommentsRow (widget)

См. [post-workspace.md](./widgets/post-workspace.md).

```
[Комментарии] [(count)] [›]
```

- `.post-comments-row--action` — clickable button
- Stops propagation on feed card click

---

## NoteCardAiToggle

**Файл:** `note/ui/NoteCardAiToggle.tsx`

### Anatomy

```
[🧠 icon] [В контексте | Не в контексте]
```

| Prop | Описание |
|------|----------|
| `ai` | boolean — in AI context |
| `onClick` | toggle; stops card click propagation |

### States

| ai | Label | CSS |
|----|-------|-----|
| true | В контексте | `.note-ai-toggle.on` |
| false | Не в контексте | `.note-ai-toggle.off`, label `--out` |

### Behavior

- `role="checkbox"`, `aria-checked`
- After click: `suppress-hover` until mouse leave (avoid sticky hover)

---

## NoteListCard

**Файл:** `note/ui/NoteListCard.tsx` (+ re-export in note-editor widget)

Карточка в grid lists. Used in post notes list.

---

## ChatCards

**Файл:** `chat/ui/ChatCards.tsx`

### Anatomy (GlobalChatCard / LocalChatCard)

```
┌──────────────────────────────────────┐
│ [icon rail] │ Title          [menu] │
│             │ preview        date   │
└──────────────────────────────────────┘
```

| Slot | Global | Local |
|------|--------|-------|
| `iconRail` | NavIconChats / NavIconSend (omni) | NavIconFeed |
| `userLine` | First user message / title | Same |
| `assistantLine` | Last assistant preview | Same |
| `titleAttr` | — | `Пост: {postTitle}` |
| `menu` | ChatListCardMenu | ChatListCardMenu |

### CSS

- `.chat-card` — clickable row
- `.chat-card-icon-rail` — left icon column
- `.chat-card-menu-slot` — stopPropagation for menu

### Data: LocalChatRow

`postId`, `postTitle`, `chatId`, `title`, `preview`, `date`, `history`

---

## Message icons

**Файл:** `message/ui/MessageIcons.tsx`, trash, rename icons.

Used in chat message hover toolbars (widget chat-thread).

---

## UserSummary

**Файл:** `user/ui/UserSummary.tsx`

Profile user block display.
