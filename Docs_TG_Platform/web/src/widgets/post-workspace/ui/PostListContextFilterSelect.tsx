"use client";

import { FilterTabSelect } from "@/shared/ui/filter-tab-select";
import {
  LIST_CONTEXT_FILTER_OPTIONS,
  listContextFilterLabel,
} from "@/shared/lib/listContextFilter";
import type { NoteListFilter } from "@/shared/types";

type Props = {
  value: NoteListFilter;
  onChange: (value: NoteListFilter) => void;
};

export default function PostListContextFilterSelect({ value, onChange }: Props) {
  const options = LIST_CONTEXT_FILTER_OPTIONS.map((key) => ({
    value: key,
    label: listContextFilterLabel(key, false),
  }));

  return (
    <FilterTabSelect
      className="post-list-context-filter-select"
      value={value}
      options={options}
      onChange={onChange}
      ariaLabel="Фильтр по контексту"
    />
  );
}
