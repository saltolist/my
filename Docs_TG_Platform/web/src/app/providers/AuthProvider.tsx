"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { AuthSession } from "@/shared/lib/auth/types";
import { logout as logoutApi } from "@/entities/auth";
import { resetAccountRegistry } from "@/shared/api/msw/accountRegistry";
import { USE_MSW } from "@/shared/config/dataSource";
import { clearSession, readSession, writeSession } from "@/shared/lib/auth/session";
import { useProfileDraftStore } from "@/app/model/store/profile-draft-store";

type AuthContextValue = {
  session: AuthSession | null;
  ready: boolean;
  setSession: (session: AuthSession | null) => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [session, setSessionState] = useState<AuthSession | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSessionState(readSession());
    setReady(true);
  }, []);

  const setSession = useCallback(
    (next: AuthSession | null) => {
      if (next) {
        writeSession(next);
        useProfileDraftStore.setState({ hydrated: false });
      } else {
        clearSession();
      }
      setSessionState(next);
      void queryClient.invalidateQueries();
    },
    [queryClient],
  );

  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } catch {
      // Client session is cleared even if the request fails.
    }
    if (USE_MSW) resetAccountRegistry();
    clearSession();
    setSessionState(null);
    useProfileDraftStore.getState().resetForLogout();
    void queryClient.clear();
  }, [queryClient]);

  const value = useMemo(
    () => ({
      session,
      ready,
      setSession,
      logout,
    }),
    [logout, ready, session, setSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}
