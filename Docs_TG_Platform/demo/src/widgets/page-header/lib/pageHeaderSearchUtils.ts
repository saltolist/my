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
