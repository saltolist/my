"use client";

import { createPortal } from "react-dom";
import { FLOATING_PANEL_EDGE_MARGIN_PX } from "@/shared/lib/floatingPanel";
import ContextMenuItems from "../ContextMenuItems";
import type { ContextMenuProps } from "../contextMenuTypes";
import { useContextMenu } from "../model/useContextMenu";

export type { CtxMenuItem } from "../contextMenuTypes";

export function ContextMenu({
  items,
  trigger = "•••",
  dropdownClassName = "",
  triggerAriaLabel,
  ...rest
}: ContextMenuProps) {
  const menu = useContextMenu({ items, dropdownClassName, ...rest });

  return (
    <div ref={menu.wrapRef} className={menu.wrapClass || undefined}>
      <button
        ref={menu.btnRef}
        className={menu.triggerBtnClass}
        type="button"
        aria-label={triggerAriaLabel}
        aria-haspopup="menu"
        aria-expanded={menu.open}
        onClick={menu.onTriggerClick}
      >
        {trigger}
      </button>
      {rest.portal && menu.open && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={menu.dropdownRef}
              className={`ctx-dropdown ctx-dropdown-portal open${dropdownClassName ? ` ${dropdownClassName}` : ""}`}
              style={{
                position: "fixed",
                top: menu.panelStyle.top,
                left: menu.panelStyle.left,
                right: "auto",
                minWidth: menu.panelStyle.minWidth,
                width: menu.panelStyle.width,
                maxWidth: menu.matchTriggerWidth
                  ? menu.panelStyle.width
                  : `min(280px, calc(100vw - ${FLOATING_PANEL_EDGE_MARGIN_PX * 2}px))`,
                zIndex: 2000,
                visibility: menu.panelStyle.visible ? "visible" : "hidden",
                pointerEvents: menu.panelStyle.visible ? "auto" : "none",
              }}
            >
              <ContextMenuItems items={items} onSelect={menu.onItemSelect} />
            </div>,
            document.body,
          )
        : null}
      {!rest.portal ? (
        <div
          ref={menu.dropdownRef}
          className={`ctx-dropdown${dropdownClassName ? ` ${dropdownClassName}` : ""}${menu.open ? " open" : ""}`}
          style={menu.align === "left" ? { left: 0, right: "auto" } : undefined}
        >
          <ContextMenuItems items={items} onSelect={menu.onItemSelect} />
        </div>
      ) : null}
    </div>
  );
}
