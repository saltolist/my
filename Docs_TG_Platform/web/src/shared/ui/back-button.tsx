"use client";

import { PageHeaderControl } from "@/shared/ui/page-header-tab-group";

type BackButtonProps = {
  onClick: () => void;
  label?: string;
};

export function BackButton({ onClick, label = "← Назад" }: BackButtonProps) {
  return (
    <PageHeaderControl type="button" onClick={onClick}>
      {label}
    </PageHeaderControl>
  );
}
