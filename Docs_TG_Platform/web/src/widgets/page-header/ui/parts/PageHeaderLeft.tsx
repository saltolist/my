"use client";

import PageHeaderMenuButton from "@/widgets/page-header/ui/PageHeaderMenuButton";
import type { ReactNode, RefObject } from "react";

type Props = {
  leftRef: RefObject<HTMLDivElement | null>;
  menuBtnRef: RefObject<HTMLButtonElement | null>;
  title?: ReactNode;
  left?: ReactNode;
  showTitle: boolean;
  showLeft: boolean;
};

export default function PageHeaderLeft({
  leftRef,
  menuBtnRef,
  title,
  left,
  showTitle,
  showLeft,
}: Props) {
  return (
    <div className="page-header-left" ref={leftRef}>
      <PageHeaderMenuButton ref={menuBtnRef} />
      {showTitle && title ? <h2>{title}</h2> : null}
      {showLeft ? left : null}
    </div>
  );
}
