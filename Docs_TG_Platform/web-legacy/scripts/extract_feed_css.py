#!/usr/bin/env python3
"""Extract feed screen CSS from globals.css into feed.css."""

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
GLOBALS = ROOT / "src" / "app" / "styles" / "globals.css"
FEED = ROOT / "src" / "app" / "styles" / "feed.css"

# 1-based inclusive line ranges
CUT_RANGES = [
    (1228, 1237),  # #screen-feed header vars + center width
    (1315, 1454),  # feed post-width toggles + compact-search @media
    (3300, 3700),  # SCREEN: FEED
]

FEED_KEYWORDS = (
    "#screen-feed",
    ".feed-screen-wrap",
    ".feed-layout",
    ".feed-scroll",
    ".feed-inner",
    ".feed-section",
    ".feed-day",
    ".feed-post-width",
    ".page-header-feed",
    ".feed-section-cards",
    ".draft-cards-stack",
    ".draft-card-wrap",
    ".draft-drop-gap",
    ".draft-drag",
    ".post-card",
    ".post-card-body",
    ".post-card-text",
    ".post-card-media",
    ".post-card-footer",
    ".post-reactions-row",
    ".post-reaction-",
    ".post-status",
    ".post-metric",
    ".post-format-phone",
    ".post-meta",
    ".drop-indicator",
    ".drag-handle",
    ".drag-handle-dot",
    ".section-label",
)

SHARED_PEER_PREFIXES = (
    "#screen-chats",
    "#screen-notes",
    "#screen-post",
    "#screen-gchat",
    "#screen-home",
    "#screen-analytics",
    "#screen-profile",
    ".chats-",
    ".chat-card",
    ".notes-",
    ".note-",
    ".post-hdr",
    ".post-body",
    ".post-subpage",
    ".gchat-",
    ".home-",
    ".analytics-",
    ".profile-",
)

EXCLUDE_KEYWORDS = (
    ".post-msg-card",
    ".post-comment",
    ".post-hdr",
    "#screen-post",
    "nav-recent-chats-section-label",
)

HEADER_CSS = """/* Feed screen styles */
/* Extracted from globals.css */

/* ── Scrollbar + iOS scroll (feed scroll container) ── */
.feed-scroll::-webkit-scrollbar {
  width: var(--sb-w);
  height: var(--sb-w);
}
.feed-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.feed-scroll::-webkit-scrollbar-thumb {
  background: var(--scroll-thumb);
  border-radius: 999px;
}
.feed-scroll::-webkit-scrollbar-thumb:hover {
  background: var(--scroll-thumb-hover);
}
.feed-scroll::-webkit-scrollbar-corner {
  background: transparent;
}
.feed-scroll {
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-y: contain;
}

/* ── Composer layout (feed screen) ── */
.feed-layout {
  position: relative;
}
.feed-layout > .input-wrap {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  margin-top: 0;
}
.feed-scroll {
  overflow-x: hidden;
}
.composer-scroll-wrap > .feed-scroll {
  flex: 1;
  min-height: 0;
  min-width: 0;
}

/* ── Composer backdrop (feed) ── */
#screen-feed .input-wrap {
  --input-wrap-pad-top: 18px;
  --input-wrap-pad-bottom: 20px;
  overflow: visible;
}
#screen-feed .input-wrap:not(.is-composer-ready) .composer-backdrop {
  visibility: hidden;
}
#screen-feed .composer-backdrop {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: var(--composer-w);
  max-width: 100%;
  top: var(--input-wrap-pad-top);
  bottom: 0;
  z-index: 0;
  pointer-events: none;
  overflow: visible;
  border-radius: var(--composer-backdrop-radius) var(--composer-backdrop-radius) 0 0;
  background: var(--composer-backdrop-bg);
  isolation: isolate;
}
#screen-feed .composer-backdrop::before {
  content: "";
  position: absolute;
  z-index: -1;
  top: calc(-1 * var(--composer-backdrop-blur-outset));
  right: calc(-1 * var(--composer-backdrop-blur-outset));
  bottom: calc(-1 * var(--composer-backdrop-blur-outset));
  left: calc(-1 * var(--composer-backdrop-blur-outset));
  border-radius:
    calc(var(--composer-backdrop-radius) + var(--composer-backdrop-blur-outset))
    calc(var(--composer-backdrop-radius) + var(--composer-backdrop-blur-outset))
    0
    0;
  background: var(--composer-backdrop-bg);
  filter: blur(var(--composer-backdrop-blur));
}
#screen-feed .input-wrap > .input-box {
  position: relative;
  z-index: 1;
}

.page-header-feed-width-select {
  flex-shrink: 0;
}

"""

