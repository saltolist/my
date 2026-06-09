# UI-соглашения (reference)

Общие паттерны интерфейса [`web-legacy`](../../../../web-legacy/). Используются при проектировании новой версии в `web/`.

## Breakpoints

| Hook / constant | Ширина | Эффект |
|-----------------|--------|--------|
| `useMobile760` | ≤760px | Mobile layout: sheet sidebar, compact header, select вместо tabs |
| `RAIL_MQ` (sidebar) | ≥761px | Desktop sidebar + rail collapse |
| `usePageHeaderLe640/650/780/1080` | разные | Compact header, overlay search, analytics chart density |
| `profileBreakpoints` | разные | Profile tab layout, chart points, channel summary rows |

## Floating panels

Attach-меню, ModelPicker, ContextMenu (portal) рендерятся через **`createPortal(..., document.body)`** с `position: fixed`.

- z-index dropdown: **2000**
- edge margin: `FLOATING_PANEL_EDGE_MARGIN_PX`
- attach submenu max-height + scroll
- ModelPicker: `placement up|down` — позиция относительно trigger

## Кнопки

| Класс | Назначение |
|-------|------------|
| `btn btn-primary` | Primary action (Save) |
| `btn btn-ghost btn-sm` | Secondary (Back, mode tabs) |
| `icon-btn` | Круглая icon-only (`+`, attach) |
| `send-btn` | Composer submit `↑` |
| `filter-tab` | FilterToolbar tab; `.active` |
| `filter-tab--action` | Action tab (+ Новая заметка) |

## Glass header

PageHeader использует CSS variables `--glass-*`, `backdrop-filter: blur`. Класс `page-header--post` — фиксированная шапка post workspace.

## Portal vs inline dropdown

| Компонент | Portal | Когда |
|-----------|--------|-------|
| ContextMenu | optional `portal` | post header, gchat delete — portal |
| AttachMenu | always portal | composer |
| ModelPicker | always portal | composer, profile |
| PageHeaderSelect | always portal | scope/period selects |

## ContentEditable composer

Composer использует **`contentEditable`** div (не textarea):

- chips постов/файлов inline в DOM
- `@` mention dropdown через portal
- placeholder через `data-placeholder` + `.is-empty`
- max lines через CSS `--composer-max-lines`

## State persistence (local-first)

| Data | Persistence |
|------|-------------|
| Theme | `localStorage` + `data-theme` |
| Sidebar collapsed | `localStorage` (`tg-platform-sidebar-collapsed`) |
| Feed post width | session / ui store |
| Draft order | in-memory domain store |
| Profile/channel edits | in-memory until save |

## Accessibility

- `aria-label` на icon buttons
- `role="textbox"` + `aria-multiline` на composer
- `role="checkbox"` + `aria-checked` на NoteCardAiToggle
- Breadcrumb: `nav` + `aria-current="page"`
- ModelPicker: `aria-haspopup="listbox"`, `aria-expanded`
