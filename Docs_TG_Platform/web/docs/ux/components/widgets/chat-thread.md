# chat-thread

**Путь:** `web-legacy/src/widgets/chat-thread/`

Рендер одного сообщения и меню карточек чатов.

---

## ChatMessage router

```ts
message.role === "user" → ChatUserMessage
message.role === "assistant" → ChatAiMessage
```

Hook: `useChatMessage` — edit state, branches, variants, copy.

---

## ChatUserMessage

### Anatomy (view)

```
                    ┌─ user bubble ─┐
                    │ message text  │
                    └───────────────┘
                    [hover: edit, copy]
                    [ChatBranchNav if branches > 1]
```

### Edit mode

- Textarea replaces bubble text
- Save / Cancel
- On save: creates new branch in `userBranches`

### ChatBranchNav

- Left/right arrows between branch versions
- Shows when `userBranchCount > 1`

### Mobile

- `onOpenMobileActions` — long press / tap opens action sheet

---

## ChatAiMessage

### Anatomy

```
┌─ ai bubble ─────────────────────┐
│ message text (may be multi)      │
│ AiMessageToolbar                 │
│ ChatAiVariantNav (if multi)      │
└──────────────────────────────────┘
```

### AiMessageToolbar

| Action | Description |
|--------|-------------|
| Copy | Copy plain text |
| Model hint | Shows LLM ± Web models used |

### Multi-variant (AiVariantNav)

- When `aiVariantCount > 1`
- Prev/next variant buttons
- Each variant = different model response

### Delete

- Only on **last assistant message** in thread
- Passed via `isLastAssistantMessage` prop

---

## After user edit

Tail of branch replaced with `STUB_REPLY_AFTER_USER_EDIT` stub message.

---

## ChatListCardMenu

Context menu on chat catalog cards.

| Scope | Actions |
|-------|---------|
| global | Delete chat, Rename (via features) |
| local | Delete local chat |

---

## ChatMessageCtx

Context passed from screen:

- chat id, scope (global/local)
- post id for local
- delete/rename handlers
- edit permissions

---

## CSS patterns

- User bubbles align right
- AI bubbles align left, distinct background
- `.ai-msg-toolbar` — icon row on hover
- `.ai-msg-action-btn` — toolbar buttons

---

## Related

- [composer](./composer.md)
- [features](../features.md) send-message, rename-chat, delete-chat
