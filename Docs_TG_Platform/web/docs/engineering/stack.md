# Technology stack

Единый источник правды по стеку web-клиента TG Platform.

**Решение:** наследуем стек [`frontend-v2`](../../../frontend-v2/) (Next.js 16, Tailwind v4, shadcn, FSD, MSW, TanStack Query).

**UX reference:** [`web-legacy`](../../../web-legacy/) — только поведение и layout (см. [pages.md](../ux/pages.md)). Код и CSS legacy **не** переносим.

**Reference implementation (временно):** код и конфиги живут в `Docs_TG_Platform/frontend-v2/` до появления `web/src/`.

---

## Core

| Layer | Choice | Version (pin) | Notes |
|-------|--------|---------------|-------|
| Runtime | Node.js | **22** (CI) | LTS для dev и GitHub Actions |
| Language | TypeScript | **5.x**, `strict: true` | `ES2022`, `moduleResolution: bundler` |
| Framework | Next.js | **16.2.7** | App Router |
| UI library | React | **19.2.4** | |
| Package manager | npm | lockfile | `npm ci` в CI |

---

## UI & styling

| Layer | Choice | Notes |
|-------|--------|-------|
| CSS | **Tailwind CSS v4** | `@tailwindcss/postcss` |
| Components | **shadcn v4** | CLI package `shadcn@^4` |
| Primitives | **@base-ui/react** | Headless primitives |
| Icons | **lucide-react** | |
| Class utils | `clsx`, `tailwind-merge`, `class-variance-authority` | |
| Animations | `tw-animate-css` | |
| Theme | **next-themes** | `data-theme` / class strategy |

Legacy использовал кастомный CSS (`app/styles/*.css`). Новый web — **Tailwind + shadcn**, визуал проектируем по wireframes, не копируем legacy stylesheet.

---

## Architecture

| Concern | Choice |
|---------|--------|
| Structure | **Feature-Sliced Design** |
| Layers | `app → screens → widgets → features → entities → shared` |
| Screen layer name | `screens/` (не `pages/` — конфликт с Next.js) |
| Import rule | только вниз по слоям; public API через `index.ts` |
| Lint enforcement | **eslint-plugin-boundaries** |

Подробнее — [architecture.md](./architecture.md).

---

## Data & state

| Concern | Tool | Location |
|---------|------|----------|
| Server data | **TanStack Query v5** | `entities/*/model/use*.ts` |
| API boundary | **Repository pattern** | `shared/api/repositories.ts` |
| Mock API (dev) | **MSW v2** | `shared/api/msw/` |
| Validation | **Zod v4** | `shared/api/schemas/` |
| HTTP client | fetch wrapper | `shared/api/httpClient.ts` |
| UI chrome | **Zustand v5** | `app/model/store/ui-store.ts` |
| Post navigation | **Zustand** | `app/model/store/post-navigation-store.ts` |
| Theme | next-themes | `AppProviders` |

### Data source modes

Переключение через `shared/config/dataSource.ts`:

| Mode | When | Behavior |
|------|------|----------|
| `msw` | default in dev | HTTP repos + MSW intercepts `/api/v1/*` |
| `seed` | tests, `USE_MSW=0` without API URL | In-memory repositories |
| `http` | prod / staging | Real `API_BASE_URL` |

---

## Build & deploy

| Setting | Value |
|---------|-------|
| Production output | **static export** (`output: "export"`) |
| Output dir | `out/` |
| `trailingSlash` | `true` |
| Images | `unoptimized: true` (static export) |
| Base path | `NEXT_PUBLIC_BASE_PATH` (GitHub Pages) |
| Prod server | **none** — nginx / GitHub Pages / any static host |

---

## Environment variables

| Variable | Default (dev) | Description |
|----------|---------------|-------------|
| `NEXT_PUBLIC_USE_MSW` | on in dev | `1` = MSW, `0` = off |
| `NEXT_PUBLIC_API_BASE_URL` | empty | Backend URL (no trailing slash) |
| `NEXT_PUBLIC_SYNC_API_URL` | — | Alias for API base |
| `NEXT_PUBLIC_BASE_PATH` | empty | Static asset base path |

Backend switch:

```bash
NEXT_PUBLIC_USE_MSW=0
NEXT_PUBLIC_API_BASE_URL=https://api.example.com
```

---

## Testing & quality

| Tool | Scope |
|------|-------|
| **Vitest v4** | Unit / integration tests |
| **@testing-library/react** | Component tests |
| **jsdom** | DOM environment |
| **Playwright v1.60** | E2E (`e2e/`) |
| **ESLint 9** | Lint + `eslint-config-next` |
| **eslint-plugin-boundaries** | FSD layer imports |

### npm scripts (target)

| Script | Action |
|--------|--------|
| `dev` | Next dev server |
| `build` | Static export + `copy-404.mjs` |
| `typecheck` | `tsc --noEmit` |
| `lint` | ESLint |
| `test` | Vitest |
| `test:e2e` | Playwright |
| `check` | typecheck + lint + test + build |

### CI (target)

GitHub Actions: Node 22 → `npm ci` → typecheck → lint → test → build → e2e.

---

## Providers (boot order)

```
MswProvider
  → ThemeProvider (next-themes)
    → QueryProvider (TanStack Query)
      → RepositoryProvider
        → TooltipProvider
```

---

## Path aliases

```ts
@/app/*       → src/app/*
@/screens/*   → src/screens/*
@/widgets/*   → src/widgets/*
@/features/*  → src/features/*
@/entities/*  → src/entities/*
@/shared/*    → src/shared/*
@/*           → src/*
```

---

## Planned project layout

```
web/
├── docs/                 ← сейчас
└── src/                  ← будущий клиент (stack = этот документ)
    ├── app/
    ├── screens/
    ├── widgets/
    ├── features/
    ├── entities/
    └── shared/
```

---

## Legacy vs new stack

| | web-legacy (reference UI) | web (v2 stack) |
|--|---------------------------|----------------|
| CSS | Custom `app/styles/` | Tailwind v4 + shadcn |
| State | React Context + reducers | Zustand + TanStack Query |
| Data | In-memory monolith store | Repository + MSW + Zod |
| Next | 15 | 16 |
| Tests | Vitest only | Vitest + Playwright |
| UI kit | Custom components | shadcn + @base-ui |

---

## Related docs

- [architecture.md](./architecture.md) — FSD, data flow, providers
- [data-model.md](./data-model.md) — entities, enums, persistence
- [routing.md](./routing.md) — URLs, query params, post modes
- [local-first.md](./local-first.md) — MSW, seed, stub AI
- [api-schemas.md](./api-schemas.md) — REST endpoints
- [testing.md](./testing.md) — Vitest, Playwright, CI
- [deploy.md](./deploy.md) — static export, hosting
- [web-client.md](./web-client.md) — фазы клиента
- [API_CONTRACT.yaml](./API_CONTRACT.yaml) — OpenAPI
- [BACKEND_READINESS.md](./BACKEND_READINESS.md) — подключение backend
