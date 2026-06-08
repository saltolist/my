# Product status — TG Platform frontend

Parity tracker vs [10-pages.md](../concept/10-pages.md).

| Screen | URL | Status | Notes |
|--------|-----|--------|-------|
| Home | `/` | done | Composer → new gchat |
| Feed | `/feed/` | done | 3 sections, search, DnD drafts, composer |
| Post workspace | `/post/[id]/` | done | chat/chats/notes/comments modes |
| Global chat | `/gchat/?id=` | done | Thread + composer |
| Chats catalog | `/chats/` | done | Search + filters |
| Notes catalog | `/notes/` | done | Search + AI filter |
| Note editor | `/note/*` | done | Global + local, AI toggle |
| Analytics | `/analytics/` | done | Period filters, SVG charts |
| Profile | `/profile/` | done | Channel / Settings / Platform analytics |

## Glossary

- **Global AI** — channel-level chat (`home`, `gchat`)
- **Local AI** — post workspace chat
- **MSW mode** — temporary local-first phase; not product positioning

## Spec gaps (closed)

| Gap | Status | Implementation |
|-----|--------|----------------|
| `FeedCardWidthToggle` | closed | `shared/ui/feed-card-width-toggle` → `widgets/feed/ui/feed-search-bar` |
| `MultiReplyToggle` | closed | `shared/ui/multi-reply-toggle` → `widgets/composer/ui/composer-controls` |
| PageHeader center search | closed | `PageHeader.center` + `FeedSearchBar` in `screens/feed` |
| Component extraction | closed | Primitives in `shared/ui`, entities/widgets split per FSD; see `docs/COMPONENT_MAP.md` |

## Known limits (local-first)

- No real Telegram MTProto / LLM
- No persistence across reload (MSW in-memory)
- No auth / multi-user
