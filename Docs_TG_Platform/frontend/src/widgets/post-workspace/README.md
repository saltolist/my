# widgets/post-workspace

Post detail workspace: inline editing, mode switching (chat / chats / notes / comments), and panel content.

## Structure

```
post-workspace/
├── PostWorkspace.tsx          # thin orchestrator (~144 lines)
├── model/
│   ├── usePostEditState.ts         # inline edit draft state
│   └── usePostWorkspaceActions.ts  # publish / schedule / delete / save / note AI
├── ui/
│   ├── post-workspace-header.tsx   # title, PostModeSwitch, PostJumpButton, PostContextMenu
│   ├── post-inline-editor.tsx      # view / edit post body (textarea, media, save/cancel)
│   ├── post-context-menu.tsx       # publish / schedule / delete
│   ├── local-chats-list.tsx        # SearchField + local chat rows + new chat
│   ├── local-notes-grid.tsx        # NoteCard grid for post-local notes
│   ├── post-comments-panel.tsx     # PostCard preview + PostCommentRow list
│   └── post-workspace-panels.tsx   # mode-specific panel switcher
└── index.ts                   # public API
```

## Composition

`PostWorkspace` loads post data via `entities/post`, navigation state via `post-navigation-store`, and composes:

| Mode | Content |
|------|---------|
| `chat` | `ChatThread` + `Composer` (post scope) |
| `chats` | `LocalChatsList` |
| `notes` | `LocalNotesGrid` |
| `comments` | `PostCommentsPanel` (published posts only) |

Header controls come from `widgets/page-header`: `PostModeSwitch`, `PostJumpButton`.

## Dependencies

- **entities**: `post` (PostCard, PostCommentRow, PostMediaBlock, PostStatusBadge), `note` (NoteCard via LocalNotesGrid)
- **widgets**: `chat-thread`, `composer`, `page-header`
- **features**: `send-message` (`useSendPostMessage`)

## Spec

[12-web-client.md § widgets](../../../concept/12-web-client.md)
