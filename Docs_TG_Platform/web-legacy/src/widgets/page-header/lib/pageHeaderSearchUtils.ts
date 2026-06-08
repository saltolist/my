import PageHeaderSearchInput from "@/widgets/page-header/ui/PageHeaderSearchInput";
import { Children, cloneElement, isValidElement, type ReactNode } from "react";

type ElementWithChildren = { children?: ReactNode };

export function withMobileSearchClose(node: ReactNode, onClose: () => void): ReactNode {
  if (!isValidElement<ElementWithChildren>(node)) return node;
  if (node.type === PageHeaderSearchInput) {
    return cloneElement(node, { onDismiss: onClose, dismissAlways: true } as never);
  }
  if (node.props.children != null) {
    const children = Children.map(node.props.children, (child) => withMobileSearchClose(child, onClose));
    return cloneElement(node, {}, children);
  }
  return node;
}

export function findPageHeaderSearchInput(node: ReactNode): ReactNode | null {
  if (!isValidElement<ElementWithChildren>(node)) return null;
  if (node.type === PageHeaderSearchInput) return node;
  if (node.props.children == null) return null;
  for (const child of Children.toArray(node.props.children)) {
    const found = findPageHeaderSearchInput(child);
    if (found) return found;
  }
  return null;
}

export function resolveDesktopSearchToggleAnchor(
  rightColumn: HTMLElement,
  searchToggleAnchorRef: HTMLElement | null,
): HTMLElement | null {
  return (
    searchToggleAnchorRef ??
    rightColumn.querySelector<HTMLElement>(
      ".page-header-actions--desktop .page-header-search-toggle-slot, .page-header-actions--desktop .page-header-search-toggle",
    )
  );
}

/** Якорь справа: mobile — «•••» если есть, иначе правая колонка. */
export function resolveSearchSpanRightAnchor(
  rightColumn: HTMLElement,
  overflowWrap: HTMLElement | null,
  desktopPostOverlay: boolean,
): Element {
  if (desktopPostOverlay) return rightColumn;
  return overflowWrap ?? rightColumn;
}

export function measureDesktopToggleRightPx(
  rightColumn: HTMLElement,
  toggle: HTMLElement | null,
): number {

  const rightColRect = rightColumn.getBoundingClientRect();

  if (toggle) {
    const toggleRect = toggle.getBoundingClientRect();
    if (toggleRect.width > 0 && toggleRect.left >= rightColRect.left - 2) {
      return toggleRect.right;
    }
    if (toggle.offsetWidth > 0) {
      return toggleRect.left + toggle.offsetWidth;
    }
  }

  return rightColRect.left + 40;
}

export function measureSearchSpanPx(args: {
  header: HTMLElement;
  left: HTMLElement;
  rightColumn: HTMLElement;
  rightAnchor: Element;
  padL: number;
  padR: number;
  desktopPostOverlay: boolean;
  searchToggleAnchor?: HTMLElement | null;
}): { left: number; right: number } {
  const {
    header,
    left,
    rightColumn,
    rightAnchor,
    padL,
    padR,
    desktopPostOverlay,
    searchToggleAnchor,
  } = args;
  const headerRect = header.getBoundingClientRect();
  const headerStyle = getComputedStyle(header);
  const borderR = parseFloat(headerStyle.borderRightWidth) || 0;
  const innerRight = headerRect.right - borderR - padR;
  const leftRect = left.getBoundingClientRect();
  const rightRect = rightAnchor.getBoundingClientRect();

  const spanLeft = leftRect.right - headerRect.left - padL;

  if (desktopPostOverlay) {
    const toggleRight = measureDesktopToggleRightPx(rightColumn, searchToggleAnchor ?? null);
    return {
      left: leftRect.width < 1 ? 0 : spanLeft,
      right: Math.max(0, innerRight - toggleRight),
    };
  }

  return {
    left: spanLeft,
    right: innerRight - rightRect.left,
  };
}
