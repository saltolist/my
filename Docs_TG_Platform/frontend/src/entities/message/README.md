# entities/message

Chat message entity: bubble UI for user/AI roles, branch navigation, variant tabs.

## Public API

- `ChatBubble`, `MessageText` — base bubble wrapper and text
- `UserChatBubble` — user message with edit and branch nav
- `AiChatBubble` — AI message with variants and toolbar
- `ChatBranchNav`, `AiVariantTabs`, `AiMessageToolbar` — sub-components

## Usage

Consumed by `widgets/chat-thread`. Entities import only from `shared/`.
