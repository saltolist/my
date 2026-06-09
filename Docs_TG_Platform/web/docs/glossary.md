# Glossary

Термины TG Platform Web. Пространственная модель — [03-spaces.md](./product/03-spaces.md).

---

## AI & context

| Term | Meaning |
|------|---------|
| **Global AI** | Channel-level assistant (`home`, `gchat`). Sees global knowledge base. |
| **Local AI** | Post workspace chat. Context = post + inherited global knowledge. |
| **AI context flag** | `note.ai` or `localChat.ai` — include entity in AI context. |
| **Omnichannel bot** | Telegram bot integration in profile; special global chat kind, non-deletable. |
| **Stub AI** | Keyword-based replies until real LLM ([local-first.md](./engineering/local-first.md)). |
| **Multi-reply** | Multiple AI variants per message when enabled in profile. |

---

## Spaces & entities

| Term | Meaning |
|------|---------|
| **Global note / chat** | Belongs to channel; ids are `string`. |
| **Local note / chat** | Nested under `Post`; note/chat ids are `number`. |
| **Post workspace** | Screen `post` with modes chat, chats, notes, comments. |
| **Post mode** | `chat` \| `chats` \| `notes` \| `comments` — UI state in Zustand. |
| **Feed sections** | Опубликованные → Отложенные → Черновики. |
| **Composer scope** | `home` \| `gchat` \| `post` — attach menu rules differ. |

---

## Technical

| Term | Meaning |
|------|---------|
| **MSW mode** | Dev local-first with mock REST ([local-first.md](./engineering/local-first.md)). |
| **FSD** | Feature-Sliced Design: app → screens → widgets → features → entities → shared. |
| **Repository pattern** | API boundary; MSW / seed / HTTP implementations. |
| **Static export** | Next.js `output: "export"` — no Node server in prod. |
| **Reference UI** | `web-legacy` — wireframes source, code not ported. |
| **Reference implementation** | `frontend-v2` — stack and data layer reference. |

---

## UI chrome

| Term | Meaning |
|------|---------|
| **PageHeader** | Fixed glass header on all screens. |
| **Sidebar rail** | Collapsed sidebar (icons only) on desktop. |
| **FilterToolbar** | Tabs + action under header on post submodes / notes catalog. |
| **FeedCardWidth** | Preview width toggle: 500 / 390 / 270 px. |

---

## Related

- [data-model.md](./engineering/data-model.md)
