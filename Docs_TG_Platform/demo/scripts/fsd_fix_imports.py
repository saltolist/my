#!/usr/bin/env python3
"""Fix broken relative imports after FSD migration."""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "src"

REPLACEMENTS = [
    ('from "../post/PostMediaBlock"', 'from "@/entities/post/ui/PostMediaBlock"'),
    ('from "../post/PostCommentsRow"', 'from "@/widgets/post-workspace/ui/PostCommentsRow"'),
    ('from "./PostStatus"', 'from "@/entities/post/ui/PostStatus"'),
    ('from "../note/NoteHeaderIcons"', 'from "@/widgets/note-editor/ui/NoteHeaderIcons"'),
    ('from "../chat/MessageTrashIcon"', 'from "@/entities/message/ui/MessageTrashIcon"'),
    ('from "../chat/MessageRenameIcon"', 'from "@/entities/message/ui/MessageRenameIcon"'),
    ('from "../feed/PostEngagement"', 'from "@/widgets/feed/ui/PostEngagement"'),
    ('from "./modelPickerTypes"', 'from "../model/types"'),
    ('@/widgets/post-workspace/ui/PostMediaBlock', '@/entities/post/ui/PostMediaBlock'),
    ('@/widgets/post-workspace/ui/PostStatusBadge', '@/entities/post/ui/PostStatusBadge'),
    ('@/widgets/feed/ui/PostStatus', '@/entities/post/ui/PostStatus'),
    ('@/shared/ui/context-menu/ui/ContextMenu', '@/shared/ui/context-menu'),
    ('from "@/features/post-context-menu/ui/postCtxMenu"', 'from "@/features/post-context-menu"'),
    ('from "@/widgets/post-workspace/ui/postCtxMenu"', 'from "@/features/post-context-menu"'),
    ('from "./postCtxMenu"', 'from "@/features/post-context-menu"'),
    ('from "../post/postCtxMenu"', 'from "@/features/post-context-menu"'),
    ('from "./buildPostCtxMenuItems"', 'from "@/features/post-context-menu/lib/buildItems"'),
    ('from "./buildItems"', 'from "@/features/post-context-menu/lib/buildItems"'),
    ('from "./SchedulePickerModal"', 'from "@/features/schedule-post/ui/SchedulePickerModal"'),
    ('from "@/widgets/post-workspace/ui/SchedulePickerModal"', 'from "@/features/schedule-post/ui/SchedulePickerModal"'),
    ('from "@/widgets/sidebar/ui/buildRecentModels"', 'from "@/widgets/sidebar/lib/buildRecentModels"'),
    ('from "../sidebar/buildRecentModels"', 'from "@/widgets/sidebar/lib/buildRecentModels"'),
    ('from "../sidebar/types"', 'from "@/widgets/sidebar/model/types"'),
    ('from "@/widgets/sidebar/ui/types"', 'from "@/widgets/sidebar/model/types"'),
]

# Move buildRecentModels if still in ui
sidebar_build = ROOT / "widgets/sidebar/ui/buildRecentModels.ts"
sidebar_lib = ROOT / "widgets/sidebar/lib"
if sidebar_build.exists():
    sidebar_lib.mkdir(parents=True, exist_ok=True)
    sidebar_build.rename(sidebar_lib / "buildRecentModels.ts")

sidebar_types = ROOT / "widgets/sidebar/ui/types.ts"
if sidebar_types.exists():
    (ROOT / "widgets/sidebar/model").mkdir(parents=True, exist_ok=True)
    sidebar_types.rename(ROOT / "widgets/sidebar/model/types.ts")


def main() -> None:
    count = 0
    for path in ROOT.rglob("*"):
        if path.suffix not in {".ts", ".tsx"}:
            continue
        text = path.read_text(encoding="utf-8")
        original = text
        for old, new in REPLACEMENTS:
            text = text.replace(old, new)
        if text != original:
            path.write_text(text, encoding="utf-8")
            count += 1
    print(f"Fixed {count} files")


if __name__ == "__main__":
    main()
