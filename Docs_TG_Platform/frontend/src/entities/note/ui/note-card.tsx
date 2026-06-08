import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { NoteAiToggle } from "@/entities/note/ui/note-ai-toggle";
import { cn } from "@/shared/lib/utils";

type NoteCardBase = {
  title: string;
  body: string;
  date: string;
  ai: boolean;
  onToggleAi?: () => void;
  className?: string;
};

type NoteCardGlobalProps = NoteCardBase & {
  variant: "global";
  href: string;
};

type NoteCardLocalProps = NoteCardBase & {
  variant: "local";
};

export type NoteCardProps = NoteCardGlobalProps | NoteCardLocalProps;

export function NoteCard(props: NoteCardProps) {
  const { title, body, date, ai, onToggleAi, className } = props;
  const displayTitle = title || "Без названия";
  const displayBody = body || (props.variant === "global" ? "Пустая заметка" : "");

  if (props.variant === "global") {
    return (
      <Card className={cn("transition-colors hover:bg-muted/40", className)}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <Link href={props.href} className="min-w-0 flex-1">
              <CardTitle className="line-clamp-1 text-base hover:underline">
                {displayTitle}
              </CardTitle>
              <CardDescription className="mt-1 line-clamp-3 whitespace-pre-wrap">
                {displayBody}
              </CardDescription>
            </Link>
            {onToggleAi ? (
              <NoteAiToggle variant="switch" ai={ai} onToggle={onToggleAi} />
            ) : null}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">{date}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card size="sm" className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm">{displayTitle}</CardTitle>
          {onToggleAi ? (
            <NoteAiToggle variant="badge" ai={ai} onToggle={onToggleAi} />
          ) : null}
        </div>
        <p className="text-xs text-muted-foreground">{date}</p>
      </CardHeader>
      <CardContent>
        <p className="line-clamp-4 text-sm whitespace-pre-wrap">{displayBody}</p>
      </CardContent>
    </Card>
  );
}
