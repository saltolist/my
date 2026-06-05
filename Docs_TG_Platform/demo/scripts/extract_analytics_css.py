#!/usr/bin/env python3
"""Extract analytics screen CSS from globals.css into analytics.css."""

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
GLOBALS = ROOT / "src" / "app" / "styles" / "globals.css"
ANALYTICS = ROOT / "src" / "app" / "styles" / "analytics.css"

CUT_RANGES = [(1284, 1323), (5621, 6919)]

ANALYTICS_KEYWORDS = (
    "#screen-analytics",
    "#main:has(#screen-analytics",
    ".analytics-",
    ".page-header-analytics",
    ".model-usage-",
    ".model-row-metric",
    ".model-analytics-summary",
    ".engagement-grid",
    ".heatmap",
    ".channel-metric",
    ".channel-metrics",
    ".channel-mini-metric",
    ".analytics-chart-head",
    ".analytics-card-head",
    ".bar-row.model-usage",
    ".trend-tooltip-strip",
    ".top-table.analytics",
    ".analytics-scroll-inner",
    ".stat-grid",
    ".stat-card",
    ".stat-label",
    ".stat-value",
    ".stat-delta",
    ".model-type-tabs",
    ".model-filter-stack",
    ".model-type-tab",
    ".platform-filter-select",
    ".platform-filter-label",
    ".platform-analytics-section",
    ".chart-series-selector",
    ".model-trend-plot",
    ".trend-plot",
    ".trend-chart",
    ".trend-labels",
    ".trend-tooltip",
    ".mini-metric",
    ".bar-row",
    ".bar-val",
    "--mobile-trend-chart-inset-x",
)

EXCLUDE_KEYWORDS = (
    "#screen-profile",
    ".profile-page",
)

HEADER_CSS = """/* Analytics screen + chart/trend shared styles */
/* Extracted from globals.css */

:root {
  --trend-chart-inset-x: 34px;
  --trend-tooltip-shadow: 0 6px 18px -8px rgba(0, 0, 0, 0.38);
}

:root[data-theme="light"] {
  --trend-tooltip-shadow: 0 6px 18px -8px rgba(0, 0, 0, 0.14);
}

/* ── Scrollbar + iOS scroll (analytics-page) ── */
.analytics-page::-webkit-scrollbar {
  width: var(--sb-w);
  height: var(--sb-w);
}
.analytics-page::-webkit-scrollbar-track {
  background: transparent;
}
.analytics-page::-webkit-scrollbar-thumb {
  background: var(--scroll-thumb);
  border-radius: 999px;
}
.analytics-page::-webkit-scrollbar-thumb:hover {
  background: var(--scroll-thumb-hover);
}
.analytics-page::-webkit-scrollbar-corner {
  background: transparent;
}
.analytics-page {
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-y: contain;
}

"""

SCROLLBAR_LINE_RE = re.compile(r"^\s*\.analytics-page")
# Only the root-level iOS-scroll group entry (not `.screen > :is(.analytics-page, …)`).
IOS_SCROLL_LINE_RE = re.compile(r"^\.analytics-page\s*,\s*$")


def in_cut(line_no: int) -> bool:
    return any(start <= line_no <= end for start, end in CUT_RANGES)


def is_analytics_selector(selector: str) -> bool:
    sel = selector.strip()
    if not sel or sel.startswith("@"):
        return False
    if "#screen-analytics" in sel or "#main:has(#screen-analytics" in sel:
        return True
    if any(k in sel for k in EXCLUDE_KEYWORDS):
        return False
    if sel.startswith(":root") and "--mobile-trend-chart-inset-x" in sel:
        return True
    if sel.startswith(":root"):
        return False
    return any(k in sel for k in ANALYTICS_KEYWORDS)


def split_rules_in_block(body: str) -> tuple[str, str]:
    rules_a: list[str] = []
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
        bucket = rules_a if is_analytics_selector(selector) else rules_g
        bucket.extend(pending_comments)
        bucket.append(rule)
        pending_comments = []
        i = k
    if pending_comments:
        rules_g.extend(pending_comments)
    return "\n".join(rules_a), "\n".join(rules_g)


def split_responsive_section(css: str) -> tuple[str, str]:
    marker = css.find("/* ════════════════════════════════\n   RESPONSIVE")
    if marker < 0:
        return css, ""
    before = css[:marker]
    responsive = css[marker:]
    globals_parts = [before]
    analytics_parts: list[str] = []
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
        a_rules, g_rules = split_rules_in_block(body)
        if a_rules.strip():
            analytics_parts.append(f"{prelude}\n{a_rules}\n}}\n")
        if g_rules.strip():
            globals_parts.append(f"{prelude}\n{g_rules}\n}}\n")
        i = k
    return "".join(globals_parts), "".join(analytics_parts)


def main() -> None:
    lines = GLOBALS.read_text(encoding="utf-8").splitlines(keepends=True)

    cut_lines: list[str] = []
    kept_lines: list[str] = []
    for idx, line in enumerate(lines, start=1):
        if in_cut(idx):
            cut_lines.append(line)
            continue
        if SCROLLBAR_LINE_RE.match(line) and (
            "::-webkit-scrollbar" in line or IOS_SCROLL_LINE_RE.match(line)
        ):
            continue
        if IOS_SCROLL_LINE_RE.match(line):
            continue
        kept_lines.append(line)

    analytics_body = (
        HEADER_CSS
        + "\n/* ── Analytics page header ── */\n"
        + "".join(lines[1283:1323])
        + "\n"
        + "".join(lines[5620:6919])
    )

    globals_text = "".join(kept_lines)
    new_globals, responsive_analytics = split_responsive_section(globals_text)

    analytics_text = (
        analytics_body
        + "\n/* ── Responsive (extracted from globals.css) ── */\n"
        + responsive_analytics
    )

    ANALYTICS.write_text(analytics_text, encoding="utf-8")
    GLOBALS.write_text(new_globals, encoding="utf-8")

    print(f"analytics.css: {len(analytics_text.splitlines())} lines")
    print(f"globals.css: {len(new_globals.splitlines())} lines")


if __name__ == "__main__":
    main()
