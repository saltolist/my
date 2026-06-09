# Web-клиент

Web-клиент TG Platform — браузерный интерфейс для полного цикла работы с каналом: лента, пространство поста, чаты, заметки, аналитика, профиль.

**Текущая фаза:** документация и проектирование. Код появится в `web/src/`; reference implementation — [`frontend-v2`](../../../frontend-v2/).

---

## Зачем отдельный документ

- Зафиксировать границу «работает в браузере» vs «требует сервер».
- Описать фазы разработки и критерии готовности.
- Связать продуктовую модель с инженерной реализацией.

---

## Стек и архитектура

| Документ | Содержание |
|----------|------------|
| [stack.md](./stack.md) | **Стек** — Next.js 16, React 19, Tailwind v4, shadcn, FSD, MSW, TanStack Query |
| [architecture.md](./architecture.md) | FSD-слои, data flow, routing, testing |
| [API_CONTRACT.yaml](./API_CONTRACT.yaml) | REST contract frontend ↔ backend |
| [BACKEND_READINESS.md](./BACKEND_READINESS.md) | Checklist подключения backend |

**Решение:** наследуем инженерный стек из `frontend-v2`. UX — из `web-legacy` (wireframes, pages.md), без копирования legacy CSS/кода.

---

## Где живёт код

```
web/
├── docs/           ← сейчас
└── src/            ← будущий клиент (stack = stack.md)
```

Reference implementation до миграции: [`frontend-v2/`](../../../frontend-v2/).

---

## Фазы клиента

### Фаза 0 — Документация (сейчас)

- Продуктовая модель в [`docs/product/`](../product/)
- UX-спека в [`docs/ux/pages.md`](../ux/pages.md), wireframes, [components/](../ux/components/)
- Стек и архитектура в [`engineering/`](./)

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
