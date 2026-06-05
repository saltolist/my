"use client";

import { useMemo } from "react";
import { ContextMenu } from "@/shared/ui/context-menu";
import type { NoteScope } from "@/shared/types";

const OPTIONS: { value: NoteScope; label: string }[] = [
  { value: "all", label: "Глобальные / локальные" },
  { value: "global", label: "Только глобальные" },
  { value: "local", label: "Только локальные" },
];

function ChevronDown() {
  return (
    <svg
      className="filter-tab-chevron"
      viewBox="0 0 24 24"
      width={14}
      height={14}
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

type Props = {
  value: NoteScope;
  onChange: (value: NoteScope) => void;
};

export default function NotesScopeFilterSelect({ value, onChange }: Props) {
  const label = useMemo(
    () => OPTIONS.find((o) => o.value === value)?.label ?? "Глобальные / локальные",
    [value],
  );

  const panelMinWidth = useMemo(() => {
    const longest = OPTIONS.reduce((max, o) => Math.max(max, o.label.length), 0);
    return Math.min(320, Math.max(160, longest * 8 + 48));
  }, []);

  return (
    <ContextMenu
      className="notes-filter-tab-select"
      triggerVariant="custom"
      triggerClassName="filter-tab filter-tab--dropdown active"
      trigger={
        <>
          <span className="filter-tab--dropdown-label">{label}</span>
          <ChevronDown />
        </>
      }
      triggerAriaLabel="Область заметок"
      portal
      align="left"
      panelMinWidth={panelMinWidth}
      dropdownClassName="ctx-dropdown--page-header-control ctx-dropdown--page-header-select"
      items={OPTIONS.map((o) => ({
        label: o.label,
        active: o.value === value,
        onClick: () => onChange(o.value),
      }))}
    />
  );
}
