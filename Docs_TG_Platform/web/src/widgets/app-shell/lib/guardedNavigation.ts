"use client";

import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

import { useNavigationStore } from "@/app/model/store/navigation-store";
import { useUiStore } from "@/app/model/store";
import { confirmLeaveNote } from "@/shared/lib/noteLeave";
import { screenFromPath } from "@/shared/lib/routes";

/** Confirm leaving a dirty note screen. Clears noteDirty on success. */
export async function confirmNoteScreenLeave(): Promise<boolean> {
  if (typeof window === "undefined") return true;
  const pathname = window.location.pathname || "/";
  if (screenFromPath(pathname) !== "note") return true;

  const note = useNavigationStore.getState().currentNote;
  const noteDirty = useUiStore.getState().noteDirty;
  if (!(await confirmLeaveNote(note, noteDirty))) return false;
  useUiStore.getState().setNoteDirty(false);
  return true;
}

export async function guardedPush(
  router: AppRouterInstance,
  href: string,
  options?: { replace?: boolean },
): Promise<boolean> {
  if (!(await confirmNoteScreenLeave())) return false;
  if (options?.replace) router.replace(href);
  else router.push(href);
  return true;
}
