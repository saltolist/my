"use client";

import { Check, Clock, Pencil } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import type { Post } from "@/shared/types";
import { cn } from "@/shared/lib/utils";

type PostStatusProps = Pick<Post, "status" | "date" | "created">;

const statusConfig = {
  published: {
    label: "Опубликован",
    icon: Check,
    className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  },
  scheduled: {
    label: "Отложено",
    icon: Clock,
    className: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  },
  draft: {
    label: "Черновик",
    icon: Pencil,
    className: "bg-muted text-muted-foreground",
  },
} as const;

export function PostStatusBadge({ post }: { post: PostStatusProps }) {
  const config = statusConfig[post.status];
  const Icon = config.icon;
  const time =
    post.status === "draft"
      ? post.created
        ? `создан ${post.created}`
        : undefined
      : post.date;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Badge variant="secondary" className={cn("gap-1", config.className)}>
        <Icon className="size-3" />
        {config.label}
      </Badge>
      {time ? <span className="text-xs text-muted-foreground">{time}</span> : null}
    </div>
  );
}
