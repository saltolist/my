"use client";

import {
  SidebarRecentRow,
  type SidebarRecentRowItem,
} from "@/widgets/sidebar/ui/sidebar-recent-row";
import { SidebarRecentSection } from "@/widgets/sidebar/ui/sidebar-recent-section";

type SidebarRecentListProps = {
  items: SidebarRecentRowItem[];
  grouped?: {
    thisPost: SidebarRecentRowItem[];
    others: SidebarRecentRowItem[];
  };
  menuItems?: (item: SidebarRecentRowItem) => { label: string; onClick: () => void }[];
};

export function SidebarRecentList({ items, grouped, menuItems }: SidebarRecentListProps) {
  if (grouped) {
    return (
      <div className="space-y-2 pl-7">
        {grouped.thisPost.length > 0 ? (
          <SidebarRecentSection title="Этот пост">
            {grouped.thisPost.map((item) => (
              <SidebarRecentRow
                key={item.key}
                item={item}
                menuItems={menuItems?.(item)}
              />
            ))}
          </SidebarRecentSection>
        ) : null}
        {grouped.others.length > 0 ? (
          <SidebarRecentSection title="Остальные">
            {grouped.others.map((item) => (
              <SidebarRecentRow
                key={item.key}
                item={item}
                menuItems={menuItems?.(item)}
              />
            ))}
          </SidebarRecentSection>
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
