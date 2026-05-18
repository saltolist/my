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

  const startAuth = () =>
    update({
      authStatus: "code-sent",
      authStep: "code",
      channelStatus: cfg.channelStatus === "connected" ? "pending" : cfg.channelStatus,
    });

  const confirmCode = () =>
    update({
      authStatus: code.trim() ? "authorized" : "code-sent",
      authStep: code.trim() ? "channel" : "code",
    });

  const connectChannel = () => {
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
    });
    dispatch({
      type: "SET_STATE",
      patch: { telegramSettingsSavedSnapshot: snapshot({ ...cfg, authStatus: "idle", channelStatus: "idle" }) },
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
          <button className="btn btn-ghost telegram-inline-button" onClick={startAuth} type="button">
            Отправить код
          </button>
        </div>
      </div>

      {codeHidden ? null : (
        <div className="telegram-action-row">
          <div className="telegram-code-row">
            <input
              className="profile-input profile-input-explicit telegram-code-input"
              placeholder="Код из Telegram"
              maxLength={8}
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <button className="btn btn-ghost btn-sm" onClick={confirmCode} type="button">
              Подтвердить
            </button>
          </div>
        </div>
      )}

      <div className={`telegram-channel-block${!isAuthorized ? " hidden" : ""}`}>
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
            <button className="btn btn-ghost telegram-inline-button" onClick={connectChannel} type="button">
              Подключить канал
            </button>
          </div>
        </div>
      </div>

      <div className={`telegram-sync-card${!isConnected ? " hidden" : ""}`}>
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
  });
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
