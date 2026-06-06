"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  getTelegramStatusLabel,
  normalizeTelegramValue,
  parseTelegramSnapshot,
  telegramConfigSnapshot,
} from "@/shared/lib/profile/telegramSnapshot";
import { useDomain } from "@/app/model/store/domain-store";
import { useUi } from "@/app/model/store/ui-store";
import type { TelegramProfileConfig } from "@/shared/types";

const RESEND_COOLDOWN_SECONDS = 60;

export function useTelegramBlock() {
  const { state, dispatch, applyPatch } = useDomain();
  const { setDirty } = useUi();
  const cfg = state.telegramProfileConfig;
  const [code, setCode] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [apiHashVisible, setApiHashVisible] = useState(false);
  const [botApiTokenVisible, setBotApiTokenVisible] = useState(false);
  const [resendCooldownSec, setResendCooldownSec] = useState(0);
  const syncTimerRef = useRef<number | null>(null);
  const resendIntervalRef = useRef<number | null>(null);
  const authBeforeCodeSentRef = useRef<Partial<TelegramProfileConfig> | null>(null);

  const update = (patch: Partial<TelegramProfileConfig>) =>
    dispatch({ type: "UPDATE_TELEGRAM_CONFIG", config: { ...cfg, ...patch } });

  const currentSnap = telegramConfigSnapshot(cfg);
  const dirty = currentSnap !== state.telegramSettingsSavedSnapshot;

  useEffect(() => {
    setDirty("profile-telegram", dirty);
  }, [dirty, setDirty]);

  const clearResendCooldown = useCallback(() => {
    if (resendIntervalRef.current !== null) {
      window.clearInterval(resendIntervalRef.current);
      resendIntervalRef.current = null;
    }
    setResendCooldownSec(0);
  }, []);

  const beginResendCooldown = useCallback(() => {
    if (resendIntervalRef.current !== null) {
      window.clearInterval(resendIntervalRef.current);
      resendIntervalRef.current = null;
    }
    setResendCooldownSec(RESEND_COOLDOWN_SECONDS);
    resendIntervalRef.current = window.setInterval(() => {
      setResendCooldownSec((prev) => {
        if (prev <= 1) {
          if (resendIntervalRef.current !== null) {
            window.clearInterval(resendIntervalRef.current);
            resendIntervalRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    if (cfg.authStatus === "code-sent") beginResendCooldown();
    else clearResendCooldown();
    return () => clearResendCooldown();
  }, [cfg.authStatus, beginResendCooldown, clearResendCooldown]);

  useEffect(() => {
    return () => {
      setDirty("profile-telegram", false);
      if (syncTimerRef.current !== null) window.clearTimeout(syncTimerRef.current);
      clearResendCooldown();
    };
  }, [setDirty, clearResendCooldown]);

  const status = getTelegramStatusLabel(cfg, syncing);
  const isConnected = cfg.authStatus === "connected" && cfg.channelStatus === "connected";
  const isAuthorized = cfg.authStatus === "authorized" || cfg.authStatus === "connected";
  const codeHidden = cfg.authStatus !== "code-sent";
  const savedSnapshot = parseTelegramSnapshot(state.telegramSettingsSavedSnapshot);
  const apiIdChangedFromSaved = normalizeTelegramValue(cfg.apiId) !== normalizeTelegramValue(savedSnapshot.apiId);
  const apiHashChangedFromSaved = normalizeTelegramValue(cfg.apiHash) !== normalizeTelegramValue(savedSnapshot.apiHash);
  const apiChangedFromSaved = apiIdChangedFromSaved || apiHashChangedFromSaved;
  const phoneChangedFromSaved = normalizeTelegramValue(cfg.phone) !== normalizeTelegramValue(savedSnapshot.phone);
  const channelChangedFromSaved = normalizeTelegramValue(cfg.channel) !== normalizeTelegramValue(savedSnapshot.channel);
  const sendCodeDisabled = isAuthorized && !phoneChangedFromSaved;
  const connectChannelDisabled = isConnected && !channelChangedFromSaved;
  const isBotConnected = cfg.botStatus === "connected";
  const botTokenTrimmed = cfg.botApiToken.trim();
  const botTokenChangedFromSaved =
    normalizeTelegramValue(cfg.botApiToken) !== normalizeTelegramValue(savedSnapshot.botApiToken || "");
  const addBotDisabled = !botTokenTrimmed || (isBotConnected && !botTokenChangedFromSaved);

  const startAuth = () => {
    if (sendCodeDisabled) return;
    if (isAuthorized && phoneChangedFromSaved) {
      const ok = window.confirm(
        "При переподключении телефона данные прошлого аккаунта и подключенного канала будут недоступны, пока вы не подключите их снова.",
      );
      if (!ok) return;
      setSyncing(false);
      if (syncTimerRef.current !== null) {
        window.clearTimeout(syncTimerRef.current);
        syncTimerRef.current = null;
      }
    }
    authBeforeCodeSentRef.current = {
      authStatus: cfg.authStatus,
      authStep: cfg.authStep,
      channelStatus: cfg.channelStatus,
      channelTitle: cfg.channelTitle,
      lastSync: cfg.lastSync,
      importedPosts: cfg.importedPosts,
    };
    update({
      authStatus: "code-sent",
      authStep: "code",
      channelStatus: isAuthorized && phoneChangedFromSaved ? "idle" : cfg.channelStatus === "connected" ? "pending" : cfg.channelStatus,
      channelTitle: isAuthorized && phoneChangedFromSaved ? "" : cfg.channelTitle,
      lastSync: isAuthorized && phoneChangedFromSaved ? "—" : cfg.lastSync,
      importedPosts: isAuthorized && phoneChangedFromSaved ? 0 : cfg.importedPosts,
    });
  };

  const resendCode = () => {
    if (resendCooldownSec > 0 || sendCodeDisabled || cfg.authStatus !== "code-sent") return;
    beginResendCooldown();
  };

  const cancelCodeEntry = () => {
    setCode("");
    const prev = authBeforeCodeSentRef.current;
    authBeforeCodeSentRef.current = null;
    if (prev) update(prev);
    else update({ authStatus: "idle", authStep: "credentials" });
  };

  const confirmCode = () => {
    authBeforeCodeSentRef.current = null;
    update({
      authStatus: code.trim() ? "authorized" : "code-sent",
      authStep: code.trim() ? "channel" : "code",
    });
  };

  const connectChannel = () => {
    if (connectChannelDisabled) return;
    if (isConnected && channelChangedFromSaved) {
      const ok = window.confirm(
        "При подключении другого канала данные прошлого канала будут недоступны, пока вы не подключите его снова.",
      );
      if (!ok) return;
    }
    if (syncTimerRef.current !== null) window.clearTimeout(syncTimerRef.current);
    const next: Partial<TelegramProfileConfig> = {
      authStatus: "connected",
      authStep: "connected",
      channelStatus: "connected",
      channelTitle: cfg.channel.replace("@", "") || "Telegram канал",
      lastSync: "только что",
      importedPosts: Math.max(cfg.importedPosts, 128),
    };
    update(next);
    applyPatch({ telegramSettingsSavedSnapshot: telegramConfigSnapshot({ ...cfg, ...next }) });
    setSyncing(true);
    syncTimerRef.current = window.setTimeout(() => {
      setSyncing(false);
      syncTimerRef.current = null;
    }, 1800);
  };

  const connectBot = () => {
    if (addBotDisabled) return;
    const tokenHint = botTokenTrimmed.slice(0, 8);
    const next: Partial<TelegramProfileConfig> = {
      botStatus: "connected",
      botUsername: `@omni_bot_${tokenHint}`,
      botLastActivity: "только что",
      botMessageCount: 0,
    };
    update(next);
    applyPatch({ telegramSettingsSavedSnapshot: telegramConfigSnapshot({ ...cfg, ...next }) });
  };

  const reset = () => {
    if (syncTimerRef.current !== null) {
      window.clearTimeout(syncTimerRef.current);
      syncTimerRef.current = null;
    }
    setSyncing(false);
    update({
      authStatus: "idle",
      authStep: "credentials",
      channelStatus: "idle",
      lastSync: "—",
      importedPosts: 0,
      botApiToken: "",
      botStatus: "idle",
      botUsername: "",
      botLastActivity: "—",
      botMessageCount: 0,
    });
    applyPatch({
      telegramSettingsSavedSnapshot: telegramConfigSnapshot({
        ...cfg,
        authStatus: "idle",
        channelStatus: "idle",
        botApiToken: "",
        botStatus: "idle",
      }),
    });
  };

  const saveApiCredentials = () => {
    if (!apiChangedFromSaved) return;
    applyPatch({ telegramSettingsSavedSnapshot: telegramConfigSnapshot(cfg) });
  };

  const cancelApiCredentials = () => {
    if (!apiChangedFromSaved) return;
    update({ apiId: savedSnapshot.apiId, apiHash: savedSnapshot.apiHash });
  };
  return {
    cfg,
    update,
    status,
    isConnected,
    isAuthorized,
    codeHidden,
    syncing,
    code,
    setCode,
    apiHashVisible,
    setApiHashVisible,
    botApiTokenVisible,
    setBotApiTokenVisible,
    resendCooldownSec,
    apiChangedFromSaved,
    sendCodeDisabled,
    connectChannelDisabled,
    isBotConnected,
    addBotDisabled,
    startAuth,
    resendCode,
    cancelCodeEntry,
    confirmCode,
    connectChannel,
    connectBot,
    reset,
    saveApiCredentials,
    cancelApiCredentials,
  };
}
