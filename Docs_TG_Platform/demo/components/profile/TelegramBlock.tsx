"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/state/AppContext";
import type { TelegramProfileConfig, TelegramSyncMode } from "@/lib/types";
import ModelPicker from "@/components/composer/ModelPicker";

export default function TelegramBlock() {
  const { state, dispatch, setDirty } = useApp();
  const cfg = state.telegramProfileConfig;
  const [code, setCode] = useState("");

  const update = (patch: Partial<TelegramProfileConfig>) =>
    dispatch({ type: "UPDATE_TELEGRAM_CONFIG", config: { ...cfg, ...patch } });

  const currentSnap = snapshot(cfg);
  const dirty = currentSnap !== state.telegramSettingsSavedSnapshot;

  useEffect(() => {
    setDirty("profile-telegram", dirty);
  }, [dirty, setDirty]);

  useEffect(() => {
    return () => setDirty("profile-telegram", false);
  }, [setDirty]);

  const save = () => {
    dispatch({ type: "SET_STATE", patch: { telegramSettingsSavedSnapshot: currentSnap } });
  };

  const status = getTelegramStatusLabel(cfg);
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
  };

  const runSync = () => update({ lastSync: "только что", importedPosts: cfg.importedPosts + 3 });
  const reset = () => {
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
        <div className={`telegram-step ${isConnected ? "done" : ""}`}>
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
          type="password"
          value={cfg.apiHash}
          placeholder="••••••••••••••••"
          onChange={(v) => update({ apiHash: v })}
        />
        <Field
          label="Телефон аккаунта"
          value={cfg.phone}
          placeholder="+7 999 000-00-00"
          onChange={(v) => update({ phone: v })}
        />
        <Field
          label="Session name"
          value={cfg.sessionName}
          placeholder="author-main.session"
          onChange={(v) => update({ sessionName: v })}
        />
      </div>

      <div className="telegram-action-row">
        <button className="btn btn-primary btn-sm" onClick={startAuth} type="button">
          Отправить код
        </button>
        <div className={`telegram-code-row${codeHidden ? " hidden" : ""}`}>
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

      <div className={`telegram-channel-block${!isAuthorized ? " hidden" : ""}`}>
        <div className="telegram-form-grid">
          <Field
            label="Канал"
            value={cfg.channel}
            placeholder="@channel или -100..."
            onChange={(v) => update({ channel: v })}
          />
          <div className="profile-row">
            <div className="profile-label">Режим синхронизации</div>
            <ModelPicker
              ariaLabel="Режим синхронизации"
              className="profile-model-picker telegram-input"
              value={cfg.syncMode}
              options={[
                { id: "live-only", label: "Только новые посты" },
                { id: "history-and-live", label: "История + новые посты" },
                { id: "publish-only", label: "Только публикация" },
              ]}
              placement="down"
              onChange={(v) => update({ syncMode: v as TelegramSyncMode })}
            />
          </div>
        </div>
        <div className="telegram-action-row">
          <button className="btn btn-primary btn-sm" onClick={connectChannel} type="button">
            Подключить канал
          </button>
          <button
            className="btn btn-ghost btn-sm"
            onClick={runSync}
            disabled={!isConnected}
            type="button"
          >
            Синхронизировать
          </button>
          <button className="btn btn-primary btn-sm" disabled={!dirty} onClick={save} type="button">
            Сохранить
          </button>
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
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="profile-row">
      <div className="profile-label">{label}</div>
      <input
        className="profile-input profile-input-explicit telegram-input"
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function snapshot(cfg: TelegramProfileConfig) {
  return JSON.stringify({
    apiId: cfg.apiId || "",
    apiHash: cfg.apiHash || "",
    phone: cfg.phone || "",
    sessionName: cfg.sessionName || "",
    channel: cfg.channel || "",
    syncMode: cfg.syncMode || "",
  });
}

function getTelegramStatusLabel(cfg: TelegramProfileConfig) {
  if (cfg.authStatus === "connected" && cfg.channelStatus === "connected") {
    return { className: "ok", text: "MTProto подключён" };
  }
  if (cfg.authStatus === "code-sent") return { className: "warn", text: "Ждёт код входа" };
  if (cfg.authStatus === "authorized") return { className: "warn", text: "Аккаунт авторизован" };
  return { className: "muted", text: "Не подключён" };
}
