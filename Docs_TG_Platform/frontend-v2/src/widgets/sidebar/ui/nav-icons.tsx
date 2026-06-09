import { BarChart3, ChevronDown, MessageSquare, Newspaper, Plus, StickyNote, UserRound } from "lucide-react";

import { cn } from "@/shared/lib/utils";

export function NavIconGlobalChat() {
  return <Plus className="size-[18px]" strokeWidth={2} />;
}

export function NavIconAnalytics() {
  return <BarChart3 className="size-[18px]" strokeWidth={2} />;
}

export function NavIconFeed() {
  return <Newspaper className="size-[18px]" strokeWidth={2} />;
}

export function NavIconNotes() {
  return <StickyNote className="size-[18px]" strokeWidth={2} />;
}

export function NavIconChats() {
  return <MessageSquare className="size-[18px]" strokeWidth={2} />;
}

export function NavIconProfile() {
  return <UserRound className="size-[18px]" strokeWidth={2} />;
}

export function NavIconChevron({ expanded }: { expanded: boolean }) {
  return (
    <ChevronDown
      className={cn("size-3.5 transition-transform", expanded && "rotate-180")}
      aria-hidden
    />
  );
}
