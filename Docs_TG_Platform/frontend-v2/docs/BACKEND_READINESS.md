# Backend readiness checklist

When FastAPI backend is ready:

## 1. Environment

```bash
NEXT_PUBLIC_USE_MSW=0
NEXT_PUBLIC_API_BASE_URL=https://your-api.example.com
```

## 2. API contract

Implement endpoints from [API_CONTRACT.yaml](./API_CONTRACT.yaml) — paths must match MSW handlers 1:1.

## 3. Verify

- [ ] `GET /api/v1/posts` returns seed-equivalent data shape
- [ ] Post CRUD + reorder works from Feed
- [ ] Global chat messages persist
- [ ] Global notes CRUD works
- [ ] Profile GET/PUT endpoints return ChannelProfileConfig, AiProfileConfig, TelegramProfileConfig
- [ ] CORS allows frontend origin
- [ ] Static export still builds with API mode env vars

## 4. AI streaming (future)

Replace stub `AiProvider` with `POST /api/v1/ai/chat` SSE — UI hooks in `features/send-message` should not change.

## 5. Persistence

After backend connect, remove MSW default in production builds; data survives page reload.
