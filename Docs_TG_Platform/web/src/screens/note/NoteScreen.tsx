"use client";

import { usePathname } from "next/navigation";
import { StickyNote } from "lucide-react";

import { useNavigationStore } from "@/app/model/store";
import { useScreenBack } from "@/shared/lib/hooks/useScreenBack";
import { parseAppPath } from "@/shared/lib/routes";
import { EmptyState } from "@/shared/ui/empty-state";
import { ScreenShell } from "@/screens/_ui/screen-shell";
import { PageHeader } from "@/widgets/page-header";
import { routeNeedsCachedData } from "@/widgets/app-shell/lib/syncRoute";

export function NoteScreen() {
  const pathname = usePathname() ?? "/";
  const route = parseAppPath(pathname);
  const onBack = useScreenBack();

  const currentNote = useNavigationStore((s) => s.currentNote);
  const noteFrom = useNavigationStore((s) => s.noteFrom);

  const isNew = route.noteIsNew;
  const needsCache = routeNeedsCachedData(pathname);
  const loading = needsCache && !currentNote;

  let title = "Заметка";
  if (isNew) title = "Новая заметка";
  else if (currentNote) title = currentNote.title;

  return (
    <ScreenShell header={<PageHeader title={title} onBack={onBack} />}>
      <EmptyState
        icon={<StickyNote className="size-5" />}
        message={
          loading
            ? "Загрузка заметки…"
            : isNew
              ? `from=${noteFrom}`
              : currentNote
                ? "Note editor — M3+ (note-editor widget)."
                : "Заметка не найдена."
        }
        className="min-h-[50vh]"
      />
    </ScreenShell>
  );
}
