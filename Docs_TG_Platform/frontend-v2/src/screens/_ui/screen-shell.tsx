import type { ReactNode } from "react";

type ScreenShellProps = {
  header: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
};

export function ScreenShell({ header, children, footer }: ScreenShellProps) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      {header}
      <div className="min-h-0 flex-1 overflow-auto">{children}</div>
      {footer}
    </div>
  );
}
