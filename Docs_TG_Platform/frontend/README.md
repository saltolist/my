# TG Platform — Frontend

Production web-клиент TG Platform: Next.js 16 + React 19 + TypeScript + Tailwind CSS v4 + shadcn/ui.

## Quick start

```bash
cd Docs_TG_Platform/frontend
npm ci
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000).

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Dev server (MSW включён по умолчанию) |
| `npm run build` | Static export → `out/` |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint + FSD boundaries |
| `npm run test` | Vitest unit tests |
| `npm run test:e2e` | Playwright E2E |
| `npm run check` | typecheck + lint + test + build |

## Environment

См. [`.env.example`](.env.example):

- `NEXT_PUBLIC_USE_MSW=1` — MSW mock API (default в dev)
- `NEXT_PUBLIC_USE_MSW=0` + `NEXT_PUBLIC_API_BASE_URL` — real backend
- `NEXT_PUBLIC_BASE_PATH` — GitHub Pages base path

## Architecture

- [ARCHITECTURE.md](./ARCHITECTURE.md) — FSD layers, data flow
- [PRODUCT.md](./PRODUCT.md) — screen parity status
- [docs/](./docs/) — design system, API contract, testing, backend readiness

## Product spec

UX source of truth: [`../concept/10-pages.md`](../concept/10-pages.md)

Legacy reference (do not develop): [`../web-legacy/`](../web-legacy/)
