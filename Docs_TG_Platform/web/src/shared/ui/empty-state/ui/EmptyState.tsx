"use client";

import type { ReactNode } from "react";

type Props = {
  icon?: ReactNode;
  message: ReactNode;
  action?: ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

export default function EmptyState({ icon, message, action, className, style }: Props) {
  return (
    <div className={className ? `empty ${className}` : "empty"} style={style}>
      {icon != null ? <div className="eico">{icon}</div> : null}
      <p>{message}</p>
      {action}
    </div>
  );
}
