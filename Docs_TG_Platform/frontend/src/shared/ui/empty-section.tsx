import { cn } from "@/shared/lib/utils";

type EmptySectionProps = {
  message: string;
  className?: string;
};

export function EmptySection({ message, className }: EmptySectionProps) {
  return <p className={cn("text-sm text-muted-foreground", className)}>{message}</p>;
}
