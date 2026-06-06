"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { domainReducer, initialDomainState } from "@/app/model/store/domain/reducer";
import type { DomainAction, DomainDispatchAction } from "@/app/model/store/domain/actions";
import { withTelegramDomainSync } from "@/app/model/store/domain/helpers";
import type { DomainState } from "@/app/model/store/domain/types";
import { telegramConfigNavPatch } from "@/app/model/store/navigation/buildPatch";
import { getDomainActionNavPatch } from "@/app/model/store/navigation/domainNavSideEffects";
import { initialNavigationState } from "@/app/model/store/navigation/types";
import type { NavigationPatch, NavigationState } from "@/app/model/store/navigation/types";

export type { DomainDispatchAction } from "@/app/model/store/domain/actions";

export type DomainNavBridge = {
  emitNavPatch: (patch: NavigationPatch) => void;
  getNavState: () => NavigationState;
};

export type DomainActions = {
  dispatch: (action: DomainDispatchAction) => void;
  applyPatch: (patch: Partial<DomainState>) => void;
  applyPatchWithTelegram: (patch: Partial<DomainState>) => void;
  registerNavBridge: (bridge: DomainNavBridge) => () => void;
};

type DomainStoreApi = {
  getState: () => DomainState;
  subscribe: (listener: () => void) => () => void;
};

type DomainContextValue = DomainActions & {
  store: DomainStoreApi;
};

const DomainContext = createContext<DomainContextValue | null>(null);

export function DomainProvider({ children }: { children: ReactNode }) {
  const [state, dispatchBase] = useReducer(domainReducer, initialDomainState);
  const stateRef = useRef(state);
  stateRef.current = state;
  const navBridgeRef = useRef<DomainNavBridge | null>(null);
  const listenersRef = useRef(new Set<() => void>());

  useEffect(() => {
    listenersRef.current.forEach((listener) => listener());
  }, [state]);

  const subscribe = useCallback((listener: () => void) => {
    listenersRef.current.add(listener);
    return () => {
      listenersRef.current.delete(listener);
    };
  }, []);

  const getState = useCallback(() => stateRef.current, []);

  const getNavState = useCallback(
    (): NavigationState => navBridgeRef.current?.getNavState() ?? initialNavigationState,
    [],
  );

  const emitNavPatch = useCallback((patch: NavigationPatch) => {
    if (Object.keys(patch).length) navBridgeRef.current?.emitNavPatch(patch);
  }, []);

  const registerNavBridge = useCallback((bridge: DomainNavBridge) => {
    navBridgeRef.current = bridge;
    return () => {
      if (navBridgeRef.current === bridge) navBridgeRef.current = null;
    };
  }, []);

  const applyPatch = useCallback((patch: Partial<DomainState>) => {
    if (!Object.keys(patch).length) return;
    dispatchBase({ type: "SET_DOMAIN", patch });
  }, []);

  const applyPatchWithTelegram = useCallback(
    (patch: Partial<DomainState>) => {
      if (!Object.keys(patch).length) return;
      let finalPatch = patch;
      if (patch.telegramProfileConfig) {
        finalPatch = {
          ...patch,
          ...withTelegramDomainSync(stateRef.current, patch.telegramProfileConfig),
        };
        const navPatch = telegramConfigNavPatch(getNavState(), patch.telegramProfileConfig);
        if (navPatch) emitNavPatch(navPatch);
      }
      dispatchBase({ type: "SET_DOMAIN", patch: finalPatch });
    },
    [emitNavPatch, getNavState],
  );

  const dispatch = useCallback(
    (action: DomainDispatchAction) => {
      const prevDomain = stateRef.current;
      const prevNav = getNavState();
      const nextDomain = domainReducer(prevDomain, action);
      dispatchBase(action);
      const navPatch = getDomainActionNavPatch(action, prevNav, prevDomain, nextDomain);
      if (navPatch) emitNavPatch(navPatch);
    },
    [emitNavPatch, getNavState],
  );

  const value = useMemo<DomainContextValue>(
    () => ({
      store: { getState, subscribe },
      dispatch,
      applyPatch,
      applyPatchWithTelegram,
      registerNavBridge,
    }),
    [applyPatch, applyPatchWithTelegram, dispatch, getState, registerNavBridge, subscribe],
  );

  return <DomainContext.Provider value={value}>{children}</DomainContext.Provider>;
}

function useDomainContext(): DomainContextValue {
  const ctx = useContext(DomainContext);
  if (!ctx) throw new Error("useDomain must be used inside <DomainProvider>");
  return ctx;
}

export function useDomainSelector<T>(
  selector: (state: DomainState) => T,
  equalityFn: (a: T, b: T) => boolean = Object.is,
): T {
  const { store } = useDomainContext();
  const selectorRef = useRef(selector);
  selectorRef.current = selector;
  const equalityRef = useRef(equalityFn);
  equalityRef.current = equalityFn;

  const [selected, setSelected] = useState<T>(() => selectorRef.current(store.getState()));
  const selectedRef = useRef(selected);
  selectedRef.current = selected;

  useEffect(() => {
    const sync = () => {
      const next = selectorRef.current(store.getState());
      if (!equalityRef.current(selectedRef.current, next)) {
        selectedRef.current = next;
        setSelected(next);
      }
    };
    sync();
    return store.subscribe(sync);
  }, [store]);

  return selected;
}

export function useDomainActions(): DomainActions {
  const { dispatch, applyPatch, applyPatchWithTelegram, registerNavBridge } = useDomainContext();
  return useMemo(
    () => ({ dispatch, applyPatch, applyPatchWithTelegram, registerNavBridge }),
    [applyPatch, applyPatchWithTelegram, dispatch, registerNavBridge],
  );
}

export function useDomainDispatch(): DomainActions["dispatch"] {
  return useDomainContext().dispatch;
}

/** @deprecated Prefer useDomainSelector + useDomainActions for granular subscriptions. */
export function useDomain(): DomainActions & { state: DomainState } {
  const actions = useDomainActions();
  const state = useDomainSelector((s) => s);
  return useMemo(() => ({ state, ...actions }), [actions, state]);
}

export { postById, globalChatById } from "@/app/model/store/domain/selectors";
