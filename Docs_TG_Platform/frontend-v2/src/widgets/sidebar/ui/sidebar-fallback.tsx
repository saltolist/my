import { cn } from "@/shared/lib/utils";

type SidebarFallbackProps = {
  className?: string;
};

export function SidebarFallback({ className }: SidebarFallbackProps) {
  return (
    <aside
      className={cn(
        "glass-sidebar flex h-full w-[15.5rem] flex-col border-r border-sidebar-border bg-sidebar",
        className,
      )}
    />
  );
}
