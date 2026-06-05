"use client";

import { useMemo } from "react";
import { ContextMenu } from "@/shared/ui/context-menu";
import {
  LIST_CONTEXT_FILTER_OPTIONS,
  listContextFilterLabel,
} from "@/shared/lib/listContextFilter";
import type { NoteListFilter } from "@/shared/types";

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
  value: NoteListFilter;
  onChange: (value: NoteListFilter) => void;
};

export default function PostListContextFilterSelect({ value, onChange }: Props) {
  const label = useMemo(() => listContextFilterLabel(value, false), [value]);

  const panelMinWidth = useMemo(() => {
    const longest = LIST_CONTEXT_FILTER_OPTIONS.reduce(
      (max, key) => Math.max(max, listContextFilterLabel(key, false).length),
      0,
    );
    return Math.min(320, Math.max(160, longest * 8 + 48));
  }, []);

  return (
    <ContextMenu
      className="post-list-context-filter-select"
      triggerVariant="custom"
      triggerClassName="filter-tab filter-tab--dropdown active"
      trigger={
        <>
          <span className="filter-tab--dropdown-label">{label}</span>
          <ChevronDown />
        </>
      }
      triggerAriaLabel="Фильтр по контексту"
      portal
      align="left"
      panelMinWidth={panelMinWidth}
      dropdownClassName="ctx-dropdown--page-header-control ctx-dropdown--page-header-select"
      items={LIST_CONTEXT_FILTER_OPTIONS.map((key) => ({
        label: listContextFilterLabel(key, false),
        active: key === value,
        onClick: () => onChange(key),
      }))}
    />
  );
}
