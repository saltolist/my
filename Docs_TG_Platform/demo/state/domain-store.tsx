"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from "react";
import { domainReducer, initialDomainState, type DomainAction } from "@/state/domain/reducer";
import { withTelegramDomainSync } from "@/state/domain/helpers";
import type { DomainState } from "@/state/domain/types";
import { telegramConfigNavPatch } from "@/state/navigation/buildPatch";
import { getDomainActionNavPatch } from "@/state/navigation/domainNavSideEffects";
import { initialNavigationState } from "@/state/navigation/types";
import type { NavigationPatch, NavigationState } from "@/state/navigation/types";

export type DomainDispatchAction = Exclude<DomainAction, { type: "SET_DOMAIN" }>;

export type DomainNavBridge = {
  emitNavPatch: (patch: NavigationPatch) => void;
  getNavState: () => NavigationState;
};

type DomainContextValue = {
  state: DomainState;
  dispatch: (action: DomainDispatchAction) => void;
  applyPatch: (patch: Partial<DomainState>) => void;
  applyPatchWithTelegram: (patch: Partial<DomainState>) => void;
  registerNavBridge: (bridge: DomainNavBridge) => () => void;
};

const DomainContext = createContext<DomainContextValue | null>(null);

export function DomainProvider({ children }: { children: ReactNode }) {
  const [state, dispatchBase] = useReducer(domainReducer, initialDomainState);
  const stateRef = useRef(state);
  stateRef.current = state;
  const navBridgeRef = useRef<DomainNavBridge | null>(null);

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
      state,
      dispatch,
      applyPatch,
      applyPatchWithTelegram,
      registerNavBridge,
    }),
    [state, dispatch, applyPatch, applyPatchWithTelegram, registerNavBridge],
  );

  return <DomainContext.Provider value={value}>{children}</DomainContext.Provider>;
}

export function useDomain(): DomainContextValue {
  const ctx = useContext(DomainContext);
  if (!ctx) throw new Error("useDomain must be used inside <DomainProvider>");
  return ctx;
}

export { postById, globalChatById } from "@/state/domain/selectors";
