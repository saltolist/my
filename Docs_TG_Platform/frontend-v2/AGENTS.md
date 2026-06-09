<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Frontend 2.0 — правила для агентов

- Разрабатывать **только** в `Docs_TG_Platform/frontend-v2/`.
- `web-legacy/` — read-only референс; `frontend/` — соседний v1, не копировать код.
- Новые UI-компоненты: shadcn в `src/shared/ui/`, платформенные примитивы поверх них.
- Один PR / итерация = один виджет или один экран, не «всё сразу».