SCROLLBAR_GROUPS = (
    (
        "/* ── Custom thin scrollbar for main scroll containers (WebKit) ── */\n"
        ".gchat-messages::-webkit-scrollbar,\n"
        ".chats-scroll::-webkit-scrollbar {\n"
        "  width: var(--sb-w);\n"
        "  height: var(--sb-w);\n"
        "}\n"
        ".gchat-messages::-webkit-scrollbar-track,\n"
        ".chats-scroll::-webkit-scrollbar-track {\n"
        "  background: transparent;\n"
        "}\n"
        ".gchat-messages::-webkit-scrollbar-thumb,\n"
        ".chats-scroll::-webkit-scrollbar-thumb {\n"
        "  background: var(--scroll-thumb);\n"
        "  border-radius: 999px;\n"
        "}\n"
        ".gchat-messages::-webkit-scrollbar-thumb:hover,\n"
        ".chats-scroll::-webkit-scrollbar-thumb:hover {\n"
        "  background: var(--scroll-thumb-hover);\n"
        "}\n"
        ".gchat-messages::-webkit-scrollbar-corner,\n"
        ".chats-scroll::-webkit-scrollbar-corner {\n"
        "  background: transparent;\n"
        "}\n"
    ),
    (
        "/* iOS / iPad: инерционный скролл во внутренних контейнерах */\n"
        ".chats-page,\n"
        ".chats-scroll,\n"
        ".gchat-messages {\n"
        "  -webkit-overflow-scrolling: touch;\n"
        "  overscroll-behavior-y: contain;\n"
        "}\n"
    ),
)

COMPOSER_BLOCK_START = "/* Composer поверх скролла — полоса прокрутки до низа области под шапкой */"
COMPOSER_GCHAT_ONLY = """/* Composer поверх скролла — полоса прокрутки до низа области под шапкой */
.gchat-layout {
  position: relative;
}
.gchat-layout > .input-wrap {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  margin-top: 0;
}

/* Скролл ленты/чата: только вертикаль; горизонталь не раздуваем */
.gchat-messages {
  overflow-x: hidden;
}

"""

COMPOSER_MASK_START = "/* Маска за карточкой composer: до низа экрана, скругление сверху как у .input-box */"
COMPOSER_MASK_GCHAT = """/* Маска за карточкой composer: до низа экрана, скругление сверху как у .input-box */
#screen-gchat .input-wrap {
  --input-wrap-pad-top: 18px;
  --input-wrap-pad-bottom: 20px;
  overflow: visible;
}

#screen-gchat .composer-backdrop {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: var(--composer-w);
  max-width: 100%;
  top: var(--input-wrap-pad-top);
  bottom: 0;
  z-index: 0;
  pointer-events: none;
  overflow: visible;
  border-radius: var(--composer-backdrop-radius) var(--composer-backdrop-radius) 0 0;
  background: var(--composer-backdrop-bg);
  isolation: isolate;
}
/* Размытие вынесено за контур панели (filter на слое шире/выше блока) */
#screen-gchat .composer-backdrop::before {
  content: "";
  position: absolute;
  z-index: -1;
  top: calc(-1 * var(--composer-backdrop-blur-outset));
  right: calc(-1 * var(--composer-backdrop-blur-outset));
  bottom: calc(-1 * var(--composer-backdrop-blur-outset));
  left: calc(-1 * var(--composer-backdrop-blur-outset));
  border-radius:
    calc(var(--composer-backdrop-radius) + var(--composer-backdrop-blur-outset))
    calc(var(--composer-backdrop-radius) + var(--composer-backdrop-blur-outset))
    0
    0;
  background: var(--composer-backdrop-bg);
  filter: blur(var(--composer-backdrop-blur));
}

#screen-gchat .input-wrap > .input-box {
  position: relative;
  z-index: 1;
}

"""

