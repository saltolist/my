#!/usr/bin/env python3
"""Extract home + global chat screen CSS from globals.css into gchat.css."""

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
GLOBALS = ROOT / "src" / "app" / "styles" / "globals.css"
GCHAT = ROOT / "src" / "app" / "styles" / "gchat.css"

# 1-based inclusive line ranges
CUT_RANGES = [
    (3046, 3126),  # SCREEN: NEW GLOBAL CHAT + GLOBAL CHAT (open chat)
]

GCHAT_KEYWORDS = (
    "#screen-home",
    "#screen-gchat",
    ".gchat-layout",
    ".gchat-messages",
    ".home-layout",
    ".home-intro",
    ".home-logo",
    ".suggestions",
    ".chip",
)

SHARED_PEER_PREFIXES = (
    "#screen-feed",
    "#screen-chats",
    "#screen-notes",
    "#screen-post",
    "#screen-analytics",
    "#screen-profile",
    ".feed-",
    ".chats-",
    ".notes-",
    ".note-",
    ".post-",
    ".analytics-",
    ".profile-",
)

EXCLUDE_KEYWORDS: tuple[str, ...] = ()

HEADER_CSS = """/* Home + global chat screen styles */
/* Extracted from globals.css */

/* ── Scrollbar + iOS scroll (gchat messages) ── */
.gchat-messages::-webkit-scrollbar {
  width: var(--sb-w);
  height: var(--sb-w);
}
.gchat-messages::-webkit-scrollbar-track {
  background: transparent;
}
.gchat-messages::-webkit-scrollbar-thumb {
  background: var(--scroll-thumb);
  border-radius: 999px;
}
.gchat-messages::-webkit-scrollbar-thumb:hover {
  background: var(--scroll-thumb-hover);
}
.gchat-messages::-webkit-scrollbar-corner {
  background: transparent;
}
.gchat-messages {
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-y: contain;
}

/* ── Composer layout (global chat) ── */
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
.gchat-messages {
  overflow-x: hidden;
}
.composer-scroll-wrap > .gchat-messages {
  flex: 1;
  min-height: 0;
  min-width: 0;
}

/* ── Composer backdrop (global chat) ── */
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
COMPOSER_BLOCK_START = "/* Composer поверх скролла — полоса прокрутки до низа области под шапкой */"
COMPOSER_KEEP = """/* Composer scroll shell (shared) */
.composer-scroll-wrap {
  flex: 1;
  min-height: 0;
  min-width: 0;
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.composer-scroll-body {
  box-sizing: border-box;
}

"""


def in_cut(line_no: int) -> bool:
    return any(start <= line_no <= end for start, end in CUT_RANGES)


def has_shared_peer(selector: str) -> bool:
    sel = selector.replace("\n", " ")
    has_gchat = any(k in sel for k in ("#screen-home", "#screen-gchat", ".gchat-", ".home-", ".suggestions", ".chip"))
    has_peer = any(p in sel for p in SHARED_PEER_PREFIXES)
    return bool(has_gchat and has_peer)


def is_gchat_selector(selector: str) -> bool:
    sel = selector.strip()
    if not sel or sel.startswith("@"):
        return False
    if "#screen-home" in sel or "#screen-gchat" in sel:
        return True
    if has_shared_peer(sel):
        return False
    return any(k in sel for k in GCHAT_KEYWORDS)


def split_rules_in_block(body: str) -> tuple[str, str]:
    rules_g: list[str] = []
    rules_r: list[str] = []
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
            rules_r.extend(pending_comments)
            rules_r.append(body[i:])
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
        bucket = rules_g if is_gchat_selector(selector) else rules_r
        bucket.extend(pending_comments)
        bucket.append(rule)
        pending_comments = []
        i = k
    if pending_comments:
        rules_r.extend(pending_comments)
    return "\n".join(rules_g), "\n".join(rules_r)


def split_responsive_section(css: str) -> tuple[str, str]:
    marker = css.find("/* ════════════════════════════════\n   RESPONSIVE")
    if marker < 0:
        return css, ""
    before = css[:marker]
    responsive = css[marker:]
    globals_parts = [before]
    gchat_parts: list[str] = []
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
        g_rules, r_rules = split_rules_in_block(body)
        if g_rules.strip():
            gchat_parts.append(f"{prelude}\n{g_rules}\n}}\n")
        if r_rules.strip():
            globals_parts.append(f"{prelude}\n{r_rules}\n}}\n")
        i = k
    return "".join(globals_parts), "".join(gchat_parts)


def remove_scrollbar_block(text: str) -> str:
    start = text.find(SCROLLBAR_BLOCK_START)
    if start < 0:
        return text
    layout_start = text.find(LAYOUT_BLOCK_START, start)
    if layout_start < 0:
        return text
    return text[:start] + text[layout_start:]


GCHAT_COMPOSER_TAIL_START = "/* Маска за карточкой composer"
GCHAT_INPUT_BOX_Z = ".input-box {\n  position: relative;\n  z-index: 1;\n}\n\n"


def remove_gchat_composer_tail(text: str) -> str:
    """Remove #screen-gchat backdrop rules (moved to gchat.css)."""
    start = text.find(GCHAT_COMPOSER_TAIL_START)
    if start < 0:
        start = text.find("#screen-gchat .input-wrap {")
    if start < 0:
        return text
    marker = text.find("#screen-gchat .input-wrap > .input-box {", start)
    if marker < 0:
        return text
    end = text.find("\n}", marker)
    if end < 0:
        return text
    end += 2
    after = text[end:].lstrip("\n")
    if after.startswith(GCHAT_INPUT_BOX_Z):
        after = after[len(GCHAT_INPUT_BOX_Z) :]
    return text[:start] + after


def remove_gchat_composer_block(text: str) -> str:
    text = remove_gchat_composer_tail(text)
    start = text.find(COMPOSER_BLOCK_START)
    if start < 0:
        return text
    wrap_start = text.find(".composer-scroll-wrap {", start)
    if wrap_start < 0:
        return text
    body_start = text.find(".composer-scroll-body {", wrap_start)
    if body_start < 0:
        return text
    body_end = text.find("\n}", body_start)
    if body_end < 0:
        return text
    body_end += 2
    after = text[body_end:].lstrip("\n")
    if after.startswith(GCHAT_INPUT_BOX_Z):
        after = after[len(GCHAT_INPUT_BOX_Z) :]
    return text[:start] + COMPOSER_KEEP + after


def main() -> None:
    lines = GLOBALS.read_text(encoding="utf-8").splitlines(keepends=True)

    kept_lines: list[str] = []
    for idx, line in enumerate(lines, start=1):
        if in_cut(idx):
            continue
        kept_lines.append(line)

    main_block = "".join(lines[3045:3126])

    globals_text = remove_scrollbar_block("".join(kept_lines))
    globals_text = remove_gchat_composer_block(globals_text)
    new_globals, responsive_gchat = split_responsive_section(globals_text)

    gchat_text = (
        HEADER_CSS
        + main_block
        + "\n/* ── Responsive (extracted from globals.css) ── */\n"
        + responsive_gchat
    )

    GCHAT.write_text(gchat_text, encoding="utf-8")
    GLOBALS.write_text(new_globals, encoding="utf-8")

    print(f"gchat.css: {len(gchat_text.splitlines())} lines")
    print(f"globals.css: {len(new_globals.splitlines())} lines")


if __name__ == "__main__":
    main()
