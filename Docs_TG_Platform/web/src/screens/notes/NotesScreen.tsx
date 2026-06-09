"use client";

import { useGlobalNotes } from "@/entities/note";
import { DataStatus } from "@/screens/_ui/data-status";
import { PlaceholderScreen } from "@/screens/_ui/placeholder-screen";

export function NotesScreen() {
  const { data, isLoading, error } = useGlobalNotes();

  return (
    <PlaceholderScreen title="Заметки" subtitle="Каталог глобальных и локальных заметок — M3+.">
      <DataStatus loading={isLoading} error={error} count={data?.length} label="глобальных заметок" />
    </PlaceholderScreen>
  );
}
