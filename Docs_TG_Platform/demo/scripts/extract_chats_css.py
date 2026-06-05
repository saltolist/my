#!/usr/bin/env python3
"""Extract chats list screen CSS from globals.css into chats.css."""

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
GLOBALS = ROOT / "app" / "globals.css"
CHATS = ROOT / "app" / "chats.css"

# 1-based inclusive line ranges
CUT_RANGES = [
    (3220, 3422),  # SCREEN: CHATS LIST
]

CHATS_KEYWORDS = (
    "#screen-chats",
    ".chats-page",
    ".chats-filter",
    ".chats-scroll",
    ".chats-tabs",
    ".chats-tab",
    ".chats-new-chat",
    ".chat-card",
    "button.filter-tab.filter-tab--dropdown.chats-new-chat-btn",
)

SHARED_PEER_PREFIXES = (
    "#screen-notes",
    "#screen-feed",
    "#screen-post",
    "#screen-gchat",
    "#screen-home",
    "#screen-analytics",
    "#screen-profile",
    ".notes-",
    ".note-",
    ".feed-",
    ".post-hdr",
    ".post-body",
    ".post-subpage",
    ".post-chats",
    ".gchat-",
    ".home-",
    ".analytics-",
    ".profile-",
    "nav-recent-chat",
)

EXCLUDE_KEYWORDS = (
    ".post-chats-inner",
    ".post-subpage",
    "#screen-post",
)

HEADER_CSS = """/* Chats list screen styles */
/* Extracted from globals.css */

/* ── Scrollbar + iOS scroll (chats scroll containers) ── */
.chats-page::-webkit-scrollbar,
.chats-scroll::-webkit-scrollbar {
  width: var(--sb-w);
  height: var(--sb-w);
}
.chats-page::-webkit-scrollbar-track,
.chats-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.chats-page::-webkit-scrollbar-thumb,
.chats-scroll::-webkit-scrollbar-thumb {
  background: var(--scroll-thumb);
  border-radius: 999px;
}
.chats-page::-webkit-scrollbar-thumb:hover,
.chats-scroll::-webkit-scrollbar-thumb:hover {
  background: var(--scroll-thumb-hover);
}
.chats-page::-webkit-scrollbar-corner,
.chats-scroll::-webkit-scrollbar-corner {
  background: transparent;
}
.chats-page,
.chats-scroll {
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-y: contain;
}

"""

SCROLLBAR_GROUPS = (
    (
        "/* ── Custom thin scrollbar for main scroll containers (WebKit) ── */\n"
        ".gchat-messages::-webkit-scrollbar {\n"
        "  width: var(--sb-w);\n"
        "  height: var(--sb-w);\n"
        "}\n"
        ".gchat-messages::-webkit-scrollbar-track {\n"
        "  background: transparent;\n"
        "}\n"
        ".gchat-messages::-webkit-scrollbar-thumb {\n"
        "  background: var(--scroll-thumb);\n"
        "  border-radius: 999px;\n"
        "}\n"
        ".gchat-messages::-webkit-scrollbar-thumb:hover {\n"
        "  background: var(--scroll-thumb-hover);\n"
        "}\n"
        ".gchat-messages::-webkit-scrollbar-corner {\n"
        "  background: transparent;\n"
        "}\n"
    ),
    (
        "/* iOS / iPad: инерционный скролл во внутренних контейнерах */\n"
        ".gchat-messages {\n"
        "  -webkit-overflow-scrolling: touch;\n"
        "  overscroll-behavior-y: contain;\n"
        "}\n"
    ),
)

SCROLLBAR_BLOCK_START = "/* ── Custom thin scrollbar for main scroll containers (WebKit) ── */"
LAYOUT_BLOCK_START = "/* ── Layout ── */"


def in_cut(line_no: int) -> bool:
    return any(start <= line_no <= end for start, end in CUT_RANGES)


def has_shared_peer(selector: str) -> bool:
    sel = selector.replace("\n", " ")
    has_chats = (
        "#screen-chats" in sel
        or ".chats-" in sel
        or re.search(r"\.chat-card(?:\s|[,{.]|$)", sel)
    )
    has_peer = any(p in sel for p in SHARED_PEER_PREFIXES)
    return bool(has_chats and has_peer)


def is_chats_selector(selector: str) -> bool:
    sel = selector.strip()
    if not sel or sel.startswith("@"):
        return False
    if "#screen-chats" in sel:
        return True
    if any(k in sel for k in EXCLUDE_KEYWORDS):
        return False
    if has_shared_peer(sel):
        return False
    if re.search(r"\.chat-card(?:\s|[,{.]|$)", sel) and (
        ".post-chats" in sel or ".post-subpage" in sel
    ):
        return False
    return any(k in sel for k in CHATS_KEYWORDS)


def split_rules_in_block(body: str) -> tuple[str, str]:
    rules_c: list[str] = []
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
        bucket = rules_c if is_chats_selector(selector) else rules_g
        bucket.extend(pending_comments)
        bucket.append(rule)
        pending_comments = []
        i = k
    if pending_comments:
        rules_g.extend(pending_comments)
    return "\n".join(rules_c), "\n".join(rules_g)


def split_responsive_section(css: str) -> tuple[str, str]:
    marker = css.find("/* ════════════════════════════════\n   RESPONSIVE")
    if marker < 0:
        return css, ""
    before = css[:marker]
    responsive = css[marker:]
    globals_parts = [before]
    chats_parts: list[str] = []
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
        c_rules, g_rules = split_rules_in_block(body)
        if c_rules.strip():
            chats_parts.append(f"{prelude}\n{c_rules}\n}}\n")
        if g_rules.strip():
            globals_parts.append(f"{prelude}\n{g_rules}\n}}\n")
        i = k
    return "".join(globals_parts), "".join(chats_parts)


def replace_scroll_blocks(text: str) -> str:
    start = text.find(SCROLLBAR_BLOCK_START)
    if start < 0:
        return text
    layout_start = text.find(LAYOUT_BLOCK_START, start)
    if layout_start < 0:
        return text
    return text[:start] + SCROLLBAR_GROUPS[0] + "\n" + SCROLLBAR_GROUPS[1] + text[layout_start:]


def main() -> None:
    lines = GLOBALS.read_text(encoding="utf-8").splitlines(keepends=True)

    kept_lines: list[str] = []
    for idx, line in enumerate(lines, start=1):
        if in_cut(idx):
            continue
        kept_lines.append(line)

    main_block = "".join(lines[3219:3422])

    globals_text = replace_scroll_blocks("".join(kept_lines))
    new_globals, responsive_chats = split_responsive_section(globals_text)

    chats_text = (
        HEADER_CSS
        + main_block
        + "\n/* ── Responsive (extracted from globals.css) ── */\n"
        + responsive_chats
    )

    CHATS.write_text(chats_text, encoding="utf-8")
    GLOBALS.write_text(new_globals, encoding="utf-8")

    print(f"chats.css: {len(chats_text.splitlines())} lines")
    print(f"globals.css: {len(new_globals.splitlines())} lines")


if __name__ == "__main__":
    main()
