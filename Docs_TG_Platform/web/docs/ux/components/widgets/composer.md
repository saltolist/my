# composer

**Путь:** `web-legacy/src/widgets/composer/`

Универсальное поле ввода: сообщения (home/gchat/post) и черновики (feed).

---

## Anatomy

```
┌─ input-wrap ─────────────────────────────────────┐
│ composer-backdrop (glass)                        │
│ ┌─ input-box ─────────────────────────────────┐│
│ │ composer-field                              ││
│ │   composer-editor (contentEditable)         ││
│ │   [chips: post | file inline]               ││
│ ├─ input-bottom ──────────────────────────────┤│
│ │ [+] tools │ LLM │ Web │ (multi) │    [↑]   ││
│ └─────────────────────────────────────────────┘│
└────────────────────────────────────────────────┘
     ↳ ComposerMentionDropdown (portal, on @)
```

---

## Props

```ts
scope: "home" | "gchat" | "post" | "feed"
placeholder?: string
onSubmit: (text: string) => boolean  // false = don't clear
```

---

## Scope matrix

| Scope | maxLines | attach placement | LLM/Web | Attach behavior |
|-------|----------|------------------|---------|-----------------|
| home | 10 | down | yes | file + pinned media menu |
| gchat | 16 | up | yes | same as home |
| post | 16 | up | yes | post media + pinned + file |
| feed | 16 | up | **no** | `+` → direct file picker |

Default placeholders from `composer/model/editor/constants.ts`.

---

## ComposerToolbar

### Left: AttachMenu

- Circular `icon-btn attach-btn` with `+` SVG
- Hidden file input (`display: none`)

### Center: Model pickers

When `!isMulti`:
- LLM ModelPicker (`BrainIcon`)
- Web Search ModelPicker (`SearchIcon`, emptyLabel «Нет»)

When `isMulti`:
- Static pill «Мультиответ» (disabled picker)

### Right: send-btn

- Label `↑`
- Calls `editor.submit()`

---

## ContentEditable editor

| Feature | Implementation |
|---------|----------------|
| Empty state | `.composer-editor.is-empty` + `data-placeholder` |
| Max height | CSS `--composer-max-lines` on `.input-box` |
| Chips | Inline DOM nodes for attachments |
| @ mention | Opens `ComposerMentionDropdown` portal |
| Paste | `onPaste` handler sanitizes |
| Submit | Enter (without shift) → submit |

---

## @ Mention flow

1. User types `@` → `mentionOpen`
2. Dropdown lists feed posts filtered by query
3. Pick or type `@title;` → converts to post chip
4. `ComposerMentionDropdown` positioned via portal

---

## AttachMenu scopes

### home / gchat (AttachHomeScopeMenu)

1. **Прикрепить файл** → file input
2. **Медиа из прикреплённых постов** (if has attached posts)
   - Submenu: AttachMediaGrid 72×72

### post (AttachPostScopeMenu)

1. **Медиа из поста** (if post has media) — submenu grid
2. **Медиа из прикреплённых постов** (if other posts attached)
3. **Загрузить с компьютера**
4. If no post media: disabled «В посте нет медиа»

### feed

- No dropdown — `onTriggerClick` opens file picker directly

---

## AttachMediaGrid

| Count layout | Grid |
|--------------|------|
| 1–3 | 1–3 columns by width |
| 4 | 2×2 |
| 5+ | 3 columns + scroll |

---

## Attach chips

- Rendered above/before text in editor
- Remove: × button or Backspace on empty field
- Types: `ComposerAttachment` — post ref, file, media from post

---

## State (composer-store)

Per scope remembers:
- selected llmId, webId
- attachments array
- Persists during session

---

## CSS

| Class | Element |
|-------|---------|
| `input-wrap` | Outer shell |
| `composer-backdrop` | Glass blur layer |
| `input-box` | Bordered box |
| `composer-editor` | contentEditable |
| `input-bottom` | Toolbar row |
| `input-tools` | Left tools group |
| `composer-mode` | Model pickers |
| `attach-dropdown-up/down` | Portal attach panel |

---

## Related

- [ModelPicker](../shared-ui.md#modelpicker)
- [AttachMenu](./composer.md) internal
- [features/send-message](../features.md)