SCROLLBAR_BLOCK_START = "/* ── Custom thin scrollbar for main scroll containers (WebKit) ── */"
LAYOUT_BLOCK_START = "/* ── Layout ── */"

PAGE_HEADER_WIDTH_SELECT_OLD = (
    ".page-header-feed-width-select,\n"
    ".page-header-scope-select {\n"
    "  flex-shrink: 0;\n"
    "}"
)
PAGE_HEADER_WIDTH_SELECT_NEW = ".page-header-scope-select {\n  flex-shrink: 0;\n}"


def in_cut(line_no: int) -> bool:
    return any(start <= line_no <= end for start, end in CUT_RANGES)


def has_shared_peer(selector: str) -> bool:
    sel = selector.replace("\n", " ")
    has_feed = "#screen-feed" in sel or ".feed-" in sel or re.search(
        r"\.post-card(?:\s|[,{.]|$)", sel
    )
    has_peer = any(p in sel for p in SHARED_PEER_PREFIXES)
    return bool(has_feed and has_peer)


def is_feed_selector(selector: str) -> bool:
    sel = selector.strip()
    if not sel or sel.startswith("@"):
        return False
    if "nav-recent-chats-section-label" in sel:
        return False
    if "#screen-feed" in sel:
        return True
    if any(k in sel for k in EXCLUDE_KEYWORDS):
        return False
    if has_shared_peer(sel):
        return False
    if ".post-msg-card" in sel and ".post-card" not in sel.replace(".post-msg-card", ""):
        return False
    return any(k in sel for k in FEED_KEYWORDS)


def split_rules_in_block(body: str) -> tuple[str, str]:
    rules_f: list[str] = []
    rules_g: list[str] = []
    pending_comments: list[str] = []
    i = 0
    n = len(body)
    while i < n:
        while i < n and body[i] in " \t\n\r":
            i += 1
        if i >= n:
            break
        if body[i : i + 2] == "/*":
            end = body.find("*/", i + 2)
            if end == -1:
                pending_comments.append(body[i:])
                break
            pending_comments.append(body[i : end + 2])
            i = end + 2
            continue
        rule_start = i
        brace = body.find("{", i)
        if brace == -1:
            rules_g.extend(pending_comments)
            rules_g.append(body[i:])
            pending_comments = []
            break
        selector = body[i:brace]
        depth = 1
        k = brace + 1
        while k < n and depth > 0:
            if body[k] == "{":
                depth += 1
            elif body[k] == "}":
                depth -= 1
            k += 1
        rule = body[rule_start:k]
        bucket = rules_f if is_feed_selector(selector) else rules_g
        bucket.extend(pending_comments)
        bucket.append(rule)
        pending_comments = []
        i = k
    if pending_comments:
        rules_g.extend(pending_comments)
    return "\n".join(rules_f), "\n".join(rules_g)


