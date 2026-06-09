import type { ReactNode } from "react";

export type PageHeaderCenterProps = {
  children?: ReactNode;
};

export function PageHeaderCenter({ children }: PageHeaderCenterProps) {
  if (!children) return <div aria-hidden />;

  return <div className="flex items-center justify-center">{children}</div>;
}
