#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "src"
REPLACEMENTS = [
    ("@/shared/data/demo-data", "@/shared/data/seed-data"),
    ("shared/lib/profile/userDemo", "shared/lib/profile/defaultUser"),
    ("shared/lib/analyticsDemoData", "shared/lib/analyticsSeedData"),
    ("ANALYTICS_TOP_POSTS_DEMO", "ANALYTICS_TOP_POSTS_SEED"),
    ("DEMO_USER", "DEFAULT_USER"),
    ("demoUser", "defaultUser"),
    ("tg-demo-theme", "tg-platform-theme"),
    ("tg-demo-sidebar-collapsed", "tg-platform-sidebar-collapsed"),
    ("tg-demo-feed-post-width", "tg-platform-feed-post-width"),
    ("/* ignore storage errors in demo */", "/* ignore storage errors (private mode, quota) */"),
    ("/* ignore read errors in demo */", "/* ignore read errors (clipboard, permissions) */"),
    ("демо-данных", "seed-данных"),
]

for path in ROOT.rglob("*"):
    if path.suffix not in {".ts", ".tsx"}:
        continue
    text = path.read_text(encoding="utf-8")
    orig = text
    for a, b in REPLACEMENTS:
        text = text.replace(a, b)
    if text != orig:
        path.write_text(text, encoding="utf-8")
        print(path.relative_to(ROOT.parent))
