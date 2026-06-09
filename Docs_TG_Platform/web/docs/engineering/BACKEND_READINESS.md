# Backend readiness

Checklist подключения backend к web-клиенту. Стек — [stack.md](./stack.md).

---

## 1. Environment

```bash
NEXT_PUBLIC_USE_MSW=0
NEXT_PUBLIC_API_BASE_URL=https://your-api.example.com
```

---

## 2. API contract

Реализовать endpoints из [API_CONTRACT.yaml](./API_CONTRACT.yaml) — paths и schemas должны совпадать с MSW handlers 1:1. Детали — [api-schemas.md](./api-schemas.md).

---

## 3. Verify

- [ ] `GET /api/v1/posts` returns seed-equivalent data shape
- [ ] Post CRUD + reorder works from Feed
- [ ] Global chat messages persist
- [ ] Global notes CRUD works
- [ ] Profile GET/PUT endpoints return ChannelProfileConfig, AiProfileConfig, TelegramProfileConfig
- [ ] CORS allows frontend origin
- [ ] Static export still builds with API mode env vars

---

## 4. AI streaming (future)

Replace stub AI provider with `POST /api/v1/ai/chat` SSE — UI hooks in `features/send-message` should not change.

---

## 5. Persistence

After backend connect, disable MSW in production builds; data survives page reload.
