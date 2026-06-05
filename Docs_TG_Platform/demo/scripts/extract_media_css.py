#!/usr/bin/env python3
"""Extract shared TG-style media grid CSS from globals.css into media.css."""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
GLOBALS = ROOT / "src" / "app" / "styles" / "globals.css"
MEDIA = ROOT / "src" / "app" / "styles" / "media.css"

# 1-based inclusive line range (TG-style media block)
CUT_RANGES = [
    (2955, 3034),
]

HEADER = """/* Shared TG-style media grid (feed + post) */
/* Extracted from globals.css */

"""


def in_cut(line_no: int) -> bool:
    return any(start <= line_no <= end for start, end in CUT_RANGES)


def main() -> None:
    lines = GLOBALS.read_text(encoding="utf-8").splitlines(keepends=True)

    kept_lines: list[str] = []
    cut_lines: list[str] = []
    for idx, line in enumerate(lines, start=1):
        if in_cut(idx):
            cut_lines.append(line)
        else:
            kept_lines.append(line)

    media_text = HEADER + "".join(cut_lines).lstrip("\n")
    if not media_text.endswith("\n"):
        media_text += "\n"

    MEDIA.write_text(media_text, encoding="utf-8")
    GLOBALS.write_text("".join(kept_lines), encoding="utf-8")

    print(f"media.css: {len(media_text.splitlines())} lines")
    print(f"globals.css: {len(kept_lines)} lines")


if __name__ == "__main__":
    main()
