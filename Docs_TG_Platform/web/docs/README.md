# Документация TG Platform Web

→ [doc-maintenance.md](./doc-maintenance.md) — как поддерживать актуальность  
→ [glossary.md](./glossary.md) — термины

## Product — что строим

| Документ | Содержание |
|----------|------------|
| [01-essence.md](./product/01-essence.md) | Проблема, решение, принципы |
| [02-modules.md](./product/02-modules.md) | Модули и навигация |
| [03-spaces.md](./product/03-spaces.md) | Пространственная модель (global + local) |
| [04-ai-system.md](./product/04-ai-system.md) | Двухуровневая ИИ-система |
| [04b-ai-system-mempalace.md](./product/04b-ai-system-mempalace.md) | Backend-память (MemPalace) — **не legacy UI** |
| [05-channel-profile.md](./product/05-channel-profile.md) | Профиль канала (поля вкладки «Канал») |
| [06-analytics.md](./product/06-analytics.md) | Аналитика канала и платформы |
| [07-notes.md](./product/07-notes.md) | Заметки (глобальные и локальные) |
| [08-roadmap.md](./product/08-roadmap.md) | **Roadmap** — фазы фронтенда, GH Pages, backend-ready |
| [09-user-scenario.md](./product/09-user-scenario.md) | Сквозной сценарий (narrative) |
| [11-reusable-modules-integration.md](./product/11-reusable-modules-integration.md) | Модули backend — **не legacy UI** |
| [13-chat-context-summaries.md](./product/13-chat-context-summaries.md) | Сводки контекста — **не legacy UI** |

## UX — как выглядит

| Документ | Содержание |
|----------|------------|
| [pages.md](./ux/pages.md) | **Источник правды** — структура всех экранов |
| [flows.md](./ux/flows.md) | Navigation flows (12 сценариев) |
| [design-tokens.md](./ux/design-tokens.md) | Design tokens (legacy → Tailwind) |
| [parity.md](./ux/parity.md) | Parity tracker |
| [components/](./ux/components/) | Каталог UI |
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
| [stack.md](./engineering/stack.md) | **Стек** — `web/src/`, стилевая стратегия (tokens + shell CSS) |
| [architecture.md](./engineering/architecture.md) | FSD, data flow |
| [data-model.md](./engineering/data-model.md) | Доменная модель |
| [routing.md](./engineering/routing.md) | URL, query, navigation |
| [local-first.md](./engineering/local-first.md) | MSW, seed, stub AI |
| [api-schemas.md](./engineering/api-schemas.md) | REST endpoints |
| [API_CONTRACT.yaml](./engineering/API_CONTRACT.yaml) | OpenAPI contract |
| [testing.md](./engineering/testing.md) | Vitest, Playwright, CI |
| [m3-m5-gate-checklist.md](./engineering/m3-m5-gate-checklist.md) | **Gate M3–M5** — чеклист до GitHub Pages |
| [pre-pages-execution-plan.md](./engineering/pre-pages-execution-plan.md) | **План до Pages** — этапы и PR-порядок |
| [auth-onboarding-plan.md](./engineering/auth-onboarding-plan.md) | **Auth + онбординг** — вход, регистрация, demo_kanal |
| [deploy.md](./engineering/deploy.md) | Static export, hosting |
| [frontend-roadmap.md](./engineering/frontend-roadmap.md) | Milestones + PR checklist |
| [web-client.md](./engineering/web-client.md) | Фазы клиента |
| [BACKEND_READINESS.md](./engineering/BACKEND_READINESS.md) | Подключение backend |
| [web-client.legacy.md](./engineering/web-client.legacy.md) | Архив v1 |

## Порядок чтения

1. [01-essence.md](./product/01-essence.md) — зачем платформа
2. [03-spaces.md](./product/03-spaces.md) + [04-ai-system.md](./product/04-ai-system.md) — ключевая модель
3. [pages.md](./ux/pages.md) — все экраны
4. [stack.md](./engineering/stack.md) + [web-client.md](./engineering/web-client.md) — стек и фазы
5. [glossary.md](./glossary.md) — по необходимости
