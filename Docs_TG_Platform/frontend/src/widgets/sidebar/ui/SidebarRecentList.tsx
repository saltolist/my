"use client";

import type { ReactNode } from "react";

import {
  SidebarRecentRow,
  type SidebarRecentRowItem,
} from "@/widgets/sidebar/ui/sidebar-recent-row";

type SidebarRecentListProps = {
  items: SidebarRecentRowItem[];
  grouped?: {
    thisPost: SidebarRecentRowItem[];
    others: SidebarRecentRowItem[];
  };
  menuItems?: (item: SidebarRecentRowItem) => { label: string; onClick: () => void }[];
};

function Section({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className="space-y-0.5">
      {title ? (
        <p className="px-2 py-1 text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
          {title}
        </p>
      ) : null}
      {children}
    </div>
  );
}

export function SidebarRecentList({ items, grouped, menuItems }: SidebarRecentListProps) {
  if (grouped) {
    return (
      <div className="space-y-2 pl-7">
        {grouped.thisPost.length > 0 ? (
          <Section title="Этот пост">
            {grouped.thisPost.map((item) => (
              <SidebarRecentRow
                key={item.key}
                item={item}
                menuItems={menuItems?.(item)}
              />
            ))}
          </Section>
        ) : null}
        {grouped.others.length > 0 ? (
          <Section title="Остальные">
            {grouped.others.map((item) => (
              <SidebarRecentRow
                key={item.key}
                item={item}
                menuItems={menuItems?.(item)}
              />
            ))}
          </Section>
        ) : null}
      </div>
    );
  }

  if (items.length === 0) return null;

  return (
    <div className="space-y-0.5 pl-7">
      {items.map((item) => (
        <SidebarRecentRow key={item.key} item={item} menuItems={menuItems?.(item)} />
      ))}
    </div>
  );
}
