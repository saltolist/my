# Deploy

Static export deployment for web client. Stack — [stack.md](./stack.md).

Reference build: [`web/next.config.ts`](../../next.config.ts).

---

## Build output

| Setting | Value |
|---------|-------|
| `output` | `"export"` (production) |
| Output dir | `out/` |
| `trailingSlash` | `true` |
| Images | `unoptimized: true` |

**Commands:**

```bash
cd Docs_TG_Platform/web
npm ci
npm run build
```

Post-build: `copy-404.mjs` copies `404.html` for SPA fallback on static hosts.

---

## Environment variables

| Variable | Production example | Purpose |
|----------|-------------------|---------|
| `NEXT_PUBLIC_BASE_PATH` | `/Repositories_Info/Docs_TG_Platform/web` | Asset prefix (GitHub Pages) |
| `NEXT_PUBLIC_USE_MSW` | `0` | Disable mock API |
| `NEXT_PUBLIC_API_BASE_URL` | `https://api.example.com` | Backend URL (no trailing slash) |

**Backend mode:** same static bundle; only env vars change ([local-first.md](./local-first.md)).

---

## GitHub Pages

CI sets:

```yaml
NEXT_PUBLIC_BASE_PATH: /Repositories_Info/Docs_TG_Platform/web
```

Deploy `out/` to Pages. All routes use trailing slashes; gchat uses query `?id=` because path segments don't work well with static export for dynamic ids.

**Deploy workflow** — planned in [08-roadmap.md](../product/08-roadmap.md) Phase 8 (`web-pages.yml`: build with MSW demo → GitHub Pages).

---

## Self-hosted (nginx)

No Node.js in production.

```nginx
server {
  listen 80;
  root /var/www/tg-platform/out;
  index index.html;

  location / {
    try_files $uri $uri/ $uri/index.html /404.html;
  }
}
```

Set `NEXT_PUBLIC_BASE_PATH` empty if served from domain root.

CORS: backend must allow frontend origin when using `http` data mode.

---

## MSW in production

**Do not** ship MSW as default in production builds. Set `NEXT_PUBLIC_USE_MSW=0` and point to real API or serve read-only demo with seed (explicit choice).

---

## Checklist before release

- [ ] `npm run check` passes (typecheck + lint + test + build)
- [ ] `NEXT_PUBLIC_BASE_PATH` matches hosting path
- [ ] API URL and CORS configured if not demo mode
- [ ] MSW disabled
- [ ] 404 fallback works for client routes

---

## Related

- [testing.md](./testing.md) — CI build step
- [BACKEND_READINESS.md](./BACKEND_READINESS.md)
