"use client";

import { useCallback, useEffect, useRef } from "react";
import type { RefObject } from "react";
import {
  POST_EDIT_LEAVE_MSG,
  USER_MSG_EDIT_LEAVE_MSG,
  type UserMessageEditSession,
} from "@/app/model/store/navigation/types.shared";
import type { NavigationState } from "@/app/model/store/navigation/types";
import type { ScreenId } from "@/shared/types";

type Params = {
  navRef: RefObject<NavigationState>;
  noteDirty: boolean;
  profileDirty: boolean;
};

export function useNavDirtyGuards({ navRef, noteDirty, profileDirty }: Params) {
  const notePersistRef = useRef<(() => void) | null>(null);
  const userMessageEditRef = useRef<UserMessageEditSession | null>(null);

  const registerNotePersist = useCallback((fn: (() => void) | null) => {
    notePersistRef.current = fn;
  }, []);

  const discardUserMessageEditSession = useCallback(() => {
    const session = userMessageEditRef.current;
    if (!session) return;
    session.discard();
    userMessageEditRef.current = null;
  }, []);

  const registerUserMessageEdit = useCallback((discard: () => void) => {
    userMessageEditRef.current = { discard };
  }, []);

  const unregisterUserMessageEdit = useCallback((discard: () => void) => {
    if (userMessageEditRef.current?.discard === discard) {
      userMessageEditRef.current = null;
    }
  }, []);

  const canLeaveCurrentScreen = useCallback(
    (next: ScreenId): boolean => {
      const nav = navRef.current;
      if (nav.screen === "note" && next !== "note") {
        if (nav.currentNote?.isNew) {
          if (noteDirty) notePersistRef.current?.();
          return true;
        }
        if (noteDirty) {
          return window.confirm(
            "У вас есть несохранённые изменения в заметке. Покинуть страницу без сохранения?",
          );
        }
      }
      if (nav.screen === "profile" && next !== "profile" && profileDirty) {
        return window.confirm(
          "Есть несохранённые изменения в профиле. Уйти без сохранения?",
        );
      }
      if (nav.screen === "post" && nav.isEditing && next !== "post") {
        if (!window.confirm(POST_EDIT_LEAVE_MSG)) return false;
      }
      if (userMessageEditRef.current) {
        if (!window.confirm(USER_MSG_EDIT_LEAVE_MSG)) return false;
      }
      return true;
    },
    [navRef, noteDirty, profileDirty],
  );

  const confirmDiscardPostEdit = useCallback((): boolean => {
    const nav = navRef.current;
    if (nav.screen === "post" && nav.isEditing) {
      if (!window.confirm(POST_EDIT_LEAVE_MSG)) return false;
    }
    return true;
  }, [navRef]);

  const confirmDiscardUserMessageEdit = useCallback((): boolean => {
    if (!userMessageEditRef.current) return true;
    if (!window.confirm(USER_MSG_EDIT_LEAVE_MSG)) return false;
    return true;
  }, []);

  const confirmDiscardAnyEdit = useCallback((): boolean => {
    if (!confirmDiscardPostEdit()) return false;
    if (!confirmDiscardUserMessageEdit()) return false;
    return true;
  }, [confirmDiscardPostEdit, confirmDiscardUserMessageEdit]);

  const discardPendingEdits = useCallback(() => {
    discardUserMessageEditSession();
  }, [discardUserMessageEditSession]);

  useEffect(() => {
    function onBeforeUnload(e: BeforeUnloadEvent) {
      const nav = navRef.current;
      const postEditing = nav.screen === "post" && nav.isEditing;
      const msgEditing = !!userMessageEditRef.current;
      if (!noteDirty && !profileDirty && !postEditing && !msgEditing) return;
      e.preventDefault();
      e.returnValue = "";
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [navRef, noteDirty, profileDirty]);

  return {
    canLeaveCurrentScreen,
    confirmDiscardPostEdit,
    confirmDiscardAnyEdit,
    discardPendingEdits,
    registerUserMessageEdit,
    unregisterUserMessageEdit,
    registerNotePersist,
  };
}
