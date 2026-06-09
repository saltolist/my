# filter-toolbar

**Путь:** `web-legacy/src/widgets/filter-toolbar/`

Горизонтальная полоса: фильтр-tabs слева, action-кнопка справа.

---

## Anatomy

```
┌─ filter-toolbar filter-toolbar--{width} ──────────────┐
│ filter-toolbar__filters    │ filter-toolbar__action │
│ [tab][tab][tab] or select   │ [+ Action]             │
└───────────────────────────────────────────────────────┘
```

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tabs` | `{value, label}[]` | — | Desktop tab buttons |
| `value` | string | — | Active tab |
| `onChange` | `(v) => void` | — | Tab change |
| `mobileTabs` | tabs[] | tabs | Shorter mobile labels |
| `mobileFilter` | ReactNode | — | Replace tabs on mobile |
| `tabAriaLabel` | string | «Фильтр» | a11y |
| `selectClassName` | string | — | FilterTabSelect styling |
| `action` | ReactNode | — | Right slot |
| `className` | string | — | Root modifier |
| `width` | `content` \| `composer` | `content` | Max width alignment |

---

## Width modes

| width | Aligns with |
|-------|-------------|
| `content` | Page content column (chats list) |
| `composer` | Post workspace composer width |

---

## Responsive

| Viewport | Filters render as |
|----------|-------------------|
| Desktop | `.filter-tab` buttons, `.active` on selected |
| Mobile | `FilterTabSelect` dropdown OR `mobileFilter` node |

---

## FilterToolbarAction

Styled as `filter-tab filter-tab--action`:

| Usage | Label | class extras |
|-------|-------|--------------|
| New note | + Новая заметка | `notes-new-note-btn` |
| New chat (post) | + Новый чат | `chats-new-chat-btn` |
| New chat (catalog) | Новый чат | `chats-new-chat-btn`, active style |

---

## Standard filter sets

### AI context filter (post notes/chats)

From `buildListContextFilterTabs()`:

| value | Desktop label | Mobile label |
|-------|---------------|--------------|
| all | Все | Все |
| inContext | В контексте ИИ | В контексте |
| outContext | Не в контексте | Не в контексте |

### Notes catalog filter

Same AI filter + scope in PageHeader (separate control).

---

## CSS

```css
.filter-toolbar { display flex; justify space-between }
.filter-tab { pill button }
.filter-tab.active { highlighted }
.filter-tab--action { accent action style }
.filter-tab--dropdown { mobile full-width variant }
```

---

## Used in

- `screens/notes/` — filter row under header
- `screens/chats/` — new chat action row
- `PostNotesView`, `PostChatsView` — submode toolbars
