# note-editor

**Путь:** `web-legacy/src/widgets/note-editor/`

Страница заметки: заголовок, тулбар, тело, вложения.

---

## Page layout

```
PageHeader (breadcrumbs + overflow menu)
└─ note-page
   └─ NoteEditor
      ├─ title textarea (useFitTitleSize)
      ├─ NoteHeaderToolbar
      ├─ body (view | edit)
      └─ NoteFilesPanel
```

---

## Modes: view | edit

| Aspect | view | edit |
|--------|------|------|
| Attach btn | hidden | visible |
| Body | rendered HTML/text | NoteBodyEditor |
| Mode toggle icon | Edit | Preview |
| Cancel btn | hidden | if changed |
| Save btn | disabled unless changed | enabled if changed |

**Note:** title textarea editable in both modes.

---

## NoteHeaderToolbar

| Control | Condition |
|---------|-----------|
| 📎 Attach | `showAttach && mode===edit` |
| Edit/Preview icon | `showModeToggle` |
| Сохранить | always; `disabled={saveDisabled}` |
| Отменить | `showCancel && changed` |

---

## NoteBodyEditor

ContentEditable-like line model with embed support.

### Subcomponents

| Part | Role |
|------|------|
| `NoteBodyCanvas` | Scroll container |
| `NoteBodyCell` | Single line cell |
| `ImageGridLine` | Image grid embed row |
| `NoteBodyDropIndicator` | Drop target line |
| `NoteEmbedDragPreview` | Drag ghost |

### Embed types

- File chips `[filename]` inline in text
- Image grids (multi-image embed blocks)

### Drag-and-drop (edit only)

1. File from `NoteFilesPanel` → drag to body → embed chip
2. Reorder embed chips within body
3. External file drop → adds to attachments + embed

---

## NoteFilesPanel

- List attached files
- Add via attach button or drop
- Each file: name, remove option
- DnD source for body embeds

---

## NoteListCardMenu

Overflow on list cards:

- Delete note (with confirm)

---

## Header overflow menu (useNoteScreen)

| Item | Condition |
|------|-----------|
| Учитывать в ИИ | toggle ai flag |
| Не учитывать в ИИ | toggle ai flag |
| Удалить заметку | existing note |
| Отменить | new unsaved note |

---

## Dirty guards

- `beforeunload` if unsaved
- `window.confirm` on navigate away
- Save enables only on `changed` diff

---

## useFitTitleSize

- Single-line title textarea
- Font size scales down for long titles
- No manual line breaks intended

---

## Local vs global note

| Type | Breadcrumb |
|------|------------|
| Global | `Заметки / Title` |
| Local | `Лента / Post title / Note title` |

No `📌 Локальная` badge in body (breadcrumb only).

---

## Related

- [entities NoteCardAiToggle](../entities.md#notecardaitoggle)
- [shared lib noteEmbeds](../../../../web-legacy/src/shared/lib/noteEmbeds/)
