# Web-клиент

Web-клиент TG Platform — браузерный интерфейс для полного цикла работы с каналом: лента, пространство поста, чаты, заметки, аналитика, профиль.

**Текущая фаза:** **M2 Shell** complete — sidebar, PageHeader, RouteSync, ContentAdaptSync. Следующий шаг — **M3 Widgets**. План — [08-roadmap.md](../product/08-roadmap.md), выжимка — [frontend-roadmap.md](./frontend-roadmap.md).

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
| [architecture.md](./architecture.md) | FSD-слои, data flow, routing |
| [data-model.md](./data-model.md) | Доменная модель |
| [routing.md](./routing.md) | URL и navigation |
| [local-first.md](./local-first.md) | Phase 1: MSW, seed, stub AI |
| [api-schemas.md](./api-schemas.md) | REST endpoints |
| [testing.md](./testing.md) | Vitest, Playwright, DoD |
| [deploy.md](./deploy.md) | Static export |
| [API_CONTRACT.yaml](./API_CONTRACT.yaml) | REST contract frontend ↔ backend |
| [BACKEND_READINESS.md](./BACKEND_READINESS.md) | Checklist подключения backend |

**Решение:** наследуем инженерный стек из `frontend-v2`. UX — из `web-legacy` (wireframes, pages.md), без копирования legacy CSS/кода.

---

## Где живёт код

```
web/
├── src/            ← active client (stack = stack.md)
└── docs/
```

---

## Фазы клиента

См. [08-roadmap.md](../product/08-roadmap.md) (полный) и [frontend-roadmap.md](./frontend-roadmap.md) (milestones).

| Milestone | Содержание |
|-----------|------------|
| **M0** Docs | ✅ complete |
| **M1** Foundation | routes, CI, repositories, seed — ✅ |
| **M2** Shell | sidebar, PageHeader, RouteSync — ✅ |
| **M3–M4** UI | widgets → features → 9 screens — **сейчас** |
| **M5** Local-first | MSW + stub AI + full CRUD demo |
| **M6** GitHub Pages | static export + deploy workflow |
| **M7** Backend-ready | `http` mode, [BACKEND_READINESS.md](./BACKEND_READINESS.md) |
| **Track B** | Real Telegram, LLM, persistence — после M7 |

Local-first limits — [local-first.md](./local-first.md).

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