def split_responsive_section(css: str) -> tuple[str, str]:
    marker = css.find("/* ════════════════════════════════\n   RESPONSIVE")
    if marker < 0:
        return css, ""
    before = css[:marker]
    responsive = css[marker:]
    globals_parts = [before]
    feed_parts: list[str] = []
    i = 0
    n = len(responsive)
    while i < n:
        media_at = responsive.find("@media", i)
        if media_at < 0:
            tail = responsive[i:]
            if tail.strip():
                globals_parts.append(tail)
            break
        if media_at > i:
            globals_parts.append(responsive[i:media_at])
        brace = responsive.find("{", media_at)
        if brace == -1:
            globals_parts.append(responsive[media_at:])
            break
        prelude = responsive[media_at : brace + 1]
        depth = 1
        k = brace + 1
        while k < n and depth > 0:
            if responsive[k] == "{":
                depth += 1
            elif responsive[k] == "}":
                depth -= 1
            k += 1
        body = responsive[brace + 1 : k - 1]
        f_rules, g_rules = split_rules_in_block(body)
        if f_rules.strip():
            feed_parts.append(f"{prelude}\n{f_rules}\n}}\n")
        if g_rules.strip():
            globals_parts.append(f"{prelude}\n{g_rules}\n}}\n")
        i = k
    return "".join(globals_parts), "".join(feed_parts)


def replace_scroll_blocks(text: str) -> str:
    start = text.find(SCROLLBAR_BLOCK_START)
    if start < 0:
        return text
    layout_start = text.find(LAYOUT_BLOCK_START, start)
    if layout_start < 0:
        return text
    return text[:start] + SCROLLBAR_GROUPS[0] + "\n" + SCROLLBAR_GROUPS[1] + text[layout_start:]


def replace_composer_blocks(text: str) -> str:
    start = text.find(COMPOSER_BLOCK_START)
    if start < 0:
        return text
    mask_start = text.find(COMPOSER_MASK_START, start)
    if mask_start < 0:
        return text
    scroll_wrap = text.find(".composer-scroll-wrap {", start)
    if scroll_wrap < 0 or scroll_wrap > mask_start:
        return text
    composer_scroll_rule_end = text.find(
        ".composer-scroll-body {",
        scroll_wrap,
    )
    if composer_scroll_rule_end < 0:
        return text
    before = text[:start]
    middle = text[scroll_wrap:mask_start]
    middle = middle.replace(
        ".composer-scroll-wrap > .feed-scroll,\n.composer-scroll-wrap > .gchat-messages {",
        ".composer-scroll-wrap > .gchat-messages {",
    )
    after_mask = text.find(".input-box {", mask_start)
    if after_mask < 0:
        return text
    return before + COMPOSER_GCHAT_ONLY + middle + COMPOSER_MASK_GCHAT + text[after_mask:]


def replace_page_header_width_select(text: str) -> str:
    return text.replace(PAGE_HEADER_WIDTH_SELECT_OLD, PAGE_HEADER_WIDTH_SELECT_NEW)


def main() -> None:
    lines = GLOBALS.read_text(encoding="utf-8").splitlines(keepends=True)

    kept_lines: list[str] = []
    for idx, line in enumerate(lines, start=1):
        if in_cut(idx):
            continue
        kept_lines.append(line)

    main_parts: list[str] = []
    for start, end in CUT_RANGES:
        main_parts.append("".join(lines[start - 1 : end]))
    main_block = "\n".join(main_parts)

    globals_text = "".join(kept_lines)
    globals_text = replace_scroll_blocks(globals_text)
    globals_text = replace_composer_blocks(globals_text)
    globals_text = replace_page_header_width_select(globals_text)
    new_globals, responsive_feed = split_responsive_section(globals_text)

    feed_text = (
        HEADER_CSS
        + main_block
        + "\n/* ── Responsive (extracted from globals.css) ── */\n"
        + responsive_feed
    )

    FEED.write_text(feed_text, encoding="utf-8")
    GLOBALS.write_text(new_globals, encoding="utf-8")

    print(f"feed.css: {len(feed_text.splitlines())} lines")
    print(f"globals.css: {len(new_globals.splitlines())} lines")


if __name__ == "__main__":
    main()
