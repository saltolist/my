import type { ReactNode } from "react";

type SidebarRecentSectionProps = {
  title?: string;
  children: ReactNode;
};

export function SidebarRecentSection({ title, children }: SidebarRecentSectionProps) {
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
