# TG Platform — Web

Единая точка входа для web-версии TG Platform: продуктовая документация, UX-спецификация и инженерные заметки.

**Сейчас:** документация complete. Код клиента — reference в `frontend-v2/`, UX reference в `web-legacy/`.

## Структура

```
web/
├── docs/
│   ├── product/          ← модель, roadmap
│   ├── ux/               ← pages, flows, wireframes, components, design-tokens
│   ├── engineering/      ← stack, data-model, API, testing, deploy
│   ├── glossary.md
│   └── doc-maintenance.md
└── README.md
```

## Карта документации

→ [docs/README.md](./docs/README.md)

## Статус

| Слой | Статус |
|------|--------|
| Продукт (`docs/product/`) | complete |
| UX (`docs/ux/`) | complete — sync с `web-legacy` |
| Engineering (`docs/engineering/`) | complete — stack v2 |
| Код (`src/`) | не начат — reference: `frontend-v2`, `web-legacy` |

## Legacy-клиенты (вне `web/`)

| Путь | Роль |
|------|------|
| [`../web-legacy/`](../web-legacy/) | **reference UI** |
| [`../frontend/`](../frontend/) | клиент v1 |
| [`../frontend-v2/`](../frontend-v2/) | **reference implementation** |

## Принципы

1. **UX из legacy** — [pages.md](./docs/ux/pages.md), wireframes
2. **Стек из v2** — [stack.md](./docs/engineering/stack.md)
3. **UI на Tailwind/shadcn** — [design-tokens.md](./docs/ux/design-tokens.md)
4. **Local-first** — [local-first.md](./docs/engineering/local-first.md)

## Быстрые ссылки

- [Glossary](./docs/glossary.md)
- [Navigation flows](./docs/ux/flows.md)
- [Data model](./docs/engineering/data-model.md)
