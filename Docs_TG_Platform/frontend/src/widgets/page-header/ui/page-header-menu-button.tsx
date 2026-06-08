import {
  ContextMenuButton,
  type ContextMenuItem,
} from "@/shared/ui/context-menu-button";

export type PageHeaderMenuButtonProps = {
  items: ContextMenuItem[];
  "aria-label"?: string;
};

export function PageHeaderMenuButton({
  items,
  "aria-label": ariaLabel = "Меню",
}: PageHeaderMenuButtonProps) {
  return <ContextMenuButton items={items} aria-label={ariaLabel} />;
}
