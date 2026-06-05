#!/usr/bin/env python3
"""Extract post screen CSS from globals.css into post.css."""

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
GLOBALS = ROOT / "src" / "app" / "styles" / "globals.css"
POST = ROOT / "src" / "app" / "styles" / "post.css"

CUT_RANGES = [(3732, 4302), (4386, 4575)]

POST_KEYWORDS = (
    "#screen-post",
    ".post-hdr",
    ".post-screen",
    ".post-body",
    ".post-subpage",
    ".post-chats",
    ".post-msg",
    ".post-comment",
    ".post-edit",
    ".post-header-search",
    ".post-new-",
    ".post-mode",
    ".post-back",
    ".post-metric",
    ".post-format-phone",
    ".post-card-metrics",
    ".post-card-comments",
    ".post-card .post-comments",
    ".jump-post",
    ".comment-reply",
    ".post-header-search",
    ".filter-tab--action",
    ".notes-grid.visible",
    ".notes-grid-inner",
    ".post-subpage-scroll .notes-grid",
)

EXCLUDE_KEYWORDS = (
    "#screen-notes",
    "#screen-feed",
    "#screen-gchat",
    "#screen-home",
    ".notes-grid-layout",
    ".notes-grid-page",
    ".notes-grid--screen",
    ".notes-page",
    ".feed-scroll",
    ".post-card:hover",
    ".post-card.post-card",
    ".post-card--draft",
    ".post-card-body",
    ".post-card-text",
    ".post-card-media",
    ".post-card-footer",
    ".post-reaction",
    ".post-status",
    ".post-meta",
    ".feed-day",
)

HEADER_CSS = """/* Post screen styles */
/* Extracted from globals.css */

/* ── Scrollbar + iOS scroll (post scroll containers) ── */
.post-body::-webkit-scrollbar,
.post-subpage-scroll::-webkit-scrollbar {
  width: var(--sb-w);
  height: var(--sb-w);
}
.post-body::-webkit-scrollbar-track,
.post-subpage-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.post-body::-webkit-scrollbar-thumb,
.post-subpage-scroll::-webkit-scrollbar-thumb {
  background: var(--scroll-thumb);
  border-radius: 999px;
}
.post-body::-webkit-scrollbar-thumb:hover,
.post-subpage-scroll::-webkit-scrollbar-thumb:hover {
  background: var(--scroll-thumb-hover);
}
.post-body::-webkit-scrollbar-corner,
.post-subpage-scroll::-webkit-scrollbar-corner {
  background: transparent;
}
.post-body,
.post-subpage-scroll {
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-y: contain;
}

/* ── Composer layout (post screen) ── */
.post-screen-wrap {
  position: relative;
}
.post-screen-wrap > .input-wrap {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  margin-top: 0;
}
.post-body {
  overflow-x: hidden;
}
.composer-scroll-wrap > .post-body {
  flex: 1;
  min-height: 0;
  min-width: 0;
}

/* ── Composer (post screen) ── */
#screen-post .input-wrap {
  --input-wrap-pad-top: 18px;
  --input-wrap-pad-bottom: 20px;
  overflow: visible;
}
#screen-post .composer-backdrop {
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
#screen-post .composer-backdrop::before {
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
#screen-post .input-wrap > .input-box {
  position: relative;
  z-index: 1;
}
#screen-post .input-box {
  width: var(--composer-w);
  max-width: 100%;
  padding: 20px;
  min-height: 95px;
}
#screen-post .composer-editor {
  min-height: calc(1.5em + 2px);
  margin-top: -4px;
}

"""

POST_SCROLLBAR_LINE_RE = re.compile(r"^\s*\.(post-body|post-subpage-scroll)")
POST_IOS_SCROLL_LINE_RE = re.compile(r"^\.(post-body|post-subpage-scroll)\s*,\s*$")


def in_cut(line_no: int) -> bool:
    return any(start <= line_no <= end for start, end in CUT_RANGES)


def is_post_selector(selector: str) -> bool:
    sel = selector.strip()
    if not sel or sel.startswith("@"):
        return False
    if "#screen-post" in sel:
        return True
    if any(k in sel for k in EXCLUDE_KEYWORDS):
        return False
    if re.search(r"\.notes-grid(?!\.|\s|$)", sel) and ".post-subpage" not in sel:
        if ".notes-grid-inner" in sel and "#screen-notes" not in sel and ".post-subpage" not in sel:
            if "post-subpage-scroll" not in sel.replace(" ", ""):
                pass
    if ".notes-grid-inner .note-card" in sel.replace("\n", " "):
        return True
    if re.search(r"\.note-card(?:\s|[,{.]|$)", sel) and ".post-subpage" in sel.replace("\n", " "):
        return True
    if re.search(r"\.notes-grid(?:\s|[,{.]|$)", sel) and "post-subpage" in sel.replace("\n", " "):
        return True
    if any(k in sel for k in POST_KEYWORDS):
        return True
    return False


def split_rules_in_block(body: str) -> tuple[str, str]:
    rules_p: list[str] = []
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
        bucket = rules_p if is_post_selector(selector) else rules_g
        bucket.extend(pending_comments)
        bucket.append(rule)
        pending_comments = []
        i = k
    if pending_comments:
        rules_g.extend(pending_comments)
    return "\n".join(rules_p), "\n".join(rules_g)


def split_responsive_section(css: str) -> tuple[str, str]:
    marker = css.find("/* ════════════════════════════════\n   RESPONSIVE")
    if marker < 0:
        return css, ""
    before = css[:marker]
    responsive = css[marker:]
    globals_parts = [before]
    post_parts: list[str] = []
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
        p_rules, g_rules = split_rules_in_block(body)
        if p_rules.strip():
            post_parts.append(f"{prelude}\n{p_rules}\n}}\n")
        if g_rules.strip():
            globals_parts.append(f"{prelude}\n{g_rules}\n}}\n")
        i = k
    return "".join(globals_parts), "".join(post_parts)


def main() -> None:
    lines = GLOBALS.read_text(encoding="utf-8").splitlines(keepends=True)

    kept_lines: list[str] = []
    for idx, line in enumerate(lines, start=1):
        if in_cut(idx):
            continue
        if POST_SCROLLBAR_LINE_RE.match(line) and "::-webkit-scrollbar" in line:
            continue
        if POST_IOS_SCROLL_LINE_RE.match(line):
            continue
        kept_lines.append(line)

    main_block = "".join(lines[3731:4302]) + "".join(lines[4385:4575])

    globals_text = "".join(kept_lines)
    new_globals, responsive_post = split_responsive_section(globals_text)

    post_text = (
        HEADER_CSS
        + "\n/* ════════════════════════════════\n   SCREEN: POST SPACE\n"
        + "════════════════════════════════ */\n"
        + main_block
        + "\n/* ── Responsive (extracted from globals.css) ── */\n"
        + responsive_post
    )

    POST.write_text(post_text, encoding="utf-8")
    GLOBALS.write_text(new_globals, encoding="utf-8")

    print(f"post.css: {len(post_text.splitlines())} lines")
    print(f"globals.css: {len(new_globals.splitlines())} lines")


if __name__ == "__main__":
    main()
