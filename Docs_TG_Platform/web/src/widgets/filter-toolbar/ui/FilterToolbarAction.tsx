"use client";

import { MenuIconPlus } from "@/widgets/page-header";

type Props = {
  label: string;
  onClick: () => void;
  className?: string;
  iconClassName?: string;
};

export default function FilterToolbarAction({
  label,
  onClick,
  className = "filter-tab active",
  iconClassName = "filter-toolbar-action-icon",
}: Props) {
  return (
    <button type="button" className={className} onClick={onClick}>
      <span className={iconClassName} aria-hidden>
        <MenuIconPlus size={12} strokeWidth={2} />
      </span>
      <span>{label}</span>
    </button>
  );
}
