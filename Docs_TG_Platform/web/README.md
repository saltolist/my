# TG Platform — Web

Единая точка входа для web-версии TG Platform: продуктовая документация, UX-спецификация и инженерные заметки.

**Сейчас:** только документация. Код клиента появится здесь позже.

## Структура

```
web/
├── docs/
│   ├── product/
│   ├── ux/
│   │   ├── pages.md          ← экраны и маршруты
│   │   ├── components/     ← каталог UI-элементов
│   │   └── wireframes/       ← layout wireframes
│   └── engineering/
└── README.md
```

## Карта документации

→ [docs/README.md](./docs/README.md)

## Статус

| Слой | Статус |
|------|--------|
| Продукт (`docs/product/`) | перенесено из `concept/` |
| UX (`docs/ux/`) | wireframes синхронизированы с `web-legacy` |
| Engineering (`docs/engineering/`) | стек зафиксирован — наследие `frontend-v2` |
| Код (`src/`) | не начат — reference: `frontend-v2` (код), `web-legacy` (UX) |

## Legacy-клиенты (вне `web/`)

Reference UI для wireframes и будущей реализации:

| Путь | Роль |
|------|------|
| [`../web-legacy/`](../web-legacy/) | **reference UI** — wireframes описывают этот клиент |
| [`../frontend/`](../frontend/) | клиент v1 |
| [`../frontend-v2/`](../frontend-v2/) | **reference implementation** — стек и архитектура для `web/` |

## Принципы новой версии

1. **UX из legacy** — wireframes и `pages.md` описывают `web-legacy`.
2. **Стек из v2** — Next.js 16, Tailwind, shadcn, FSD — см. [stack.md](./docs/engineering/stack.md).
3. **UI с нуля** — не копируем legacy CSS, реализуем на Tailwind/shadcn.
4. **Local-first на старте** — MSW + seed-данные, backend по [roadmap](./docs/product/08-roadmap.md).
