# Navigation flows

Сквозные сценарии навигации в reference UI. Экраны — [pages.md](./pages.md). Маршруты — [routing.md](../engineering/routing.md).

Не путать с продуктовым сценарием [09-user-scenario.md](../product/09-user-scenario.md) (backend, real LLM).

---

## 1. Home → new global chat

```mermaid
sequenceDiagram
  participant User
  participant Home
  participant Composer
  participant GChat

  User->>Home: open /
  User->>Composer: type message, send
  Composer->>GChat: create GlobalChat, navigate
  GChat->>User: show thread + stub AI reply
```

Ref: [pages.md § home](./pages.md#1-home), [pages.md § gchat](./pages.md#2-gchat)

---

## 2. Sidebar → feed → post

```mermaid
flowchart LR
  Sidebar -->|Лента| Feed
  Feed -->|click card| PostChat["post / chat mode"]
```

Ref: [02-feed wireframe](./wireframes/02-feed.md), [03-post wireframe](./wireframes/03-post.md)

---

## 3. Post header tabs (toggle)

```mermaid
stateDiagram-v2
  chat --> notes: tab Заметки
  notes --> chat: tab Заметки again
  chat --> chats: tab Чаты
  chats --> chat: tab Чаты again
  chat --> comments: tab comments published only
  comments --> chat: tab again
```

Modes in Zustand, not URL. Ref: [routing.md](../engineering/routing.md#post-navigation-zustand)

---

## 4. Post context menu by status

```mermaid
flowchart TD
  Menu[Context menu]
  Menu --> NewChat[Новый чат]
  Menu --> NewNote[Новая заметка]
  Menu --> DraftActions{status}
  DraftActions -->|draft| Pub[Опубликовать]
  DraftActions -->|draft| Sched[Запланировать]
  DraftActions -->|scheduled| Resched[Перенести]
  DraftActions -->|scheduled| Cancel[Отменить публикацию]
  DraftActions -->|any| Del[Удалить]
```

Ref: [features.md](./components/features.md#post-context-menu)

---

## 5. Feed draft DnD reorder

```mermaid
flowchart LR
  DraftsSection -->|drag 6-dot handle| Reorder[in-memory order]
  Reorder -->|page reload| Reset[seed order restored]
```

Ref: [widgets/feed.md](./components/widgets/feed.md)

---

## 6. Sidebar recent → note

```mermaid
flowchart LR
  Sidebar -->|recent note click| NoteGlobal["/note/global/id/"]
  Sidebar -->|recent local note| NoteLocal["/note/post/postId/noteId/"]
```

Ref: [pages.md § sidebar](./pages.md#навигация-левая-панель)

---

## 7. Sidebar recent → chat

```mermaid
flowchart LR
  Sidebar -->|global chat| GChat["/gchat/?id="]
  Sidebar -->|local chat| PostChat["/post/id/?chat=localId"]
```

---

## 8. Chats catalog

```mermaid
flowchart TD
  Chats["/chats/"]
  Chats -->|Новый чат| Home["/"]
  Chats -->|global card| GChat
  Chats -->|local card click| PostChat
  Chats -->|scope filter| Filter[Все / Глобальные / Локальные]
```

Ref: [06-chats wireframe](./wireframes/06-chats.md)

---

## 9. Notes catalog → new note

```mermaid
flowchart TD
  Notes["/notes/"]
  Notes -->|+ Новая заметка| NoteNew["/note/new/?from=notes"]
  Notes -->|card click global| NoteGlobal
  Notes -->|card click local| NoteLocal
```

Ref: [07-notes wireframe](./wireframes/07-notes.md)

---

## 10. Note editor dirty guard

```mermaid
sequenceDiagram
  participant User
  participant NoteEditor
  participant Router

  User->>NoteEditor: edit title/body
  User->>Router: navigate away
  Router->>User: confirm if changed
  alt discard
    User->>Router: leave
  else stay
    User->>NoteEditor: remain
  end
```

Ref: [screens.md](./components/screens.md#dirty-guards)

---

## 11. Profile tab dirty guard

```mermaid
sequenceDiagram
  participant User
  participant Profile
  User->>Profile: edit Настройки or Канал
  User->>Profile: switch tab
  Profile->>User: window.confirm if dirty
```

Start tab: **Настройки**. Ref: [09-profile wireframe](./wireframes/09-profile.md)

---

## 12. Analytics period filter

```mermaid
flowchart LR
  Analytics["/analytics/"]
  Analytics --> Period[select period]
  Period --> Charts[update metrics charts heatmap table]
```

Periods: 24ч, 7д, 30д, 90д, всё время. Mobile: period in header. Ref: [08-analytics wireframe](./wireframes/08-analytics.md)

---

## Related

- [pages.md](./pages.md)
- [parity.md](./parity.md)
- [web-client.md](../engineering/web-client.md)
