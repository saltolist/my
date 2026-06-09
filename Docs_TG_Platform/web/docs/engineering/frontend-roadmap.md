# Frontend roadmap (engineering view)

Краткая инженерная выжимка. Полный план с фазами, DoD и оценками — [08-roadmap.md](../product/08-roadmap.md).

---

## Где код

| Path | Role |
|------|------|
| [`frontend-v2/`](../../../frontend-v2/) | **Active codebase** |
| [`web-legacy/`](../../../web-legacy/) | UX reference (read-only) |
| [`web/docs/ux/pages.md`](../ux/pages.md) | Screen spec (source of truth) |

`web/src/` — не используется; клиент живёт в `frontend-v2/` до отдельного решения о переносе.

---

## Milestones

```
M0 Docs ✅
M1 Foundation (routes, CI, data layer)     ← сейчас
M2 Shell (sidebar, PageHeader, RouteSync)
M3 Widgets layer (composer → profile-settings)
M4 Features + 9 screens
M5 Local-first demo complete
M6 GitHub Pages live
M7 Backend adapter verified (http mode)
```

---

## Per-screen checklist

Copy for each PR:

```markdown
- [ ] pages.md section reviewed
- [ ] wireframe + component specs implemented
- [ ] Repository/MSW endpoint if new mutation
- [ ] E2E smoke in e2e/
- [ ] parity.md row → done
- [ ] npm run check
```

---

## GitHub Pages (M6)

Build:

```bash
cd Docs_TG_Platform/frontend-v2
NEXT_PUBLIC_BASE_PATH=/Repositories_Info/Docs_TG_Platform/frontend-v2 \
NEXT_PUBLIC_USE_MSW=1 \
npm run build
```

Deploy `out/` via GitHub Actions → Pages. Details: [deploy.md](./deploy.md), phase 8 in [08-roadmap.md](../product/08-roadmap.md).

---

## Backend switch (M7)

```bash
NEXT_PUBLIC_USE_MSW=0
NEXT_PUBLIC_API_BASE_URL=https://api.example.com
```

Same static bundle. Verify: [BACKEND_READINESS.md](./BACKEND_READINESS.md).

---

## CI today vs target

| Step | Today | Target |
|------|-------|--------|
| check job | ✅ | ✅ |
| pages deploy | ❌ | Phase 8 |
| E2E all screens | 4 tests | Phase 5–6 |

Workflow: [`.github/workflows/frontend-v2-ci.yml`](../../../../.github/workflows/frontend-v2-ci.yml)
