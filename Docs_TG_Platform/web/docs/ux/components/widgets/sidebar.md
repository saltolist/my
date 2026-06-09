# sidebar

**Путь:** `web-legacy/src/widgets/sidebar/`

Левая навигация + недавние чаты/заметки + строка текущего поста.

---

## Anatomy (expanded)

```
┌─ sidebar ─────────────────┐
│ SidebarHeader             │
│   ✦ TG Platform  [collapse]│
├───────────────────────────┤
│ + Глобальный чат          │
│   Аналитика               │
│   Лента                   │
│   [SidebarFeedPostRow]    │  ← if post open
│ Заметки ▾                 │
│   recent note rows...     │
│ Чаты ▾                    │
│   recent chat rows...     │
├───────────────────────────┤
│ Профиль                   │
└───────────────────────────┘
```

Collapsed rail: только иконки, brand shows expand on hover.

---

## SidebarHeader states

| State | UI |
|-------|-----|
| Desktop expanded | Brand button (→ home) + collapse btn |
| Desktop collapsed | Single hit area: hover shows expand icon |
| Mobile | Brand only (collapse via app-shell) |

**Important:** logo click → home only; collapse is separate button.

---

## Nav items

| Item | Icon | active when |
|------|------|-------------|
| Глобальный чат | NavIconPlus | `screen === home` |
| Аналитика | NavIconAnalytics | `screen === analytics` |
| Лента | NavIconFeed | `screen === feed` |
| Заметки | chevron + NavIconNotes | `screen === notes` |
| Чаты | chevron + NavIconChats | `screen === chats` |
| Профиль | NavIconProfile | `screen === profile` |

---

## SidebarFeedPostRow

Shown when `showFeedPostRow && currentPostSidebar`.

- Post title truncated
- Active states: full post / sub-mode (notes/chats inside post)
- Context menu: post actions (via post context menu items)
- Click → open post

---

## Recent sections

### SidebarRecentNotesSection / SidebarRecentChatsSection

- Chevron expand/collapse
- Max ~14 items
- Each row: `SidebarRecentNoteRow` / `SidebarRecentChatRow`
- Row: title + menu (CardContextMenu)
- In post context: split **Этот пост** / **Остальные**

### RecentRow types

```ts
{ kind: "global", id, title, ... }
{ kind: "local", postId, chatId, title, ... }
{ kind: "note", isGlobal, postId?, id, title, ... }
```

---

## useSidebar hook

Provides:
- `goHome`, `navigate(screen)`
- `openGChat`, `openLocalChat`, `openPost`, `openNote`
- rail state: `railActive`, `setSidebarCollapsed`
- recents expansion flags
- feed post row state + context menu items

---

## Persistence

- `SIDEBAR_COLLAPSED_KEY` in localStorage
- `RAIL_MQ` — min width for rail mode

---

## CSS

| Class | Description |
|-------|-------------|
| `#sidebar` | nav root |
| `sidebar--collapsed` | Rail mode |
| `nav-item.active` | Current screen |
| `sidebar-recent-*` | Recent list rows |
| `nav-icon` | Icon slot |

---

## Related

- [app-shell](./app-shell.md) — wraps sidebar
- [CardContextMenu](../shared-ui.md#cardcontextmenu)
