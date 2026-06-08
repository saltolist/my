# Design System

TG Platform frontend uses **Tailwind CSS v4** + **shadcn/ui** (Radix primitives).

## Themes

- Light / dark / system via `next-themes` (`class` strategy)
- CSS variables in `src/app/globals.css` (`:root`, `.dark`)

## Liquid glass header

`.glass-header` utility — `backdrop-filter: blur` + `--glass-*` tokens for PageHeader parity with [10-pages.md](../../concept/10-pages.md).

## Spacing & radius

Mapped to shadcn `--radius` and Tailwind spacing scale. Feed card widths: `500 | 390 | 270` px (`ui-store.feedCardWidth`).

## shadcn base components

Located in `src/shared/ui/`. Added via `npx shadcn@latest add …`. Re-exported from `@/shared/ui`.

| Component | File | Notes |
|-----------|------|-------|
| **Avatar** | `avatar.tsx` | `Avatar`, `AvatarImage`, `AvatarFallback`, `AvatarGroup`, `AvatarBadge` |
| **Badge** | `badge.tsx` | Status pills; variants via `badgeVariants` |
| **Button** | `button.tsx` | Primary actions; sizes `xs`–`lg`, `icon`, `icon-sm` |
| **Card** | `card.tsx` | `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`, `CardAction` |
| **Checkbox** | `checkbox.tsx` | Radix checkbox |
| **Command** | `command.tsx` | cmdk palette; pairs with `CommandDialog` |
| **Dialog** | `dialog.tsx` | Modal overlay |
| **DropdownMenu** | `dropdown-menu.tsx` | Context and action menus |
| **Input** | `input.tsx` | Single-line text |
| **InputGroup** | `input-group.tsx` | Composed input with addons/buttons |
| **Label** | `label.tsx` | Form labels |
| **Popover** | `popover.tsx` | Floating content panel |
| **ScrollArea** | `scroll-area.tsx` | Custom scrollbar wrapper |
| **Separator** | `separator.tsx` | Horizontal/vertical divider |
| **Sheet** | `sheet.tsx` | Mobile slide-over (sidebar) |
| **Skeleton** | `skeleton.tsx` | Loading placeholder |
| **Switch** | `switch.tsx` | Boolean toggle |
| **Tabs** | `tabs.tsx` | `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` |
| **Textarea** | `textarea.tsx` | Multi-line text |
| **Tooltip** | `tooltip.tsx` | Hover hints; `TooltipProvider` in `AppProviders` |

## Platform primitives (TG-specific)

Built on shadcn base; exported from `@/shared/ui`.

| Component | File | Purpose |
|-----------|------|---------|
| **AiContextBadge** | `ai-context-badge.tsx` | Brain icon + «ИИ» badge when note/chat is AI-enabled |
| **BackButton** | `back-button.tsx` | Chevron back control for PageHeader right slot |
| **Breadcrumb** | `breadcrumb.tsx` | Title + optional crumb trail in PageHeader left |
| **ContextMenuButton** | `context-menu-button.tsx` | `⋯` trigger wrapping `DropdownMenu`; used in sidebar rows |
| **CopyButton** | `copy-button.tsx` | Copy-to-clipboard with feedback |
| **EmptySection** | `empty-section.tsx` | Muted inline empty message inside a section |
| **EmptyState** | `empty-state.tsx` | Centered empty catalog state with icon + action |
| **ErrorFallback** | `error-fallback.tsx` | Error message with optional retry button |
| **FeedCardWidthToggle** | `feed-card-width-toggle.tsx` | 500 / 390 / 270 px width pills; controlled (`value` / `onChange`); wired in `FeedSearchBar` |
| **FilterTabs** | `filter-tabs.tsx` | Segmented filter; collapses to dropdown on mobile |
| **IconButton** | `icon-button.tsx` | Ghost icon-only button (attach `+`, mode arrows) |
| **ModelPicker** | `model-picker.tsx` | Dropdown model selector with icon label |
| **MultiReplyToggle** | `multi-reply-toggle.tsx` | «Мультиответ» switch for composer |
| **PasswordToggle** | `password-toggle.tsx` | Input + show/hide password |
| **SearchField** | `search-field.tsx` | `type="search"` input wrapper |
| **SummaryMetricCard** | `summary-metric-card.tsx` | Analytics KPI card with icon |
| **WebSearchPicker** | `web-search-picker.tsx` | ModelPicker variant for web-search model |

## Widget-level chrome (not in `shared/ui`)

| Widget | Path | Role |
|--------|------|------|
| **PageHeader** | `widgets/page-header` | Glass sticky header: left (breadcrumb) / center / right (back, actions) |
| **Composer** | `widgets/composer` | Message input with ModelPicker, AttachMenu, SendButton |
| **PostCard** | `entities/post/ui` | Feed and comment post preview card |

## Typography

Geist Sans (Latin + Cyrillic), Geist Mono for code.

## Dev gallery

All `shared/ui` primitives with live examples: `/ui/` (development only).

```bash
npm run dev
# open http://localhost:3000/ui/
```
