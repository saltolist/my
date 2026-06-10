"use client";

import { UserRound } from "lucide-react";

import { useScreenBack } from "@/shared/lib/hooks/useScreenBack";
import { EmptyState } from "@/shared/ui/empty-state";
import { ScreenShell } from "@/screens/_ui/screen-shell";
import { PageHeader } from "@/widgets/page-header";

export function ProfileScreen() {
  const onBack = useScreenBack();

  return (
    <ScreenShell header={<PageHeader title="Профиль" onBack={onBack} profileBreakpoints />}>
      <EmptyState
        icon={<UserRound className="size-5" />}
        message="Вкладки «Канал» и «Настройки» появятся на следующем шаге."
        className="min-h-[50vh]"
      />
    </ScreenShell>
  );
}
