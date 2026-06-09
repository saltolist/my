# Doc maintenance

Как поддерживать документацию `web/docs/` в актуальном состоянии.

---

## Ownership by layer

| Layer | Source of truth | Update when |
|-------|-----------------|-------------|
| **Product** | `docs/product/` | Product model, roadmap, scope changes |
| **UX screens** | `docs/ux/pages.md` | Legacy UI behavior changes |
| **UX layout** | `docs/ux/wireframes/` | Visual structure changes |
| **UX components** | `docs/ux/components/` | Widget/feature behavior changes |
| **Engineering stack** | `docs/engineering/stack.md` | Tooling/deps change in `frontend-v2` |
| **Data model** | `docs/engineering/data-model.md` | Types/schemas change |
| **API** | `API_CONTRACT.yaml`, `api-schemas.md` | MSW handlers change |
| **Routing** | `docs/engineering/routing.md` | `routes.ts` behavior changes |

## Принцип

**UX = `web-legacy` 1:1.** `pages.md` и wireframes — источник правды для интерфейса. Product объясняет модель; расхождение product ↔ UX — ошибка документации, правим тексты.

---

## When legacy UI changes

1. Update [pages.md](./ux/pages.md) first
2. Sync affected [wireframes/](./ux/wireframes/)
3. Update [components/](./ux/components/) specs
4. Check [flows.md](./ux/flows.md) and [parity.md](./ux/parity.md)
5. If product doc расходится с UX — **сверить с legacy** и обновить product или `pages.md`

**Do not** copy legacy code into `web/` — docs only.

---

## When frontend-v2 types/API change

1. [data-model.md](./engineering/data-model.md)
2. [api-schemas.md](./engineering/api-schemas.md) + [API_CONTRACT.yaml](./engineering/API_CONTRACT.yaml)
3. [local-first.md](./engineering/local-first.md) if seed/stub changes
4. [BACKEND_READINESS.md](./engineering/BACKEND_READINESS.md) if new endpoints

---

## Redirect stubs

Old paths redirect to `web/docs/`:

- `concept/` → [product/](./product/)
- `concept/10-pages.md` → [ux/pages.md](./ux/pages.md)
- `concept/12-web-client.md` → [engineering/web-client.md](./engineering/web-client.md)

Keep stubs when moving docs; don't delete without updating external links.

---

## Reading order

1. [01-essence.md](./product/01-essence.md)
2. [03-spaces.md](./product/03-spaces.md) + [04-ai-system.md](./product/04-ai-system.md)
3. [pages.md](./ux/pages.md)
4. [stack.md](./engineering/stack.md) + [web-client.md](./engineering/web-client.md)
5. [glossary.md](./glossary.md) as needed

Index: [README.md](./README.md).

---

## Related

- [parity.md](./ux/parity.md)
