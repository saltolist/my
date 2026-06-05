"use client";

import type { ReactNode } from "react";

type Props = {
  id: string;
  label: string;
  icon: ReactNode;
  active: boolean;
  onClick: () => void;
};

export default function NavItem({ id, label, icon, active, onClick }: Props) {
  return (
    <div id={`nav-${id}`} className={`nav-item${active ? " active" : ""}`} onClick={onClick}>
      <span className="nav-icon">{icon}</span>
      <span className="nav-label">{label}</span>
    </div>
  );
}
