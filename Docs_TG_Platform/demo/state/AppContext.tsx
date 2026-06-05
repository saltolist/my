"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { resolvePostViewMode } from "@/lib/postView";
import {
  getParentPath,
  routes,
  screenFromPath,
  screenToHref,
  statePatchToHref,
} from "@/lib/routes";
import { POST_NEW_SLUG } from "@/lib/staticParams";
import { buildProfileDiscardPatch } from "@/lib/profileDiscard";
import { useComposer } from "@/state/composer-store";
import { useDomain } from "@/state/domain-store";
import type { DomainState } from "@/state/domain/types";
import {
  processCombinedPatch,
} from "@/state/navigation/buildPatch";
import {
  initialNavigationState,
  navigationReducer,
} from "@/state/navigation/reducer";
import type { NavigationState } from "@/state/navigation/types";
import { NavigationContext, type NavigationContextValue } from "@/state/navigation-store";
import { useUi } from "@/state/ui-store";
import type {
  ComposerScope,
  NoteFile,
  PostMode,
  ScreenId,
} from "@/lib/types";

type State = DomainState & NavigationState;

type LegacyAction =
  | { type: "SET_SCREEN"; screen: ScreenId }
  | { type: "SET_STATE"; patch: Partial<State> };

type Action = LegacyAction | import("@/state/domain-store").DomainDispatchAction;

export type { DirtyKey } from "@/state/ui-store";

const POST_EDIT_LEAVE_MSG =
  "Вы редактируете пост. Покинуть страницу без сохранения?";
const USER_MSG_EDIT_LEAVE_MSG =
  "Вы редактируете сообщение. Покинуть без сохранения?";

type UserMessageEditSession = { discard: () => void };

