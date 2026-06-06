"use client";

import { useCallback, type RefObject } from "react";
import { useRouter } from "next/navigation";
import { resolvePostViewMode } from "@/shared/lib/postView";
import {
  getParentPath,
  routes,
  screenFromPath,
  screenToHref,
  statePatchToHref,
} from "@/shared/lib/routes";
import { POST_NEW_SLUG } from "@/shared/lib/staticParams";
import { buildProfileDiscardPatch } from "@/shared/lib/profileDiscard";
import type { DomainState } from "@/app/model/store/domain/types";
import type { CombinedPatch } from "@/app/model/store/navigation/types.shared";
import { processCombinedPatch } from "@/app/model/store/navigation/buildPatch";
import type { NavigationState } from "@/app/model/store/navigation/types";
import type { PostMode, ScreenId } from "@/shared/types";

type NavDispatch = (action: { type: "SET_NAV"; patch: Partial<NavigationState> }) => void;

type Params = {
  pathname: string;
  navRef: RefObject<NavigationState>;
  domainRef: RefObject<DomainState>;
  navDispatch: NavDispatch;
  applyPatchWithTelegram: (patch: Partial<DomainState>) => void;
  setMobileSidebarOpen: (open: boolean) => void;
  clearProfileDirtyFlags: () => void;
  clearNoteDirty: () => void;
  canLeaveCurrentScreen: (next: ScreenId) => boolean;
  confirmDiscardAnyEdit: () => boolean;
  discardPendingEdits: () => void;
};

export function useNavRoutingActions({
  pathname,
  navRef,
  domainRef,
  navDispatch,
  applyPatchWithTelegram,
  setMobileSidebarOpen,
  clearProfileDirtyFlags,
  clearNoteDirty,
  canLeaveCurrentScreen,
  confirmDiscardAnyEdit,
  discardPendingEdits,
}: Params) {
  const router = useRouter();

  const applyCombinedPatch = useCallback(
    (patch: CombinedPatch) => {
      const { domainPatch, navPatch } = processCombinedPatch(
        navRef.current,
        domainRef.current,
        patch as Record<string, unknown>,
      );
      applyPatchWithTelegram(domainPatch);
      if (Object.keys(navPatch).length) {
        navDispatch({ type: "SET_NAV", patch: navPatch });
      }
    },
    [applyPatchWithTelegram, domainRef, navDispatch, navRef],
  );

  const commitNavigationPatch = useCallback(
    (patch: CombinedPatch) => {
      const cur = navRef.current;
      const nextScreen = patch.screen ?? cur.screen;
      const leavingProfile = cur.screen === "profile" && nextScreen !== "profile";
      const leavingNote = cur.screen === "note" && nextScreen !== "note";
      applyCombinedPatch(patch);
      if (leavingProfile) clearProfileDirtyFlags();
      if (leavingNote) clearNoteDirty();
    },
    [applyCombinedPatch, clearNoteDirty, clearProfileDirtyFlags, navRef],
  );

  const goToHref = useCallback(
    (href: string, opts?: { replace?: boolean }): boolean => {
      const pathOnly = href.split("?")[0] ?? href;
      const nextScreen = screenFromPath(pathOnly);
      if (!canLeaveCurrentScreen(nextScreen)) return false;
      setMobileSidebarOpen(false);
      discardPendingEdits();
      if (opts?.replace) router.replace(href);
      else router.push(href);
      return true;
    },
    [canLeaveCurrentScreen, discardPendingEdits, router, setMobileSidebarOpen],
  );

  const navigate = useCallback(
    (screen: ScreenId, opts?: { skipHistory?: boolean; clearHistory?: boolean }) => {
      void opts?.clearHistory;
      const href = screenToHref(screen);
      const curPath = pathname.endsWith("/") ? pathname : `${pathname}/`;
      if (href === curPath && screen === navRef.current.screen) return;
      goToHref(href, { replace: opts?.skipHistory });
    },
    [goToHref, navRef, pathname],
  );

  const navigateBack = useCallback(
    (fallback?: ScreenId) => {
      if (!confirmDiscardAnyEdit()) return;
      discardPendingEdits();
      setMobileSidebarOpen(false);
      if (typeof window !== "undefined" && window.history.length > 1) {
        router.back();
        return;
      }
      const parent = getParentPath(pathname);
      if (parent) {
        router.push(parent);
        return;
      }
      const to = screenToHref(fallback ?? "home");
      if (!canLeaveCurrentScreen(fallback ?? "home")) return;
      router.push(to);
    },
    [
      canLeaveCurrentScreen,
      confirmDiscardAnyEdit,
      discardPendingEdits,
      pathname,
      router,
      setMobileSidebarOpen,
    ],
  );

  const navigateWithState = useCallback(
    (patch: CombinedPatch) => {
      const nextScreen = patch.screen ?? navRef.current.screen;
      if (!canLeaveCurrentScreen(nextScreen)) return;
      const href = statePatchToHref(patch, navRef.current);
      const routeOnly =
        patch.screen != null ||
        patch.currentPostId != null ||
        patch.currentGChatId != null ||
        patch.postMode != null ||
        patch.currentNote != null;
      if (!href || !routeOnly) {
        setMobileSidebarOpen(false);
        discardPendingEdits();
        commitNavigationPatch(patch);
        return;
      }
      setMobileSidebarOpen(false);
      discardPendingEdits();
      router.push(href);
    },
    [
      canLeaveCurrentScreen,
      commitNavigationPatch,
      discardPendingEdits,
      navRef,
      router,
      setMobileSidebarOpen,
    ],
  );

  const goHome = useCallback(() => navigate("home"), [navigate]);

  const openPost = useCallback(
    (id: number | "new") => {
      const href = id === "new" ? routes.post(POST_NEW_SLUG) : routes.post(id);
      goToHref(href);
    },
    [goToHref],
  );

  const setPostView = useCallback(
    (nextMode: PostMode, nextChatId: number | null = null) => {
      if (!confirmDiscardAnyEdit()) return;
      discardPendingEdits();
      const cur = navRef.current;
      const postMode = resolvePostViewMode(cur.postMode, nextMode);
      let chatId: number | null = null;
      if (postMode === "chat") {
        chatId = nextMode === "chat" ? nextChatId : cur.currentPostChatId;
      }
      navDispatch({
        type: "SET_NAV",
        patch: {
          screen: "post",
          postMode,
          currentPostChatId: chatId,
          postViewStack: [],
          isEditing: false,
        },
      });
    },
    [confirmDiscardAnyEdit, discardPendingEdits, navDispatch, navRef],
  );

  const openPostComments = useCallback(
    (id: number) => {
      const cur = navRef.current;
      if (cur.screen !== "post" || cur.currentPostId !== id) {
        if (!goToHref(routes.post(id))) return;
      }
      setPostView("comments", null);
    },
    [goToHref, navRef, setPostView],
  );

  const openGChat = useCallback(
    (id: string) => {
      goToHref(routes.gchat(id));
    },
    [goToHref],
  );

  const discardProfileEdits = useCallback(() => {
    applyPatchWithTelegram(buildProfileDiscardPatch(domainRef.current));
    clearProfileDirtyFlags();
  }, [applyPatchWithTelegram, clearProfileDirtyFlags, domainRef]);

  return {
    navigate,
    navigateBack,
    navigateWithState,
    goToHref,
    goHome,
    openPost,
    setPostView,
    openPostComments,
    openGChat,
    discardProfileEdits,
  };
}
