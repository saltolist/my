import type { ComponentProps } from "react";
import {
  BarChart3Icon,
  ChevronDownIcon,
  LayoutListIcon,
  MessageSquarePlusIcon,
  MessagesSquareIcon,
  PanelLeftCloseIcon,
  StickyNoteIcon,
  UserIcon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/shared/lib/utils";

const NAV_ICON_CLASS = "size-4";

function navIcon(Icon: LucideIcon) {
  return function NavIcon({ className, ...props }: ComponentProps<LucideIcon>) {
    return <Icon className={cn(NAV_ICON_CLASS, className)} {...props} />;
  };
}

export const NavIconGlobalChat = navIcon(MessageSquarePlusIcon);
export const NavIconAnalytics = navIcon(BarChart3Icon);
export const NavIconFeed = navIcon(LayoutListIcon);
export const NavIconNotes = navIcon(StickyNoteIcon);
export const NavIconChats = navIcon(MessagesSquareIcon);
export const NavIconProfile = navIcon(UserIcon);
export const NavIconCollapse = navIcon(PanelLeftCloseIcon);

export function NavIconChevron({
  expanded,
  className,
  ...props
}: ComponentProps<typeof ChevronDownIcon> & { expanded?: boolean }) {
  return (
    <ChevronDownIcon
      className={cn("size-3.5 transition-transform", expanded && "rotate-180", className)}
      {...props}
    />
  );
}
