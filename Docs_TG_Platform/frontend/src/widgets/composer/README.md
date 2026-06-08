# widgets/composer

Unified message input for home, gchat, post, and feed scopes.

## Structure

```
composer/
├── Composer.tsx          # thin orchestrator (~118 lines)
├── model/
│   ├── useComposerInput.ts
│   └── useComposerModels.ts
├── ui/
│   ├── composer-shell.tsx
│   ├── composer-textarea.tsx   # auto-resize, maxRows 10 | 16
│   ├── composer-toolbar.tsx
│   ├── send-button.tsx
│   ├── attach-menu-button.tsx
│   ├── attach-menu.tsx         # routes by scope
│   ├── attach-home-menu.tsx    # home / gchat
│   ├── attach-post-menu.tsx    # post workspace
│   ├── attach-media-grid.tsx
│   ├── attachment-chips.tsx
│   ├── composer-chip.tsx
│   └── composer-mention-dropdown.tsx
└── index.ts              # exports Composer only
```

Attach logic lives in `features/attach-to-message/` (`useAttachPost`, `useAttachFile`, `useAttachMedia`).

## Scopes

| Scope | maxRows | Menu side | Attach menu |
|-------|---------|-----------|-------------|
| home | 10 | bottom | Post, file, media from attached posts |
| gchat | 16 | top | Same as home |
| post | 16 | top | Post, current post media, file, media from attached posts |
| feed | 16 | top | `+` opens file picker directly |

## Toolbar

Uses shared UI: `ModelPicker`, `WebSearchPicker`, `MultiReplyToggle` (when ≥2 models have `includeInMulti`), `IconButton` (attach `+`), `SendButton`.

## Spec

[10-pages.md § Composer](../../../concept/10-pages.md)
