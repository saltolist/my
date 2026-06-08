# Testing strategy

## Unit tests (Vitest)

- Location: `src/**/*.test.ts`
- Run: `npm run test`
- Coverage: lib utilities, Zod schemas, seed repositories, route parsing

## Component tests

Optional expansion with `@testing-library/react` + jsdom (setup in `src/test/setup.ts`).

## E2E (Playwright)

- Location: `e2e/`
- Run: `npm run test:e2e`
- Critical paths:
  - Home loads
  - Feed → post navigation
  - Home → send message → gchat

## CI

`.github/workflows/frontend-ci.yml` runs typecheck, lint, unit tests, build on changes in `Docs_TG_Platform/frontend/`.
