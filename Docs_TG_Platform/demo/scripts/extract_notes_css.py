#!/usr/bin/env python3
"""Extract notes screen CSS from globals.css into notes.css."""

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
GLOBALS = ROOT / "app" / "globals.css"
NOTES = ROOT / "app" / "notes.css"

# NOTE PAGE + NOTES LIST main blocks (1-based line numbers, inclusive)
CUT_RANGES = [(3793, 4312), (4517, 4789)]

NOTES_KEYWORDS = (
    "#screen-notes",
    ".notes-page",
    ".notes-toolbar",
    ".notes-filter",
    ".notes-grid",
    ".notes-scope",
    ".notes-search",
    ".notes-new-note",
    ".note-page",
    ".note-layout",
    ".note-shell",
    ".note-card",
    ".note-ai-toggle",
    ".note-file",
    ".note-embed",
    ".note-body",
    ".note-header",
    ".note-title",
    ".note-ctrl",
    ".note-divider",
    ".note-mode",
    ".note-timestamps",
    ".note-card-context",
    ".note-card-footer",
    ".note-card-meta",
    ".note-card-name",
    ".note-card-preview",
    ".note-card-page",
    ".filter-tab--dropdown.notes-new-note-btn",
    "button.filter-tab.filter-tab--dropdown",
)

SHARED_PEER_PREFIXES = (
    "#screen-chats",
    "#screen-feed",
    "#screen-post",
    "#screen-gchat",
    "#screen-home",
    ".chats-",
    ".chat-card",
    ".feed-",
    ".post-",
    ".gchat-",
    ".home-",
)

EXCLUDE_KEYWORDS = (
    ".post-subpage",
    ".post-hdr",
    "#screen-post",
)

HEADER_CSS = """/* Notes screen styles */
/* Extracted from globals.css */

/* ── Scrollbar + iOS scroll (notes scroll containers) ── */
.notes-page::-webkit-scrollbar,
.note-page::-webkit-scrollbar {
  width: var(--sb-w);
  height: var(--sb-w);
}
.notes-page::-webkit-scrollbar-track,
.note-page::-webkit-scrollbar-track {
  background: transparent;
}
.notes-page::-webkit-scrollbar-thumb,
.note-page::-webkit-scrollbar-thumb {
  background: var(--scroll-thumb);
  border-radius: 999px;
}
.notes-page::-webkit-scrollbar-thumb:hover,
.note-page::-webkit-scrollbar-thumb:hover {
  background: var(--scroll-thumb-hover);
}
.notes-page::-webkit-scrollbar-corner,
.note-page::-webkit-scrollbar-corner {
  background: transparent;
}
.notes-page,
.note-page {
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-y: contain;
}

"""

SCROLLBAR_GROUPS = (
    (
        "/* ── Custom thin scrollbar for main scroll containers (WebKit) ── */\n"
        ".gchat-messages::-webkit-scrollbar,\n"
        ".feed-scroll::-webkit-scrollbar,\n"
        ".chats-scroll::-webkit-scrollbar {\n"
        "  width: var(--sb-w);\n"
        "  height: var(--sb-w);\n"
        "}\n"
        ".gchat-messages::-webkit-scrollbar-track,\n"
        ".feed-scroll::-webkit-scrollbar-track,\n"
        ".chats-scroll::-webkit-scrollbar-track {\n"
        "  background: transparent;\n"
        "}\n"
        ".gchat-messages::-webkit-scrollbar-thumb,\n"
        ".feed-scroll::-webkit-scrollbar-thumb,\n"
        ".chats-scroll::-webkit-scrollbar-thumb {\n"
        "  background: var(--scroll-thumb);\n"
        "  border-radius: 999px;\n"
        "}\n"
        ".gchat-messages::-webkit-scrollbar-thumb:hover,\n"
        ".feed-scroll::-webkit-scrollbar-thumb:hover,\n"
        ".chats-scroll::-webkit-scrollbar-thumb:hover {\n"
        "  background: var(--scroll-thumb-hover);\n"
        "}\n"
        ".gchat-messages::-webkit-scrollbar-corner,\n"
        ".feed-scroll::-webkit-scrollbar-corner,\n"
        ".chats-scroll::-webkit-scrollbar-corner {\n"
        "  background: transparent;\n"
        "}\n"
    ),
    (
        "/* iOS / iPad: инерционный скролл во внутренних контейнерах */\n"
        ".chats-page,\n"
        ".chats-scroll,\n"
        ".feed-scroll,\n"
        ".gchat-messages {\n"
        "  -webkit-overflow-scrolling: touch;\n"
        "  overscroll-behavior-y: contain;\n"
        "}\n"
    ),
)

