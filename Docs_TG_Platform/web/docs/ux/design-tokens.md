# Design tokens

Visual parity target for Tailwind/shadcn implementation. **Source reference:** [`web-legacy/src/app/styles/globals.css`](../../../web-legacy/src/app/styles/globals.css) (`:root` tokens).

Не копировать legacy CSS — переносим **семантику** в CSS variables + Tailwind theme.

UI patterns — [conventions.md](./components/conventions.md). Breakpoints — same doc.

---

## Semantic colors (dark default)

| Legacy token | Dark value | Tailwind mapping (proposed) |
|--------------|------------|----------------------------|
| `--bg` | `#0f0f0f` | `--background` |
| `--bg2` | `#161616` | `--card` |
| `--bg3` | `#1e1e1e` | `--muted` |
| `--bg4` | `#252525` | `--secondary` |
| `--bg5` | `#2e2e2e` | elevated surface |
| `--border` | `#2a2a2a` | `--border` |
| `--border2` | `#383838` | `--input` |
| `--text` | `#e8e8e8` | `--foreground` |
| `--text2` | `#9a9a9a` | `--muted-foreground` |
| `--text3` | `#606060` | disabled/subtle |
| `--accent` | `#5b8ff9` | `--primary` |
| `--accent2` | `#3d6fe8` | `--primary` hover |
| `--adim` | `rgba(91,143,249,0.12)` | `--primary/12` |
| `--green` | `#4caf82` | success |
| `--orange` | `#e8954a` | warning |
| `--red` | `#e85a5a` | `--destructive` |
| `--purple` | `#9b7cdb` | accent alt |

Light theme overrides in `globals.css` under `:root[data-theme="light"]` — mirror in `next-themes` CSS.

---

## Spacing scale

| Token | Value | Tailwind |
|-------|-------|----------|
| `--ui-space-1` | 4px | `1` |
| `--ui-space-2` | 8px | `2` |
| `--ui-space-3` | 12px | `3` |
| `--ui-space-4` | 16px | `4` |
| `--ui-space-5` | 24px | `6` |
| `--ui-space-6` | 32px | `8` |

---

## Layout dimensions

| Token | Value | Usage |
|-------|-------|-------|
| `--nav-w` | 220px | Sidebar expanded |
| `--nav-w-rail` | 86px | Sidebar collapsed |
| `--hdr` | 56px | PageHeader height |
| `--content-w` | min(1160px, …) | Main content max |
| `--composer-w` | min(720px, …) | Composer max width |
| `--feed-post-w` | 500 / 390 / 270 | FeedCardWidth toggle |
| `--page-header-search-w` | responsive | Header search field |

---

## Radii

| Token | Value | Usage |
|-------|-------|-------|
| `--ui-radius-sm` / `--rs` | 6px | small controls |
| `--ui-radius-md` / `--r` | 10px | default |
| `--ui-radius-lg` | 14px | panels |
| `--post-card-r` | `calc(var(--r) * 2)` | post/note cards |
| `--block-r` | `var(--post-card-r)` | analytics, profile blocks |
| `--composer-backdrop-radius` | 22px | composer glass |

---

## Typography

| Token | Value |
|-------|-------|
| `--font` | system stack (`-apple-system`, `Segoe UI`, sans-serif) |
| `--ui-font-sm` | 0.8125rem (13px) |
| `--ui-font-md` | 0.9375rem (15px) |
| `--ui-font-lg` | 1.0625rem (17px) |

Proposed: `font-sans` = system stack; body = `--ui-font-md`.

---

## Glass header (PageHeader)

| Token | Purpose |
|-------|---------|
| `--glass-bg` | frosted background |
| `--glass-border` | edge |
| `--glass-shine` | highlight |
| `--glass-shadow` | depth |
| `--glass-filter` | `blur(22px) saturate(180%)` |

**Tailwind target:** utility class e.g. `.glass-header` = `backdrop-blur-xl bg-background/60 border-border/50`.

Class `page-header--post` — fixed header on post workspace.

---

## Composer effects

| Token | Purpose |
|-------|---------|
| `--composer-backdrop-blur` | 14px |
| `--composer-backdrop-bg` | color-mix bg2/bg |
| `--composer-overlay-h` | 168px scroll padding |
| `--input-focus-ring` | `rgba(91, 143, 249, 0.45)` |

---

## Z-index

| Token | Value | Notes |
|-------|-------|-------|
| `--ui-z-dropdown` | 1200 | |
| Portal dropdowns | 2000 | conventions.md |
| `--ui-z-modal` | 1400 | |
| `--ui-z-tooltip` | 1500 | |

---

## Breakpoints

Cross-ref [conventions.md](./components/conventions.md):

| Hook | Width | Effect |
|------|-------|--------|
| mobile | ≤760px | sheet sidebar, compact header |
| rail | ≥761px | collapsible sidebar |
| header compact | 640–1080px | overlay search, chart density |

---

## Component mapping (legacy → shadcn)

| Legacy pattern | Target |
|----------------|--------|
| `.btn.btn-primary` | `Button` variant default |
| `.btn.btn-ghost.btn-sm` | `Button` variant ghost size sm |
| `.icon-btn` | `Button` size icon |
| `.send-btn` | Composer submit icon button |
| `.filter-tab` | Tabs or toggle group |
| `.glass-header` | custom utility + PageHeader |
| `.composer-editor` | contentEditable wrapper + placeholder |
| ContextMenu portal | shadcn DropdownMenu / ContextMenu |
| ModelPicker | Popover + Command list |
| PageHeaderSelect | Select with portal |

---

## Heatmap & charts

| Token | Value |
|-------|-------|
| `--heatmap-tint` | `--accent` |
| `--trend-chart-inset-x` | 34px |
| `--model-trend-chart-height` | 493px |

---

## Implementation note

New web UI uses **Tailwind v4 + shadcn** ([stack.md](../engineering/stack.md)). Tokens above define **visual parity** with legacy wireframes, not a CSS port.

---

## Related

- [wireframes/](./wireframes/)
- [shared-ui.md](./components/shared-ui.md)
