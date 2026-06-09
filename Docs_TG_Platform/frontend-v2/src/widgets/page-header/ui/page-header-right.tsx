import type { ReactNode } from "react";

import { BackButton } from "@/shared/ui/back-button";

export type PageHeaderRightProps = {
  actions?: ReactNode;
  onBack?: () => void;
  backLabel?: string;
  showBack?: boolean;
};

export function PageHeaderRight({
  actions,
  onBack,
  backLabel = "Назад",
  showBack = Boolean(onBack),
}: PageHeaderRightProps) {
  return (
    <div className="flex min-w-0 items-center justify-end gap-2">
      {actions}
      {showBack && onBack ? <BackButton onClick={onBack} label={backLabel} /> : null}
    </div>
  );
}