SCROLLBAR_BLOCK_START = "/* ── Custom thin scrollbar for main scroll containers (WebKit) ── */"
IOS_SCROLL_BLOCK_START = "/* iOS / iPad: инерционный скролл во внутренних контейнерах */"


def in_cut(line_no: int) -> bool:
    return any(start <= line_no <= end for start, end in CUT_RANGES)


def has_shared_peer(selector: str) -> bool:
    sel = selector.replace("\n", " ")
    has_notes = "#screen-notes" in sel or ".notes-" in sel or re.search(
        r"\.note-(?!picker)", sel
    )
    has_peer = any(p in sel for p in SHARED_PEER_PREFIXES)
    return bool(has_notes and has_peer)


def is_notes_selector(selector: str) -> bool:
    sel = selector.strip()
    if not sel or sel.startswith("@"):
        return False
    if "#screen-notes" in sel:
        return True
    if any(k in sel for k in EXCLUDE_KEYWORDS):
        return False
    if has_shared_peer(sel):
        return False
    if re.search(r"\.note-card(?:\s|[,{.]|$)", sel) and ".post-subpage" in sel.replace(
        "\n", " "
    ):
        return False
    if re.search(r"\.notes-grid(?:\s|[,{.]|$)", sel) and "post-subpage" in sel.replace(
        "\n", " "
    ):
        return False
    if ".filter-tab" in sel and not any(
        k in sel for k in (".notes-", "#screen-notes", ".note-")
    ):
        return False
    return any(k in sel for k in NOTES_KEYWORDS)


def split_rules_in_block(body: str) -> tuple[str, str]:
    rules_n: list[str] = []
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
        bucket = rules_n if is_notes_selector(selector) else rules_g
        bucket.extend(pending_comments)
        bucket.append(rule)
        pending_comments = []
        i = k
    if pending_comments:
        rules_g.extend(pending_comments)
    return "\n".join(rules_n), "\n".join(rules_g)


def split_responsive_section(css: str) -> tuple[str, str]:
    marker = css.find("/* ════════════════════════════════\n   RESPONSIVE")
    if marker < 0:
        return css, ""
    before = css[:marker]
    responsive = css[marker:]
    globals_parts = [before]
    notes_parts: list[str] = []
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
        n_rules, g_rules = split_rules_in_block(body)
        if n_rules.strip():
            notes_parts.append(f"{prelude}\n{n_rules}\n}}\n")
        if g_rules.strip():
            globals_parts.append(f"{prelude}\n{g_rules}\n}}\n")
        i = k
    return "".join(globals_parts), "".join(notes_parts)


def replace_scroll_blocks(text: str) -> str:
    """Remove notes scroll selectors from shared scrollbar / iOS scroll groups."""
    start = text.find(SCROLLBAR_BLOCK_START)
    if start < 0:
        return text
    ios_start = text.find(IOS_SCROLL_BLOCK_START, start)
    if ios_start < 0:
        return text
    ios_end = text.find("\n\n", ios_start + 1)
    if ios_end < 0:
        ios_end = len(text)
    else:
        ios_end += 2
    return text[:start] + SCROLLBAR_GROUPS[0] + "\n" + SCROLLBAR_GROUPS[1] + text[ios_end:]


def main() -> None:
    lines = GLOBALS.read_text(encoding="utf-8").splitlines(keepends=True)

    kept_lines: list[str] = []
    for idx, line in enumerate(lines, start=1):
        if in_cut(idx):
            continue
        kept_lines.append(line)

    main_block = (
        "".join(lines[3792:4312])
        + "\n"
        + "".join(lines[4516:4789])
    )

    globals_text = replace_scroll_blocks("".join(kept_lines))
    new_globals, responsive_notes = split_responsive_section(globals_text)

    notes_text = (
        HEADER_CSS
        + main_block
        + "\n/* ── Responsive (extracted from globals.css) ── */\n"
        + responsive_notes
    )

    NOTES.write_text(notes_text, encoding="utf-8")
    GLOBALS.write_text(new_globals, encoding="utf-8")

    print(f"notes.css: {len(notes_text.splitlines())} lines")
    print(f"globals.css: {len(new_globals.splitlines())} lines")


if __name__ == "__main__":
    main()
