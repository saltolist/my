# TG Platform — Web

Единая точка входа для web-версии TG Platform: продуктовая документация, UX-спецификация и инженерные заметки.

**Сейчас:** только документация. Код клиента появится здесь позже.

## Структура

```
web/
├── docs/
│   ├── product/        # что строим и зачем
│   ├── ux/             # экраны, wireframes
│   └── engineering/    # web-клиент, API, деплой
└── README.md           # этот файл
```

## Карта документации

→ [docs/README.md](./docs/README.md)

## Статус

| Слой | Статус |
|------|--------|
| Продукт (`docs/product/`) | перенесено из `concept/` |
| UX (`docs/ux/`) | перенесено из `concept/10-pages` + `wireframes/` |
| Engineering (`docs/engineering/`) | в работе |
| Код клиента (`src/`) | не начат |

## Legacy-клиенты (вне `web/`)

Архивные реализации остаются на месте до миграции кода:

| Путь | Роль |
|------|------|
| [`../web-legacy/`](../web-legacy/) | первый прототип, reference only |
| [`../frontend/`](../frontend/) | клиент v1 |
| [`../frontend-v2/`](../frontend-v2/) | зачаток v2, станет основой `web/src/` |

## Принципы новой версии

1. **UI с нуля** — не копируем legacy, проектируем заново по UX-докам.
2. **Документация первична** — `docs/ux/pages.md` — источник правды для экранов.
3. **Local-first на старте** — MSW + seed-данные, backend по [roadmap](./docs/product/08-roadmap.md).
