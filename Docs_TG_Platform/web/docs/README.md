# Документация TG Platform Web

## Product — что строим

| Документ | Содержание |
|----------|------------|
| [01-essence.md](./product/01-essence.md) | Проблема, решение, принципы |
| [02-modules.md](./product/02-modules.md) | Модули и навигация |
| [03-spaces.md](./product/03-spaces.md) | Пространственная модель (global + local) |
| [04-ai-system.md](./product/04-ai-system.md) | Двухуровневая ИИ-система |
| [04b-ai-system-mempalace.md](./product/04b-ai-system-mempalace.md) | Расширение памяти ИИ |
| [05-channel-profile.md](./product/05-channel-profile.md) | Профиль канала |
| [06-analytics.md](./product/06-analytics.md) | Аналитика канала и платформы |
| [07-notes.md](./product/07-notes.md) | Модель заметок |
| [08-roadmap.md](./product/08-roadmap.md) | Фазы разработки |
| [09-user-scenario.md](./product/09-user-scenario.md) | Сквозной сценарий |
| [11-reusable-modules-integration.md](./product/11-reusable-modules-integration.md) | Связь с reusable-modules |
| [13-chat-context-summaries.md](./product/13-chat-context-summaries.md) | Сводки контекста чатов |

## UX — как выглядит

| Документ | Содержание |
|----------|------------|
| [pages.md](./ux/pages.md) | **Источник правды** — структура всех экранов |
| [wireframes/](./ux/wireframes/) | Wireframes по экранам |

### Wireframes

- [01-home.md](./ux/wireframes/01-home.md) — старт / глобальный чат
- [02-feed.md](./ux/wireframes/02-feed.md) — лента
- [03-post.md](./ux/wireframes/03-post.md) — пространство поста
- [04-note.md](./ux/wireframes/04-note.md) — страница заметки
- [05-global-chat.md](./ux/wireframes/05-global-chat.md) — глобальный чат
- [06-chats.md](./ux/wireframes/06-chats.md) — каталог чатов
- [07-notes.md](./ux/wireframes/07-notes.md) — каталог заметок
- [08-analytics.md](./ux/wireframes/08-analytics.md) — аналитика
- [09-profile.md](./ux/wireframes/09-profile.md) — профиль

## Engineering — как реализуем

| Документ | Содержание |
|----------|------------|
| [web-client.md](./engineering/web-client.md) | Web-клиент: фаза, границы, стек |
| [web-client.legacy.md](./engineering/web-client.legacy.md) | Архив: описание v1-клиента |

## Порядок чтения

1. [01-essence.md](./product/01-essence.md) — зачем платформа
2. [03-spaces.md](./product/03-spaces.md) + [04-ai-system.md](./product/04-ai-system.md) — ключевая модель
3. [pages.md](./ux/pages.md) — все экраны
4. [web-client.md](./engineering/web-client.md) — текущая инженерная фаза
