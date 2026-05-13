"use client";

import type { ReactNode } from "react";
import { useApp } from "@/state/AppContext";
import type { ScreenId } from "@/lib/types";

type Props = {
  title?: ReactNode;
  left?: ReactNode;
  backTo?: ScreenId;
  onBack?: () => void;
  backLabel?: string;
  search?: ReactNode;
  actions?: ReactNode;
};

export default function PageHeader({
  title,
  left,
  backTo,
  onBack,
  backLabel = "← Назад",
  search,
  actions,
}: Props) {
  const { navigateBack } = useApp();
  const handleBack = onBack ?? (backTo ? () => navigateBack(backTo) : undefined);
  const hasRight = !!(handleBack || actions);
  return (
    <div className="page-header">
      <div className="page-header-left">
        {title ? <h2>{title}</h2> : null}
        {left}
      </div>
      {search ? <div className="page-header-center">{search}</div> : null}
      {hasRight ? (
        <div className="page-header-right">
          {handleBack ? (
            <button
              className="btn btn-ghost btn-sm"
              onClick={handleBack}
              type="button"
            >
              {backLabel}
            </button>
          ) : null}
          {actions}
        </div>
      ) : null}
    </div>
  );
}
