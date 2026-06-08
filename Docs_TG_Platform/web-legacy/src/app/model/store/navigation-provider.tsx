"use client";

import { useEffect, useMemo, useReducer, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useComposer } from "@/app/model/store/composer-store";
import { useDomainActions, useDomainSelector } from "@/app/model/store/domain-store";
import {
  navigationReducer,
} from "@/app/model/store/navigation/reducer";
import { NavigationContext, type NavigationContextValue } from "@/app/model/store/navigation-store";
import { useNavDirtyGuards } from "@/app/model/store/navigation/useNavDirtyGuards";
import { useNavRoutingActions } from "@/app/model/store/navigation/useNavRoutingActions";
import { useUi } from "@/app/model/store/ui-store";
import { initialNavFromPathname } from "@/app/model/store/navigation/initialNavFromPath";

function readLocationSearch(): string {
  if (typeof window === "undefined") return "";
  return window.location.search;
}

export function NavigationProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "/";
  const {
    setMobileSidebarOpen,
    noteDirty,
    profileDirty,
    clearProfileDirtyFlags,
    clearNoteDirty,
  } = useUi();
  const domainState = useDomainSelector((s) => s);
  const { applyPatchWithTelegram, registerNavBridge } = useDomainActions();
  const composer = useComposer();
  const [navState, navDispatch] = useReducer(
    navigationReducer,
    pathname,
    (path) => initialNavFromPathname(path, readLocationSearch()),
  );

  const domainRef = useRef(domainState);
  const navRef = useRef(navState);
  domainRef.current = domainState;
  navRef.current = navState;

  useEffect(() => {
    return registerNavBridge({
      emitNavPatch: (patch) => navDispatch({ type: "SET_NAV", patch }),
      getNavState: () => navRef.current,
    });
  }, [registerNavBridge]);

  const guards = useNavDirtyGuards({ navRef, noteDirty, profileDirty });

  const routing = useNavRoutingActions({
    pathname,
    navRef,
    domainRef,
    navDispatch,
    applyPatchWithTelegram,
    setMobileSidebarOpen,
    clearProfileDirtyFlags,
    clearNoteDirty,
    canLeaveCurrentScreen: guards.canLeaveCurrentScreen,
    confirmDiscardAnyEdit: guards.confirmDiscardAnyEdit,
    discardPendingEdits: guards.discardPendingEdits,
  });

  useEffect(() => {
    return composer.registerNavBridge({
      goToHref: routing.goToHref,
      canLeaveCurrentScreen: guards.canLeaveCurrentScreen,
      getCurrentGChatId: () => navRef.current.currentGChatId,
      getCurrentPostId: () => navRef.current.currentPostId,
      getCurrentPostChatId: () => navRef.current.currentPostChatId,
      applyNavPatch: (patch) => navDispatch({ type: "SET_NAV", patch }),
    });
  }, [composer, guards.canLeaveCurrentScreen, routing.goToHref]);

  const value = useMemo<NavigationContextValue>(
    () => ({
      ...navState,
      navigate: routing.navigate,
      navigateBack: routing.navigateBack,
      navigateWithState: routing.navigateWithState,
      goToHref: routing.goToHref,
      goHome: routing.goHome,
      openPost: routing.openPost,
      setPostView: routing.setPostView,
      openPostComments: routing.openPostComments,
      openGChat: routing.openGChat,
      canLeaveCurrentScreen: guards.canLeaveCurrentScreen,
      confirmDiscardPostEdit: guards.confirmDiscardPostEdit,
      confirmDiscardAnyEdit: guards.confirmDiscardAnyEdit,
      discardPendingEdits: guards.discardPendingEdits,
      discardProfileEdits: routing.discardProfileEdits,
      registerUserMessageEdit: guards.registerUserMessageEdit,
      unregisterUserMessageEdit: guards.unregisterUserMessageEdit,
      registerNotePersist: guards.registerNotePersist,
      navDispatch,
    }),
    [guards, navState, routing, navDispatch],
  );

  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
}