type AppContextValue = {
  state: State;
  dispatch: React.Dispatch<Action>;

  navigate: (screen: ScreenId, opts?: { skipHistory?: boolean; clearHistory?: boolean }) => void;
  navigateBack: (fallback?: ScreenId) => void;
  navigateWithState: (patch: Partial<State>) => void;
  /** Переход по URL (с проверкой несохранённых правок). */
  goToHref: (href: string, opts?: { replace?: boolean }) => boolean;
  goHome: () => void;
  openPost: (id: number | "new") => void;
  /** Вкладки поста (заметки / чаты / комментарии) без смены URL. */
  setPostView: (mode: PostMode, chatId?: number | null) => void;
  openPostComments: (id: number) => void;
  openGChat: (id: string) => void;
  sendHome: (text: string) => boolean;
  sendGChat: (text: string) => boolean;
  sendPost: (text: string) => boolean;
  hasLlmForSend: (scope: ComposerScope) => boolean;
  setComposerLlm: (scope: ComposerScope, llmId: string) => void;
  setComposerWeb: (scope: ComposerScope, webId: string) => void;
  multiResponsePairs: () => { id: string; llmId: string; webId: string; label: string }[];
  llmLabel: (id: string) => string;
  webLabel: (id: string) => string;

  registerNotePersist: (fn: (() => void) | null) => void;
  canLeaveCurrentScreen: (next: ScreenId) => boolean;
  /** Подтверждение ухода из режима редактирования поста (вкладки и стек внутри поста). */
  confirmDiscardPostEdit: () => boolean;
  registerUserMessageEdit: (discard: () => void) => void;
  unregisterUserMessageEdit: (discard: () => void) => void;
  /** Пост и/или сообщение: подтверждение без сброса (сброс — discardPendingEdits). */
  confirmDiscardAnyEdit: () => boolean;
  discardPendingEdits: () => void;
  /** Сброс несохранённых правок профиля к последним сохранённым снимкам. */
  discardProfileEdits: () => void;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
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
    dispatch: domainDispatch,
    applyPatchWithTelegram,
    registerNavBridge,
  } = useDomain();
  const composer = useComposer();
  const [navState, navDispatchBase] = useReducer(navigationReducer, initialNavigationState);

  const domainRef = useRef(domainState);
  const navRef = useRef(navState);
  domainRef.current = domainState;
  navRef.current = navState;

  useEffect(() => {
    return registerNavBridge({
      emitNavPatch: (patch) => navDispatchBase({ type: "SET_NAV", patch }),
      getNavState: () => navRef.current,
    });
  }, [registerNavBridge]);

  const state = useMemo<State>(
    () => ({ ...domainState, ...navState }),
    [domainState, navState],
  );
  const stateRef = useRef(state);
  stateRef.current = state;

  const applyCombinedPatch = useCallback(
    (patch: Partial<State>) => {
      const { domainPatch, navPatch } = processCombinedPatch(
        navRef.current,
        domainRef.current,
        patch as Record<string, unknown>,
      );
      applyPatchWithTelegram(domainPatch);
      if (Object.keys(navPatch).length) {
        navDispatchBase({ type: "SET_NAV", patch: navPatch });
      }
    },
    [applyPatchWithTelegram],
  );

  const dispatch = useCallback(
    (action: Action) => {
      if (action.type === "SET_STATE") {
        applyCombinedPatch(action.patch);
        return;
      }
      if (action.type === "SET_SCREEN") {
        navDispatchBase({ type: "SET_SCREEN", screen: action.screen });
        return;
      }
      domainDispatch(action);
    },
    [applyCombinedPatch, domainDispatch],
  );

  const notePersistRef = useRef<(() => void) | null>(null);
  const userMessageEditRef = useRef<UserMessageEditSession | null>(null);

  const registerNotePersist = useCallback((fn: (() => void) | null) => {
    notePersistRef.current = fn;
  }, []);

  const canLeaveCurrentScreen = useCallback(
    (next: ScreenId): boolean => {
      if (state.screen === "note" && next !== "note") {
        if (state.currentNote?.isNew) {
          if (noteDirty) notePersistRef.current?.();
          return true;
        }
        if (noteDirty) {
          return window.confirm(
            "У вас есть несохранённые изменения в заметке. Покинуть страницу без сохранения?",
          );
        }
      }
      if (state.screen === "profile" && next !== "profile" && profileDirty) {
        return window.confirm(
          "Есть несохранённые изменения в профиле. Уйти без сохранения?",
        );
      }
      if (state.screen === "post" && state.isEditing && next !== "post") {
        if (!window.confirm(POST_EDIT_LEAVE_MSG)) return false;
      }
      if (userMessageEditRef.current) {
        if (!window.confirm(USER_MSG_EDIT_LEAVE_MSG)) return false;
      }
      return true;
    },
    [state.screen, state.currentNote, noteDirty, profileDirty, state.isEditing],
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
    const cur = stateRef.current;
    if (cur.screen === "post" && cur.isEditing) {
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
    (patch: Partial<State>) => {
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
    [canLeaveCurrentScreen, discardPendingEdits, router],
  );

  const navigate = useCallback(
    (screen: ScreenId, opts?: { skipHistory?: boolean; clearHistory?: boolean }) => {
      void opts?.clearHistory;
      const href = screenToHref(screen);
      const curPath = pathname.endsWith("/") ? pathname : `${pathname}/`;
      if (href === curPath && screen === stateRef.current.screen) return;
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
    ],
  );

  const navigateWithState = useCallback(
    (patch: Partial<State>) => {
      const nextScreen = patch.screen ?? stateRef.current.screen;
      if (!canLeaveCurrentScreen(nextScreen)) return;
      const href = statePatchToHref(patch, stateRef.current);
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
    [canLeaveCurrentScreen, commitNavigationPatch, discardPendingEdits, router],
  );

  useEffect(() => {
    function onBeforeUnload(e: BeforeUnloadEvent) {
      const postEditing = stateRef.current.screen === "post" && stateRef.current.isEditing;
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
      const cur = stateRef.current;
      const postMode = resolvePostViewMode(cur.postMode, nextMode);
      let chatId: number | null = null;
      if (postMode === "chat") {
        chatId = nextMode === "chat" ? nextChatId : cur.currentPostChatId;
      }
      dispatch({
        type: "SET_STATE",
        patch: {
          screen: "post",
          postMode,
          currentPostChatId: chatId,
          postViewStack: [],
          isEditing: false,
        },
      });
    },
    [confirmDiscardAnyEdit, discardPendingEdits, dispatch],
  );

  const openPostComments = useCallback(
    (id: number) => {
      const cur = stateRef.current;
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
      applyNavPatch: (patch) => navDispatchBase({ type: "SET_NAV", patch }),
    });
  }, [composer, goToHref, canLeaveCurrentScreen]);

  const value = useMemo<AppContextValue>(
    () => ({
      state,
      dispatch,
      navigate,
      navigateBack,
      navigateWithState,
      goToHref,
      goHome,
      openPost,
      setPostView,
      openPostComments,
      openGChat,
      sendHome: composer.sendHome,
      sendGChat: composer.sendGChat,
      sendPost: composer.sendPost,
      hasLlmForSend: composer.hasLlmForSend,
      setComposerLlm: composer.setComposerLlm,
      setComposerWeb: composer.setComposerWeb,
      multiResponsePairs: composer.multiResponsePairs,
      llmLabel: composer.llmLabel,
      webLabel: composer.webLabel,
      registerNotePersist,
      canLeaveCurrentScreen,
      confirmDiscardPostEdit,
      registerUserMessageEdit,
      unregisterUserMessageEdit,
      confirmDiscardAnyEdit,
      discardPendingEdits,
      discardProfileEdits,
    }),
    [
      state,
      navigate,
      navigateBack,
      navigateWithState,
      goToHref,
      goHome,
      openPost,
      setPostView,
      openPostComments,
      openGChat,
      composer,
      registerNotePersist,
      canLeaveCurrentScreen,
      confirmDiscardPostEdit,
      registerUserMessageEdit,
      unregisterUserMessageEdit,
      confirmDiscardAnyEdit,
      discardPendingEdits,
      discardProfileEdits,
    ],
  );

  const navigationValue = useMemo<NavigationContextValue>(
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
      navDispatch: navDispatchBase,
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
    ],
  );

  return (
    <NavigationContext.Provider value={navigationValue}>
      <AppContext.Provider value={value}>{children}</AppContext.Provider>
    </NavigationContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
  return ctx;
}

export type { State as AppState, Action as AppAction };

export { postById, globalChatById } from "@/state/domain-store";
export type { DomainState } from "@/state/domain/types";
export type { DomainDispatchAction } from "@/state/domain-store";

export type { NoteFile };
