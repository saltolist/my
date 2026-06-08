# widgets/chat-thread

Scrollable message list for global and post-local AI chats.

## Structure

```
chat-thread/
├── ChatThread.tsx    # flatten history → UserChatBubble / AiChatBubble
└── index.ts
```

## Behavior

- Renders `entities/message` bubbles (`UserChatBubble`, `AiChatBubble`)
- Auto-scrolls to latest message on history change
- Branch navigation and variant tabs delegated to entity components
- Wrapped in `ScrollArea` from `shared/ui`

## Consumers

| Screen / widget | Scope |
|-----------------|-------|
| `screens/gchat` | Global chat thread |
| `widgets/post-workspace` | Post-local chat mode |

## Dependencies

- **entities**: `message`
- **shared**: `scroll-area`, `chatPaths`, `types`
