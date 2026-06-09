# Architecture

Архитектура web-клиента. Стек — [stack.md](./stack.md).

---

## Principles

1. **UX из legacy** — экраны и компоненты по [pages.md](../ux/pages.md) и [components/](../ux/components/).
2. **Код по v2** — data layer, tooling, FSD как в [`frontend-v2`](../../../frontend-v2/).
3. **UI implementation** — Tailwind + shadcn (не копировать legacy CSS).
4. **Local-first first** — MSW + seed до backend.

---

## FSD layers

```
app → screens → widgets → features → entities → shared
```

| Layer | Path | Responsibility |
|-------|------|----------------|
| **app** | `src/app/` | Next.js routes, providers, Zustand stores |
| **screens** | `src/screens/` | Screen composition (1 URL ≈ 1 slice) |
| **widgets** | `src/widgets/` | Large UI blocks (sidebar, composer, feed) |
| **features** | `src/features/` | User scenarios (schedule-post, manage-drafts) |
| **entities** | `src/entities/` | Domain entities + TanStack Query hooks |
| **shared** | `src/shared/` | UI kit, lib, API, types, seed |

Import **down only**. Cross-slice via public `index.ts`.

---

## Data flow

```
UI (screen / widget / feature)
  → TanStack Query hook (entities/*/model)
    → Repository interface (shared/api/repositories.ts)
      → MSW handlers (dev) | HTTP client (prod)
        → Backend API | in-memory seed store
```

Mode switch: `shared/config/dataSource.ts` → `getDataSourceMode()`.

---

## State split

| Data | Store | Examples |
|------|-------|----------|
| Server | TanStack Query | posts, chats, notes, profile |
| UI chrome | Zustand | sidebar collapsed, feed width, dirty flags |
| Navigation | Zustand | post navigation stack |
| Theme | next-themes | light / dark / system |

Legacy держал почти всё в Context + reducers — **не повторяем**.

---

## Routing

Full spec — [routing.md](./routing.md).

- Thin routes: `src/app/(shell)/*/page.tsx` → `@/screens/*`
- Route parsing: `shared/lib/routes.ts`
- `trailingSlash: true`; gchat via `?id=` query (static export)
- Post modes (`chat` / `chats` / `notes` / `comments`) in Zustand, not URL
- Legacy subpaths `/post/{id}/notes/` redirect to `/post/{id}/` + state

### Screens map

| Route | Screen |
|-------|--------|
| `/` | home |
| `/feed/` | feed |
| `/post/{id}/` | post |
| `/gchat/` | gchat |
| `/note/global/{id}/` | note |
| `/note/post/{postId}/{noteId}/` | note |
| `/chats/` | chats |
| `/notes/` | notes |
| `/analytics/` | analytics |
| `/profile/` | profile |

---

## API layer

```
shared/api/
├── repositories.ts      # Interface definitions
├── httpRepositories.ts  # HTTP implementation
├── seedRepositories.ts  # In-memory implementation
├── httpClient.ts
├── queryKeys.ts
├── schemas/             # Zod schemas per entity
└── msw/
    ├── handlers.ts
    ├── browser.ts
    └── server.ts        # Vitest
```

RepositoryProvider injects implementation based on `getDataSourceMode()`.

---

## Shared structure

```
shared/
├── api/
├── config/          # dataSource, routes config
├── data/            # seed-data.ts
├── lib/             # pure functions
├── types/           # domain types
└── ui/              # shadcn-based kit
```

---

## Screen development order

1. Foundation — shell, sidebar, page-header, repositories, MSW
2. Home + Composer
3. Feed
4. Post workspace
5. GChat + Chats catalog
6. Notes + Note editor
7. Analytics
8. Profile

---

## Testing strategy

| Level | Tool | Target |
|-------|------|--------|
| Unit | Vitest | lib, schemas, repositories |
| Component | Vitest + RTL | isolated widgets |
| E2E | Playwright | critical paths per screen |
| MSW | handlers | API contract parity |

---

## Related

- [stack.md](./stack.md)
- [data-model.md](./data-model.md)
- [routing.md](./routing.md)
- [local-first.md](./local-first.md)
- [testing.md](./testing.md)
- [components/](../ux/components/) — UI component specs (legacy UX)
- [frontend-v2/ARCHITECTURE.md](../../../frontend-v2/ARCHITECTURE.md) — reference code architecture
