"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
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
import { useComposer } from "@/app/model/store/composer-store";
import { useDomain } from "@/app/model/store/domain-store";
import type { DomainState } from "@/app/model/store/domain/types";
import { processCombinedPatch } from "@/app/model/store/navigation/buildPatch";
import {
  initialNavigationState,
  navigationReducer,
} from "@/app/model/store/navigation/reducer";
import type { NavigationState } from "@/app/model/store/navigation/types";
import { NavigationContext, type NavigationContextValue } from "@/app/model/store/navigation-store";
import { useUi } from "@/app/model/store/ui-store";
import type { PostMode, ScreenId } from "@/shared/types";

const POST_EDIT_LEAVE_MSG =
  "Вы редактируете пост. Покинуть страницу без сохранения?";
const USER_MSG_EDIT_LEAVE_MSG =
  "Вы редактируете сообщение. Покинуть без сохранения?";

type UserMessageEditSession = { discard: () => void };

type CombinedPatch = Partial<NavigationState & DomainState>;

export function NavigationProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const {
    setMobileSidebarOpen,
    noteDirty,
    profileDirty,
    clearProfileDirtyFlags,
    clearNoteDirty,
  } = useUi();
  const {
    state: domainState,
    applyPatchWithTelegram,
    registerNavBridge,
  } = useDomain();
  const composer = useComposer();
  const [navState, navDispatch] = useReducer(navigationReducer, initialNavigationState);

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
    [applyPatchWithTelegram],
  );

  const notePersistRef = useRef<(() => void) | null>(null);
  const userMessageEditRef = useRef<UserMessageEditSession | null>(null);

  const registerNotePersist = useCallback((fn: (() => void) | null) => {
    notePersistRef.current = fn;
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
    [noteDirty, profileDirty],
  );

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

  const confirmDiscardPostEdit = useCallback((): boolean => {
    const nav = navRef.current;
    if (nav.screen === "post" && nav.isEditing) {
      if (!window.confirm(POST_EDIT_LEAVE_MSG)) return false;
    }
    return true;
  }, []);

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

  const discardProfileEdits = useCallback(() => {
    applyPatchWithTelegram(buildProfileDiscardPatch(domainRef.current));
    clearProfileDirtyFlags();
  }, [applyPatchWithTelegram, clearProfileDirtyFlags]);

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
    [applyCombinedPatch, clearProfileDirtyFlags, clearNoteDirty],
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
    [goToHref, pathname],
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
      router,
      setMobileSidebarOpen,
    ],
  );

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
  }, [noteDirty, profileDirty]);

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
    [confirmDiscardAnyEdit, discardPendingEdits],
  );

  const openPostComments = useCallback(
    (id: number) => {
      const cur = navRef.current;
      if (cur.screen !== "post" || cur.currentPostId !== id) {
        if (!goToHref(routes.post(id))) return;
      }
      setPostView("comments", null);
    },
    [goToHref, setPostView],
  );

  const openGChat = useCallback(
    (id: string) => {
      goToHref(routes.gchat(id));
    },
    [goToHref],
  );

  useEffect(() => {
    return composer.registerNavBridge({
      goToHref,
      canLeaveCurrentScreen,
      getCurrentGChatId: () => navRef.current.currentGChatId,
      getCurrentPostId: () => navRef.current.currentPostId,
      getCurrentPostChatId: () => navRef.current.currentPostChatId,
      applyNavPatch: (patch) => navDispatch({ type: "SET_NAV", patch }),
    });
  }, [composer, goToHref, canLeaveCurrentScreen]);

  const value = useMemo<NavigationContextValue>(
    () => ({
      ...navState,
      navigate,
      navigateBack,
      navigateWithState,
      goToHref,
      goHome,
      openPost,
      setPostView,
      openPostComments,
      openGChat,
      canLeaveCurrentScreen,
      confirmDiscardPostEdit,
      confirmDiscardAnyEdit,
      discardPendingEdits,
      discardProfileEdits,
      registerUserMessageEdit,
      unregisterUserMessageEdit,
      registerNotePersist,
      navDispatch,
    }),
    [
      navState,
      navigate,
      navigateBack,
      navigateWithState,
      goToHref,
      goHome,
      openPost,
      setPostView,
      openPostComments,
      openGChat,
      canLeaveCurrentScreen,
      confirmDiscardPostEdit,
      confirmDiscardAnyEdit,
      discardPendingEdits,
      discardProfileEdits,
      registerUserMessageEdit,
      unregisterUserMessageEdit,
      registerNotePersist,
    ],
  );

  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
}
