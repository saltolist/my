"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useApp } from "@/state/AppContext";
import type { TelegramProfileConfig } from "@/lib/types";

export default function TelegramBlock() {
  const { state, dispatch, setDirty } = useApp();
  const cfg = state.telegramProfileConfig;
  const [code, setCode] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [apiHashVisible, setApiHashVisible] = useState(false);
  const [botApiTokenVisible, setBotApiTokenVisible] = useState(false);
  const syncTimerRef = useRef<number | null>(null);

  const update = (patch: Partial<TelegramProfileConfig>) =>
    dispatch({ type: "UPDATE_TELEGRAM_CONFIG", config: { ...cfg, ...patch } });

  const currentSnap = snapshot(cfg);
  const dirty = currentSnap !== state.telegramSettingsSavedSnapshot;

  useEffect(() => {
    setDirty("profile-telegram", dirty);
  }, [dirty, setDirty]);

  useEffect(() => {
    return () => {
      setDirty("profile-telegram", false);
      if (syncTimerRef.current !== null) window.clearTimeout(syncTimerRef.current);
    };
  }, [setDirty]);

  const status = getTelegramStatusLabel(cfg, syncing);
  const isConnected = cfg.authStatus === "connected" && cfg.channelStatus === "connected";
  const isAuthorized = cfg.authStatus === "authorized" || cfg.authStatus === "connected";
  const codeHidden = cfg.authStatus !== "code-sent";
  const savedSnapshot = parseTelegramSnapshot(state.telegramSettingsSavedSnapshot);
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
    update({
      authStatus: "code-sent",
      authStep: "code",
      channelStatus: isAuthorized && phoneChangedFromSaved ? "idle" : cfg.channelStatus === "connected" ? "pending" : cfg.channelStatus,
      channelTitle: isAuthorized && phoneChangedFromSaved ? "" : cfg.channelTitle,
      lastSync: isAuthorized && phoneChangedFromSaved ? "—" : cfg.lastSync,
      importedPosts: isAuthorized && phoneChangedFromSaved ? 0 : cfg.importedPosts,
    });
  };

  const confirmCode = () =>
    update({
      authStatus: code.trim() ? "authorized" : "code-sent",
      authStep: code.trim() ? "channel" : "code",
    });

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
    dispatch({
      type: "SET_STATE",
      patch: { telegramSettingsSavedSnapshot: snapshot({ ...cfg, ...next }) },
    });
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
    dispatch({
      type: "SET_STATE",
      patch: { telegramSettingsSavedSnapshot: snapshot({ ...cfg, ...next }) },
    });
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
    dispatch({
      type: "SET_STATE",
      patch: {
        telegramSettingsSavedSnapshot: snapshot({
          ...cfg,
          authStatus: "idle",
          channelStatus: "idle",
          botApiToken: "",
          botStatus: "idle",
        }),
      },
    });
  };

  return (
    <div className="profile-section">
      <div className="profile-section-title">Telegram</div>

      <div className="telegram-status-row">
        <div>
          <div className="profile-label">Статус</div>
          <div className={`telegram-status ${status.className}`}>
            <span className="telegram-status-dot" />
            {status.text}
          </div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={reset} type="button">
          Сбросить демо
        </button>
      </div>

      <div className="telegram-steps">
        <div className={`telegram-step ${isAuthorized ? "done" : "active"}`}>
          <span>1</span>
          <div>
            <b>Авторизация аккаунта</b>
            <small>api_id, api_hash и телефон для MTProto-сессии</small>
          </div>
        </div>
        <div className={`telegram-step ${isAuthorized ? (isConnected ? "done" : "active") : ""}`}>
          <span>2</span>
          <div>
            <b>Подключение канала</b>
            <small>username, invite link или id канала</small>
          </div>
        </div>
        <div className={`telegram-step ${syncing ? "active syncing" : isConnected ? "done" : ""}`}>
          <span>3</span>
          <div>
            <b>Синхронизация</b>
            <small>история постов и новые события</small>
          </div>
        </div>
      </div>

      <div className="telegram-form-grid">
        <Field
          label="api_id"
          value={cfg.apiId}
          placeholder="12345678"
          onChange={(v) => update({ apiId: v })}
        />
        <Field
          label="api_hash"
          type={apiHashVisible ? "text" : "password"}
          value={cfg.apiHash}
          placeholder="••••••••••••••••"
          onChange={(v) => update({ apiHash: v })}
          trailing={
            <button
              type="button"
              className="profile-api-key-toggle"
              aria-label={apiHashVisible ? "Скрыть api_hash" : "Показать api_hash"}
              title={apiHashVisible ? "Скрыть api_hash" : "Показать api_hash"}
              onClick={() => setApiHashVisible((value) => !value)}
            >
              <EyeIcon hidden={!apiHashVisible} />
            </button>
          }
        />
        <Field
          label="Телефон аккаунта"
          value={cfg.phone}
          placeholder="+7 999 000-00-00"
          onChange={(v) => update({ phone: v })}
        />
        <div className="profile-row telegram-inline-action">
          <div className="profile-label" aria-hidden>
            &nbsp;
          </div>
          <div className="telegram-code-row">
            <button
              className="btn btn-ghost telegram-inline-button"
              disabled={sendCodeDisabled}
              onClick={startAuth}
              type="button"
            >
              Отправить код
            </button>
            {codeHidden ? null : (
              <>
                <input
                  className="profile-input profile-input-explicit telegram-code-input"
                  placeholder="Код из Telegram"
                  maxLength={8}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
                <button className="btn btn-ghost telegram-inline-button" onClick={confirmCode} type="button">
                  Подтвердить
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className={`telegram-channel-section${!isAuthorized ? " hidden" : ""}`}>
        <div className="telegram-form-grid">
          <Field
            label="Канал"
            value={cfg.channel}
            placeholder="@channel или -100..."
            onChange={(v) => update({ channel: v })}
          />
          <div className="profile-row telegram-inline-action">
            <div className="profile-label" aria-hidden>
              &nbsp;
            </div>
            <button
              className="btn btn-ghost telegram-inline-button"
              disabled={connectChannelDisabled}
              onClick={connectChannel}
              type="button"
            >
              Подключить канал
            </button>
          </div>
        </div>

        {isConnected ? (
          <div className="telegram-sync-card telegram-channel-card">
        <div>
          <div className="profile-label">Подключённый канал</div>
          <div className="profile-val">
            {cfg.channelTitle} · {cfg.channel}
          </div>
        </div>
        <div>
          <div className="profile-label">Последняя синхронизация</div>
          <div className="profile-val">{cfg.lastSync}</div>
        </div>
        <div>
          <div className="profile-label">Импортировано постов</div>
          <div className="profile-val">{cfg.importedPosts}</div>
        </div>
          </div>
        ) : null}
      </div>

      <div className="telegram-section-divider" aria-hidden />

      <div className="telegram-omnibot-section">
        <div className="telegram-omnibot-title">Омниканальный бот</div>

        <div className="telegram-form-grid">
          <Field
            label="API-токен"
            type={botApiTokenVisible ? "text" : "password"}
            value={cfg.botApiToken}
            placeholder="••••••••••••••••"
            onChange={(v) => update({ botApiToken: v })}
            trailing={
              <button
                type="button"
                className="profile-api-key-toggle"
                aria-label={botApiTokenVisible ? "Скрыть API-токен" : "Показать API-токен"}
                title={botApiTokenVisible ? "Скрыть API-токен" : "Показать API-токен"}
                onClick={() => setBotApiTokenVisible((value) => !value)}
              >
                <EyeIcon hidden={!botApiTokenVisible} />
              </button>
            }
          />
          <div className="profile-row telegram-inline-action">
            <div className="profile-label" aria-hidden>
              &nbsp;
            </div>
            <button
              className="btn btn-ghost telegram-inline-button"
              disabled={addBotDisabled}
              onClick={connectBot}
              type="button"
            >
              Добавить
            </button>
          </div>
        </div>

        {isBotConnected ? (
          <div className="telegram-sync-card telegram-omnibot-card">
            <div>
              <div className="profile-label">Подключённый бот</div>
              <div className="profile-val">{cfg.botUsername}</div>
            </div>
            <div>
              <div className="profile-label">Последняя активность</div>
              <div className="profile-val">{cfg.botLastActivity}</div>
            </div>
            <div>
              <div className="profile-label">Сообщений</div>
              <div className="profile-val">{cfg.botMessageCount.toLocaleString("ru-RU")}</div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  trailing,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  trailing?: ReactNode;
}) {
  return (
    <div className="profile-row">
      <div className="profile-label">{label}</div>
      {trailing ? (
        <div className="telegram-input-wrap">
          <input
            className="profile-input profile-input-explicit telegram-input telegram-input-with-toggle"
            type={type}
            value={value}
            placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)}
          />
          {trailing}
        </div>
      ) : (
        <input
          className="profile-input profile-input-explicit telegram-input"
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}

function EyeIcon({ hidden }: { hidden: boolean }) {
  return (
    <svg
      className="profile-api-key-toggle-icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2.5 12s3.4-6 9.5-6 9.5 6 9.5 6-3.4 6-9.5 6-9.5-6-9.5-6Z" />
      <circle cx="12" cy="12" r="2.6" />
      {hidden ? <path d="M4 4l16 16" /> : null}
    </svg>
  );
}

function snapshot(cfg: TelegramProfileConfig) {
  return JSON.stringify({
    apiId: cfg.apiId || "",
    apiHash: cfg.apiHash || "",
    phone: cfg.phone || "",
    sessionName: cfg.sessionName || "",
    channel: cfg.channel || "",
    botApiToken: cfg.botApiToken || "",
    botStatus: cfg.botStatus,
  });
}

function parseTelegramSnapshot(snapshotJson: string): Pick<
  TelegramProfileConfig,
  "apiId" | "apiHash" | "phone" | "sessionName" | "channel" | "botApiToken"
> {
  try {
    const saved = JSON.parse(snapshotJson) as Partial<TelegramProfileConfig>;
    return {
      apiId: saved.apiId || "",
      apiHash: saved.apiHash || "",
      phone: saved.phone || "",
      sessionName: saved.sessionName || "",
      channel: saved.channel || "",
      botApiToken: saved.botApiToken || "",
    };
  } catch {
    return { apiId: "", apiHash: "", phone: "", sessionName: "", channel: "", botApiToken: "" };
  }
}

function normalizeTelegramValue(value: string) {
  return value.trim().toLowerCase();
}

function getTelegramStatusLabel(cfg: TelegramProfileConfig, syncing: boolean) {
  if (syncing) return { className: "syncing", text: "Синхронизация" };
  if (cfg.authStatus === "connected" && cfg.channelStatus === "connected") {
    return { className: "ok", text: "MTProto подключён" };
  }
  if (cfg.authStatus === "code-sent") return { className: "warn", text: "Ждёт код входа" };
  if (cfg.authStatus === "authorized") return { className: "warn", text: "Аккаунт авторизован" };
  return { className: "muted", text: "Не подключён" };
}
