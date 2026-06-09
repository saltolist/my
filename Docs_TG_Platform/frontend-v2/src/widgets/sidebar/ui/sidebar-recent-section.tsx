import type { ReactNode } from "react";

type SidebarRecentSectionProps = {
  title: string;
  children: ReactNode;
};

export function SidebarRecentSection({ title, children }: SidebarRecentSectionProps) {
  return (
    <div className="space-y-0.5">
      <p className="px-2 text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      {children}
    </div>
  );
}
