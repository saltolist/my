# Feed screen

## Scope

`screens/feed`, `widgets/feed`, `widgets/page-header`, `entities/post`

## PageHeader center wiring

`FeedScreen` passes `FeedSearchBar` into `PageHeader.center`:

```
PageHeader.center → FeedSearchBar → SearchField + FeedCardWidthToggle
```

Search state lives in `FeedScreen`; filtered list receives `searchQuery` via `FeedWidget`.

## Acceptance criteria

- [x] Three sections: Опубликованные, Отложенные, Черновики
- [x] Search in header (PageHeader center slot)
- [x] Card width toggle (500/390/270)
- [x] Draft DnD reorder within section
- [x] Bottom composer creates draft
- [x] Click card → post workspace

## Spec reference

[10-pages.md § feed](../../concept/10-pages.md)
