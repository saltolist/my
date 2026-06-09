# page-header

**Путь:** `web-legacy/src/widgets/page-header/`

Единая шапка всех экранов. Фиксированная высота, glass-стиль.

---

## Anatomy

```
┌─────────────────────────────────────────────────────────────┐
│ LEFT          │ CENTER (search/tools)  │ RIGHT              │
│ title/brand   │ search + selects     │ back + actions     │
│ or breadcrumb │ or profile tabs      │ or overflow ⋮      │
└─────────────────────────────────────────────────────────────┘
```

Три колонки: `PageHeaderLeft`, `PageHeaderCenter`, `PageHeaderRight`.

---

## PageHeaderProps

| Prop | Тип | Описание |
|------|-----|----------|
| `title` | ReactNode | Простой заголовок (Лента, Чаты, …) |
| `left` | ReactNode | Custom left (breadcrumbs, brand, hamburger) |
| `backTo` | ScreenId | `navigateBack(backTo)` |
| `onBack` | `() => void` | Custom back handler |
| `backLabel` | string | default `← Назад` |
| `search` | ReactNode | Центральный слот (search row + selects) |
| `center` | ReactNode | Альтернатива search (profile tabs) |
| `mobileSelect` | ReactNode | Select только на mobile |
| `actions` | ReactNode | Desktop actions справа |
| `overflowItems` | PageHeaderOverflowItem[] | Mobile hamburger menu |
| `compactSearchAtWidth` | number | При узкой шапке — icon search |
| `compactSearchOverlay` | boolean | Post: overlay search вместо inline |
| `className` | string | Доп. классы корня |

---

## Responsive behavior

### Mobile (≤760px)

- Title/left скрывается при открытом mobile search overlay
- Search toggle (лупа) в right
- `mobileSelect` в right или overflow
- `overflowItems` → hamburger menu

### Compact search (desktop narrow)

- При `headerWidth <= compactSearchAtWidth`: search collapse to icon
- Post: `compactSearchOverlay` — поле появляется overlay поверх контента

### Profile breakpoints

Специальная логика для profile tab `Аналитика платформы`:
- period picker moves to header when `periodInHeader`
- chart max points adjust via `profileBreakpoints`

---

## Subcomponents

| Component | Role |
|-----------|------|
| `PageHeaderSearchInput` | Input + magnifier + dismiss (×) |
| `PageHeaderSelect` | Dropdown select (ContextMenu-based) |
| `PageHeaderMenuButton` | Hamburger для mobile sidebar |
| `PageHeaderOverflow` | Mobile overflow dropdown |

---

## CSS classes

| Class | When |
|-------|------|
| `page-header` | Root |
| `page-header--post` | Post workspace fixed header |
| `page-header-search-tools-row` | Search + scope select row |
| `page-header-scope-select` | Desktop scope dropdown wrapper |
| `page-header-actions--desktop` | Desktop-only actions |

---

## Per-screen configuration

| Screen | left | center/search | back | actions |
|--------|------|---------------|------|---------|
| home | brand `TG Platform` | — | — | — |
| feed | title | search + width toggle | home | — |
| chats | title | search + scope select | home | — |
| notes | title | search + scope select | home | — |
| analytics | title | — (period in body) | home | — |
| profile | title | profile tab selects | home | period (conditional) |
| post | breadcrumbs | search (submodes) | custom | mode cluster + menu |
| gchat | menu + breadcrumbs | — | chats | delete menu |
| note | breadcrumbs | — | fallback | overflow AI/delete |

---

## Search overlay flow

1. User taps search icon → `mobileSearchOpen = true`
2. Left hidden, search input expands
3. Dismiss → clears search value + closes overlay

---

## Related

- [Breadcrumb](../shared-ui.md#breadcrumb)
- [PageHeaderSelect](../shared-ui.md#pageheaderselect)
- [conventions.md](../conventions.md)
