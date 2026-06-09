import type { ReactNode } from "react";

type ScreenShellProps = {
  header: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
};

export function ScreenShell({ header, children, footer }: ScreenShellProps) {
  return (
    <>
      {header}
      <div className="screen-body">{children}</div>
      {footer}
    </>
  );
}
