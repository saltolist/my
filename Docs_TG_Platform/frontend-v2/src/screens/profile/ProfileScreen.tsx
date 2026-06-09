"use client";

import { UserRound } from "lucide-react";

import { useTopLevelBack } from "@/shared/lib/hooks/useTopLevelBack";
import { EmptyState } from "@/shared/ui/empty-state";
import { ScreenShell } from "@/screens/_ui/screen-shell";
import { PageHeader } from "@/widgets/page-header";

export function ProfileScreen() {
  const onBack = useTopLevelBack();

  return (
    <ScreenShell header={<PageHeader title="Профиль" onBack={onBack} />}>
      <EmptyState
        icon={<UserRound className="size-5" />}
        message="Вкладки «Канал» и «Настройки» появятся на следующем шаге."
        className="min-h-[50vh]"
      />
    </ScreenShell>
  );
}
