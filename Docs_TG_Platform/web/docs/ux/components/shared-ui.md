# Shared UI

Примитивы без доменной логики. Код: `web-legacy/src/shared/ui/`.

---

## Breadcrumb

**Файл:** `breadcrumb/ui/Breadcrumb.tsx`

### Anatomy

```
[Лента] / [Название поста] / [Текущий сегмент]
  ↑ bc-link      ↑ bc-post-title (truncate)   ↑ crumb-current
```

### BreadcrumbItem

| Поле | Тип | Описание |
|------|-----|----------|
| `label` | ReactNode | Текст сегмента |
| `onClick` | `() => void` | Клик (только для некurrent сегментов) |
| `variant` | `default` \| `title` | `title` → класс `bc-post-title` (truncate длинных названий) |
| `current` | boolean | Текущая страница; default — последний сегмент |

### CSS

- `.breadcrumb` — контейнер `nav`
- `.bc-sep` — разделитель `/`
- `.bc-link` — кликабельный сегмент (button)
- `.crumb-current` — текущий сегмент (span)
- `.bc-crumb-fixed` — фиксированная ширина label
- `.bc-post-title` — ellipsis для названия поста

### Trails

Строятся в `shared/lib/nav/breadcrumbTrails.ts` для post, gchat, note.

---

## ContextMenu

**Файл:** `context-menu/ui/ContextMenu.tsx`

### Anatomy

```
[••• trigger]  →  dropdown (inline | portal)
                    ├─ item (icon + label)
                    ├─ item.danger
                    └─ item.disabled
```

### CtxMenuItem

| Поле | Описание |
|------|----------|
| `label` | Текст пункта |
| `icon` | ReactNode слева |
| `onClick` | Действие; закрывает меню |
| `danger` | Красный стиль (Удалить) |
| `active` | Подсветка текущего (select items) |
| `disabled` | Неактивный пункт |

### Props (ключевые)

| Prop | Default | Описание |
|------|---------|----------|
| `trigger` | `•••` | Содержимое кнопки |
| `portal` | false | Render в body (fixed position) |
| `align` | `right` | Выравнивание panel |
| `matchTriggerWidth` | false | min-width = ширина trigger |
| `triggerVariant` | `menu` | `custom` для PageHeaderSelect |
| `dropdownClassName` | — | Модификаторы panel |

### States

- `open` — `aria-expanded`, класс `.open` на dropdown
- Portal panel: `visibility: hidden` до расчёта позиции

### Использование

- Post header `•••`
- Gchat delete
- CardContextMenu (sidebar recents)
- **PageHeaderSelect** — triggerVariant `custom`

---

## ModelPicker

**Файл:** `model-picker/ui/ModelPicker.tsx`

### Anatomy

```
[icon] [label ▾]  →  portal dropdown (listbox)
                       options | sections[]
```

### Props

| Prop | Описание |
|------|----------|
| `value` | id выбранной опции |
| `options` | `{ id, label }[]` flat list |
| `sections` | `{ title, options[] }[]` grouped |
| `onChange` | `(id) => void` |
| `icon` | BrainIcon / SearchIcon |
| `placement` | `up` \| `down` |
| `buttonLabelFormatter` | Короткая подпись на кнопке |
| `emptyValue` / `emptyLabel` | Placeholder когда нет выбора |
| `placeholderLabel` | Когда options пуст |
| `disabled` | `.is-disabled`, no dropdown |

### States

| State | CSS |
|-------|-----|
| open | `.model-picker.is-open` |
| disabled | `.model-picker.is-disabled` |
| static (multi) | `.model-picker.is-static` — pill «Мультиответ» |

### Composer vs profile

- Composer: class `composer-model-picker`, placement sync с attach
- Profile: class `profile-model-picker`, period picker на analytics

---

## PageHeaderSelect

**Файл:** `page-header/ui/PageHeaderSelect.tsx` (widget, но паттерн select)

Обёртка ContextMenu как dropdown-select.

| Prop | Описание |
|------|----------|
| `value` / `options` / `onChange` | Controlled select |
| `chevron` | `both` (↕) \| `down` (↓) |
| `tightWidth` | Узкий trigger (profile tabs) |
| `ariaLabel` | Accessibility |

**Panel:** `ctx-dropdown--page-header-control ctx-dropdown--page-header-select`

**Использование:** chats scope, notes scope, analytics period (mobile), profile tabs.

---

## FilterTabSelect

**Файл:** `filter-tab-select/ui/FilterTabSelect.tsx`

Mobile-only select для FilterToolbar когда tabs не помещаются.

- Те же `options: { value, label }[]`
- Стили через `selectClassName`

---

## EmptyState

**Файл:** `empty-state/ui/EmptyState.tsx`

```
[emoji icon]
  message text
```

| Prop | Пример |
|------|--------|
| `icon` | `💬`, `📝` |
| `message` | «Нет чатов» |
| `style` | gridColumn override |

---

## Checkbox / PasswordToggleIcon

- **Checkbox** — profile forms, AI multi flags
- **PasswordToggleIcon** — show/hide API keys, passwords

---

## CardContextMenu

**Файл:** `card-menu/ui/CardContextMenu.tsx`

Меню `⋯` на карточках sidebar recents. Обёртка ContextMenu.

---

## ErrorFallback

**Файл:** `error-fallback/ui/ErrorFallback.tsx`

Error boundary UI для `app/error.tsx`.

---

## Icons

| Файл | Иконки |
|------|--------|
| `icons/post-status-icons.tsx` | CheckIcon, ClockIcon, PencilIcon |
| `icons/more-dots.tsx` | MoreDotsIcon |
| `icons/header-menu-icons.tsx` | Trash, etc. для overflow |

См. также widget icons: `NavIcons`, `AttachMenuIcons`, `NoteHeaderIcons`.
