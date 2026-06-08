# entities/post

Post entity: types, PostCard UI, TanStack Query hooks.

## Public API

- `PostCard`, `PostStatusBadge` — composite post card
- `ReactionPills`, `PostMetricsRow`, `PostMediaBlock`, `DraftDragHandle`, `PostCommentRow` — sub-components
- Re-export hooks from `model/usePosts.ts` via entity consumers

## API

- `GET/POST /api/v1/posts`, `PATCH/DELETE /api/v1/posts/{id}`, `PUT /api/v1/posts/reorder`

## Spec

[10-pages.md § feed, post](../../../concept/10-pages.md)
