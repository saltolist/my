"use client";

import type { ReactNode } from "react";
import { useMobile760 } from "@/lib/hooks/useMobile760";
import {
  LIST_CONTEXT_FILTER_OPTIONS,
  listContextFilterLabel,
} from "@/lib/listContextFilter";
import type { NoteListFilter } from "@/lib/types";
import PostListContextFilterSelect from "./PostListContextFilterSelect";

type Props = {
  filter: NoteListFilter;
  onFilterChange: (value: NoteListFilter) => void;
  action: ReactNode;
};

export default function PostSubpageToolbar({ filter, onFilterChange, action }: Props) {
  const isMobile = useMobile760();

  return (
    <div className="post-subpage-toolbar">
      <div className="post-subpage-toolbar-filters">
        {isMobile ? (
          <PostListContextFilterSelect value={filter} onChange={onFilterChange} />
        ) : (
          LIST_CONTEXT_FILTER_OPTIONS.map((key) => (
            <button
              key={key}
              type="button"
              className={`filter-tab${filter === key ? " active" : ""}`}
              onClick={() => onFilterChange(key)}
            >
              {listContextFilterLabel(key, true)}
            </button>
          ))
        )}
      </div>
      {action}
    </div>
  );
}
