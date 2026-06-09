# TG Platform — Frontend 2.0

Новая версия web-клиента TG Platform. Пишется **с нуля**: тот же стек, что и в [`../frontend/`](../frontend/), но свой UI и композиция. [`../web-legacy/`](../web-legacy/) — только референс по UX и паттернам, не источник для копипаста.

## Quick start

```bash
cd Docs_TG_Platform/frontend-v2
npm ci
npm run dev
```

Откройте [http://localhost:3001](http://localhost:3001) (порт 3001, чтобы не конфликтовать с frontend v1 на 3000).

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Dev server |
| `npm run build` | Static export → `out/` |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint + FSD boundaries |
| `npm run test` | Vitest unit tests |
| `npm run check` | typecheck + lint + test + build |

## Статус

**Фаза: Shell + headers** — сайдбар, шапка, все верхнеуровневые страницы (тела — заглушки).

Готово:

- Sidebar: rail collapse, навигация по спеке, недавние чаты/заметки (preview-данные)
- PageHeader: glass, title/breadcrumbs, center slot, back, actions, `•••` menu
- Экраны: `home`, `feed`, `chats`, `notes`, `analytics`, `profile`

Следующие шаги:

1. Home — Composer и глобальный ИИ-чат
2. Feed — секции ленты и карточки постов
3. Post workspace → GChat → Note

## Документация

- [ARCHITECTURE.md](./ARCHITECTURE.md) — FSD, data flow, соглашения v2
- Product spec: [`../concept/10-pages.md`](../concept/10-pages.md)
- UX reference: [`../web-legacy/`](../web-legacy/) (read-only)

## Связь с другими клиентами

| Путь | Роль |
|------|------|
| `frontend/` | Текущий production-клиент (v1) |
| `frontend-v2/` | Новый клиент (v2), активная разработка |
| `web-legacy/` | Архивный референс |
