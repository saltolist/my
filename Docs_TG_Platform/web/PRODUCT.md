# TG Platform — продукт

**TG Platform** — production frontend платформы для ведения Telegram-канала с ИИ: лента, посты, чаты, заметки, аналитика, профиль канала.

Исходники web-клиента: **`Docs_TG_Platform/web/`**.

## Статус

| Слой | Сейчас | Дальше |
|------|--------|--------|
| **UI / UX** | Production-ready интерфейс, FSD-архитектура | `index.ts`, eslint boundaries |
| **Данные** | In-memory store + seed-данные для разработки | API / persistence |
| **ИИ / Telegram** | Локальные ответы и формы интеграций в UI | Реальные провайдеры и MTProto |

Поведение «без бэкенда» — **временная фаза разработки**, не определение продукта.

## Документация

- [ARCHITECTURE.md](./ARCHITECTURE.md) — Feature-Sliced Design, слои, aliases
- [README.md](./README.md) — запуск, маршруты, возможности
- [`../concept/`](../concept/) — продуктовая спецификация

## Терминология в коде

| Legacy | Сейчас |
|--------|--------|
| demo-data | `shared/data/seed-data.ts` |
| userDemo | `shared/lib/profile/defaultUser.ts` |
| tg-demo-* (localStorage) | `tg-platform-*` |

## Команда

```bash
cd Docs_TG_Platform/web
npm install
npm run dev
```
