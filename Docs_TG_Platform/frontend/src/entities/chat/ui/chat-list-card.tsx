import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { cn } from "@/shared/lib/utils";

export type ChatListCardProps = {
  title: string;
  preview: string;
  date: string;
  href: string;
  /** Post title for local chats */
  subtitle?: string;
  className?: string;
};

export function ChatListCard({
  title,
  preview,
  date,
  href,
  subtitle,
  className,
}: ChatListCardProps) {
  const displayTitle = title || "Без названия";
  const displayPreview = preview || "Нет сообщений";

  return (
    <Link href={href} className="block">
      <Card className={cn("transition-colors hover:bg-muted/40", className)}>
        <CardHeader className="pb-2">
          <CardTitle className="line-clamp-1 text-base">{displayTitle}</CardTitle>
          {subtitle ? (
            <CardDescription className="line-clamp-1 text-xs">{subtitle}</CardDescription>
          ) : null}
          <CardDescription className="line-clamp-2">{displayPreview}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">{date}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
