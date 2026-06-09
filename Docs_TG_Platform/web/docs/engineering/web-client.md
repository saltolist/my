# Web-клиент

Web-клиент TG Platform — браузерный интерфейс для полного цикла работы с каналом: лента, пространство поста, чаты, заметки, аналитика, профиль.

**Текущая фаза:** документация и проектирование. Код живёт в [`web/`](../..); исходники появятся в `web/src/` после завершения UX-спеки.

---

## Зачем отдельный документ

- Зафиксировать границу «работает в браузере» vs «требует сервер».
- Описать целевой стек и архитектуру до начала разработки.
- Связать продуктовую модель с инженерной реализацией.

---

## Где живёт код (план)

```
web/
├── docs/           ← сейчас
└── src/            ← Next.js-клиент (будущее)
    ├── app/
    ├── screens/
    ├── widgets/
    ├── features/
    ├── entities/
    └── shared/
```

**Стек (целевой):** Next.js (App Router) + React + TypeScript + Tailwind + shadcn/ui, Feature-Sliced Design.

**Сборка:** static export → `out/` (без Node-сервера в prod).

**Legacy reference:** [`../../web-legacy/`](../../web-legacy/) — только для UX-референса, не для копирования кода.

---

## Фазы клиента

### Фаза 0 — Документация (сейчас)

- Продуктовая модель в [`docs/product/`](../product/)
- UX-спека в [`docs/ux/pages.md`](../ux/pages.md) и wireframes
- API-контракт и backend-readiness — по мере готовности

### Фаза 1 — Local-first UI

- In-memory store + MSW mock API + seed-данные
- Все экраны из [pages.md](../ux/pages.md)
- Stub-ответы ИИ (keyword rules), без реальных LLM
- Без persistence между перезагрузками

### Фаза 2 — Backend

По [08-roadmap.md](../product/08-roadmap.md):

- REST/WebSocket API, persistence
- Telegram MTProto, реальные LLM
- Публикация постов, синхронизация

---

## Архитектура (целевая)

```
UI (screen / widget / feature)
  → TanStack Query hook (entities/*/model)
    → Repository interface (shared/api)
      → MSW handlers (dev) | HTTP client (prod)
        → Backend API
```

| Concern | Tool |
|---------|------|
| Server data | TanStack Query |
| UI chrome | Zustand |
| Theme | next-themes |
| Routing | Next.js App Router |

Подробнее появится в `web/ARCHITECTURE.md` при старте кода.

---

## Чего клиент не делает в local-first

- не публикует посты в Telegram;
- не вызывает реальные LLM;
- не сохраняет состояние между перезагрузками;
- нет prod-auth и multi-user.

---

## Связь с продуктом

- Модель пространств — [03-spaces.md](../product/03-spaces.md)
- ИИ-система — [04-ai-system.md](../product/04-ai-system.md)
- Экраны — [pages.md](../ux/pages.md) (источник правды для UX)
- Roadmap — [08-roadmap.md](../product/08-roadmap.md)

При изменении `pages.md` web-клиент обновляется следом.

---

## Критерии готовности UI-слоя

- все экраны из [pages.md](../ux/pages.md) доступны;
- seed-состояние согласовано с [02-modules.md](../product/02-modules.md);
- stub-ответы ИИ не ломают интерфейс;
- `npm run build` проходит без ошибок.

---

## Архив

Описание предыдущего v1-клиента — [web-client.legacy.md](./web-client.legacy.md).
