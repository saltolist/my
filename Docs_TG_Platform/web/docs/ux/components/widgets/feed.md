# feed

**Путь:** `web-legacy/src/widgets/feed/`

Карточки постов и секция черновиков с DnD.

---

## PostCard anatomy

```
┌─ [drag rail] ─ post-card ─────────────────┐
│  post-card-media (PostMediaBlock)         │
│  post-card-text                           │
│  PostReactionPills (published)            │
│  post-card-footer                         │
│    post-meta (PostStatus)                 │
│    PostViewsReposts (published)           │
│  PostCommentsRow (published)              │
└───────────────────────────────────────────┘
```

### Variants

| Class | When |
|-------|------|
| `post-card--draft-dnd` | Draft with drag handle |
| `post-card--no-media` | Text-only published/scheduled |

### Empty draft text

«Пост пустой — нажми чтобы начать писать»

---

## PostEngagement

### PostReactionPills

- Reaction emoji pills from `post.metrics.reactions`
- Only published posts

### PostViewsReposts

- Eye icon + views count
- Repost icon + reposts count
- Inline in footer (not with comments)

---

## DraftsSection

- Uses `features/manage-drafts`
- `DraftsCardStack` for visual stack effect
- Each draft: PostCard + draftHandleProps

### Drag handle

```
drag-handle (draggable)
  └─ drag-handle-dots (6 spans)
```

- Left rail: `draft-drag-handle-rail`
- Auto-scroll at container edges during drag

---

## FeedPublishedSection

Groups by day:

```
ОПУБЛИКОВАННЫЕ
  ── 28 апреля ──  (feed-day-marker)
  [PostCard]
  [PostCard]
  ── 27 апреля ──
  ...
```

---

## FeedScheduledSection

Flat list, sorted by scheduled date ascending.

---

## useFeedPostLayout

Syncs `--feed-post-w` CSS variable with ui-store width.

Width labels from `feedPostWidthLabel()`:
- 500 → Компьютер
- 390 → Планшет  
- 270 → Телефон

---

## Interactions

| Action | Result |
|--------|--------|
| Card click | Open post workspace |
| Comments row click | Post comments mode |
| Draft drag | Reorder in drafts section |
| Feed composer submit | New draft in section |

---

## Related

- [PostStatus](../entities.md#poststatus)
- [composer](./composer.md) scope feed
- [manage-drafts](../features.md)
