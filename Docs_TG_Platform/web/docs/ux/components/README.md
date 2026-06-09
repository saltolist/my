# Каталог UI-компонентов

Детальная спецификация интерфейса reference-клиента [`web-legacy`](../../../../web-legacy/).

> **Статус `web-legacy`:** рабочая, но **не поддерживаемая** версия. Код не переносится — документация фиксирует фактический UI как эталон для новой реализации в `web/`.

## Как читать

1. [conventions.md](./conventions.md) — breakpoints, portal, CSS-паттерны
2. [shared-ui.md](./shared-ui.md) — примитивы (Breadcrumb, ModelPicker, …)
3. [entities.md](./entities.md) — доменные карточки
4. [widgets/](./widgets/) — составные блоки
5. [features.md](./features.md) — пользовательские сценарии
6. [screens.md](./screens.md) — композиция экранов

## Слои (FSD)

```
app → screens → widgets → features → entities → shared
```

## Widgets

| Widget | Doc | Экраны |
|--------|-----|--------|
| app-shell | [app-shell.md](./widgets/app-shell.md) | все |
| sidebar | [sidebar.md](./widgets/sidebar.md) | все |
| page-header | [page-header.md](./widgets/page-header.md) | все кроме pure home body |
| composer | [composer.md](./widgets/composer.md) | home, gchat, post, feed |
| feed | [feed.md](./widgets/feed.md) | feed |
| post-workspace | [post-workspace.md](./widgets/post-workspace.md) | post |
| chat-thread | [chat-thread.md](./widgets/chat-thread.md) | gchat, post/chat |
| note-editor | [note-editor.md](./widgets/note-editor.md) | note, post/notes |
| filter-toolbar | [filter-toolbar.md](./widgets/filter-toolbar.md) | notes, chats, post submodes |
| analytics-dashboard | [analytics-dashboard.md](./widgets/analytics-dashboard.md) | analytics |
| charts | [charts.md](./widgets/charts.md) | analytics, profile |
| profile-settings | [profile-settings.md](./widgets/profile-settings.md) | profile |

## Связь с другими документами

- Экраны — [pages.md](../pages.md)
- Wireframes — [wireframes/](../wireframes/)
- Продуктовая модель (шире UI) — [product/](../../product/)
