import { cn } from "@/shared/lib/utils";
import { Skeleton } from "@/shared/ui/skeleton";

type SidebarFallbackProps = {
  className?: string;
};

export function SidebarFallback({ className }: SidebarFallbackProps) {
  return (
    <aside
      className={cn(
        "flex h-full w-[15.5rem] flex-col gap-2 border-r border-sidebar-border bg-sidebar p-3",
        className,
      )}
    >
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-full" />
    </aside>
  );
}
