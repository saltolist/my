"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { formatTelegramPhoneInput, TELEGRAM_PHONE_FORMATTED_MAX_LENGTH } from "@/lib/format-telegram-phone";
import { useApp } from "@/state/AppContext";
import { useUi } from "@/state/ui-store";
import type { TelegramProfileConfig } from "@/lib/types";

const RESEND_COOLDOWN_SECONDS = 60;

export default function TelegramBlock() {
  const { state, dispatch } = useApp();
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

  const currentSnap = snapshot(cfg);
  const dirty = currentSnap !== state.telegramSettingsSavedSnapshot;

  useEffect(() => {
    setDirty("profile-telegram", dirty);
  }, [dirty, setDirty]);

  const clearResendCooldown = () => {
    if (resendIntervalRef.current !== null) {
      window.clearInterval(resendIntervalRef.current);
      resendIntervalRef.current = null;
    }
    setResendCooldownSec(0);
  };

  const beginResendCooldown = () => {
    clearResendCooldown();
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
  };

  useEffect(() => {
    if (cfg.authStatus === "code-sent") beginResendCooldown();
    else clearResendCooldown();
    return () => clearResendCooldown();
  }, [cfg.authStatus]);

  useEffect(() => {
    return () => {
      setDirty("profile-telegram", false);
      if (syncTimerRef.current !== null) window.clearTimeout(syncTimerRef.current);
      clearResendCooldown();
    };
  }, [setDirty]);

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

  const saveApiCredentials = () => {
    if (!apiChangedFromSaved) return;
    dispatch({
      type: "SET_STATE",
      patch: { telegramSettingsSavedSnapshot: snapshot(cfg) },
    });
  };

  const cancelApiCredentials = () => {
    if (!apiChangedFromSaved) return;
    update({ apiId: savedSnapshot.apiId, apiHash: savedSnapshot.apiHash });
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
        <div
          className={`telegram-api-credentials${apiChangedFromSaved ? " telegram-api-credentials--dirty" : ""}`}
        >
          <div className="profile-row telegram-api-id-row">
            <div className="profile-label">api_id</div>
            <input
              className="profile-input profile-input-explicit telegram-input telegram-api-id-input"
              value={cfg.apiId}
              placeholder="12345678"
              onChange={(e) => update({ apiId: e.target.value })}
            />
          </div>

          <div className="profile-row telegram-api-hash-row">
            <div className="profile-label">api_hash</div>
            <div className="telegram-input-wrap telegram-api-hash-input-wrap">
              <input
                className="profile-input profile-input-explicit telegram-input telegram-api-hash-input telegram-input-with-toggle"
                type={apiHashVisible ? "text" : "password"}
                value={cfg.apiHash}
                placeholder="••••••••••••••••"
                onChange={(e) => update({ apiHash: e.target.value })}
              />
              <button
                type="button"
                className="profile-api-key-toggle"
                aria-label={apiHashVisible ? "Скрыть api_hash" : "Показать api_hash"}
                title={apiHashVisible ? "Скрыть api_hash" : "Показать api_hash"}
                onClick={() => setApiHashVisible((value) => !value)}
              >
                <EyeIcon hidden={!apiHashVisible} />
              </button>
            </div>
          </div>

          <div className="profile-action-buttons profile-action-buttons--ai telegram-api-actions">
            <button
              className="btn btn-primary telegram-api-action-btn"
              type="button"
              disabled={!apiChangedFromSaved}
              onClick={saveApiCredentials}
            >
              Сохранить
            </button>
            <button
              className="btn btn-ghost telegram-api-action-btn telegram-api-action-btn--cancel"
              type="button"
              disabled={!apiChangedFromSaved}
              onClick={cancelApiCredentials}
            >
              Отменить
            </button>
          </div>
        </div>

        <div className="telegram-auth-desktop">
          {codeHidden ? (
            <div className="profile-row telegram-phone-desktop-row">
              <div className="profile-label">Телефон аккаунта</div>
              <div className="telegram-desktop-auth-row">
                <TelegramPhoneInput
                  className="telegram-desktop-phone-input"
                  value={cfg.phone}
                  onChange={(phone) => update({ phone })}
                />
                <button
                  className="btn btn-ghost telegram-inline-button"
                  disabled={sendCodeDisabled}
                  onClick={startAuth}
                  type="button"
                >
                  Отправить код
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="telegram-desktop-auth-wide">
                <div className="profile-row telegram-phone-desktop-row telegram-phone-desktop-row--code-sent">
                  <div className="profile-label">Телефон аккаунта</div>
                  <div className="telegram-desktop-auth-row telegram-desktop-auth-row--code-sent">
                    <TelegramPhoneInput
                      className="telegram-desktop-phone-input"
                      value={cfg.phone}
                      onChange={(phone) => update({ phone })}
                    />
                    <TelegramCodeInput value={code} onChange={setCode} onDismiss={cancelCodeEntry} />
                    <button className="btn btn-ghost telegram-inline-button" onClick={confirmCode} type="button">
                      Подтвердить
                    </button>
                    <TelegramResendCode secondsLeft={resendCooldownSec} onResend={resendCode} />
                  </div>
                </div>
              </div>
              <div className="telegram-desktop-auth-narrow">
                <div className="profile-row telegram-phone-desktop-row telegram-phone-desktop-row--code-sent">
                  <div className="profile-label">Телефон аккаунта</div>
                  <div className="telegram-desktop-auth-row telegram-desktop-auth-row--stacked">
                    <TelegramPhoneInput
                      className="telegram-desktop-phone-input"
                      value={cfg.phone}
                      onChange={(phone) => update({ phone })}
                    />
                    <button
                      className="btn btn-ghost telegram-inline-button"
                      disabled
                      onClick={startAuth}
                      type="button"
                    >
                      Отправить код
                    </button>
                  </div>
                </div>
                <div className="profile-row telegram-code-desktop-row">
                  <div className="profile-label" aria-hidden>
                    &nbsp;
                  </div>
                  <div className="telegram-code-block telegram-desktop-code-block">
                    <div className="telegram-inline-field-row telegram-desktop-code-inline">
                      <TelegramCodeInput value={code} onChange={setCode} onDismiss={cancelCodeEntry} />
                      <button className="btn btn-ghost telegram-inline-button" onClick={confirmCode} type="button">
                        Подтвердить
                      </button>
                    </div>
                    <TelegramResendCode secondsLeft={resendCooldownSec} onResend={resendCode} />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        <div className="telegram-auth-mobile">
          <div className="profile-row telegram-phone-row">
            <div className="profile-label">Телефон аккаунта</div>
            <div className="telegram-inline-field-row">
              <TelegramPhoneInput value={cfg.phone} onChange={(phone) => update({ phone })} />
              <button
                className="btn btn-ghost telegram-inline-button"
                disabled={sendCodeDisabled}
                onClick={startAuth}
                type="button"
              >
                Отправить код
              </button>
            </div>
          </div>
          {codeHidden ? null : (
            <div className="profile-row telegram-code-action-row">
              <div className="profile-label" aria-hidden>
                &nbsp;
              </div>
              <div className="telegram-code-block">
                <div className="telegram-inline-field-row">
                  <TelegramCodeInput value={code} onChange={setCode} onDismiss={cancelCodeEntry} />
                  <button className="btn btn-ghost telegram-inline-button" onClick={confirmCode} type="button">
                    Подтвердить
                  </button>
                </div>
                <TelegramResendCode secondsLeft={resendCooldownSec} onResend={resendCode} />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={`telegram-channel-section${!isAuthorized ? " hidden" : ""}`}>
        <div className="telegram-channel-desktop">
          <div className="profile-row telegram-channel-desktop-row">
            <div className="profile-label">Канал</div>
            <div className="telegram-channel-desktop-fields">
              <input
                className="profile-input profile-input-explicit telegram-input telegram-channel-input"
                value={cfg.channel}
                placeholder="@channel или -100..."
                onChange={(e) => update({ channel: e.target.value })}
              />
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
        </div>
        <div className="telegram-channel-mobile">
          <div className="profile-row telegram-channel-row">
            <div className="profile-label">Канал</div>
            <div className="telegram-inline-field-row">
              <input
                className="profile-input profile-input-explicit telegram-input"
                value={cfg.channel}
                placeholder="@channel или -100..."
                onChange={(e) => update({ channel: e.target.value })}
              />
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

        <div className="telegram-omnibot-desktop">
          <div className="profile-row telegram-omnibot-desktop-row">
            <div className="profile-label">API-токен</div>
            <div className="telegram-omnibot-desktop-fields">
              <div className="telegram-input-wrap telegram-omnibot-token-wrap">
                <input
                  className="profile-input profile-input-explicit telegram-input telegram-input-with-toggle"
                  type={botApiTokenVisible ? "text" : "password"}
                  value={cfg.botApiToken}
                  placeholder="••••••••••••••••"
                  onChange={(e) => update({ botApiToken: e.target.value })}
                />
                <button
                  type="button"
                  className="profile-api-key-toggle"
                  aria-label={botApiTokenVisible ? "Скрыть API-токен" : "Показать API-токен"}
                  title={botApiTokenVisible ? "Скрыть API-токен" : "Показать API-токен"}
                  onClick={() => setBotApiTokenVisible((value) => !value)}
                >
                  <EyeIcon hidden={!botApiTokenVisible} />
                </button>
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
        </div>
        <div className="telegram-omnibot-mobile">
          <div className="profile-row telegram-bot-token-row">
            <div className="profile-label">API-токен</div>
            <div className="telegram-inline-field-row">
              <div className="telegram-input-wrap">
                <input
                  className="profile-input profile-input-explicit telegram-input telegram-input-with-toggle"
                  type={botApiTokenVisible ? "text" : "password"}
                  value={cfg.botApiToken}
                  placeholder="••••••••••••••••"
                  onChange={(e) => update({ botApiToken: e.target.value })}
                />
                <button
                  type="button"
                  className="profile-api-key-toggle"
                  aria-label={botApiTokenVisible ? "Скрыть API-токен" : "Показать API-токен"}
                  title={botApiTokenVisible ? "Скрыть API-токен" : "Показать API-токен"}
                  onClick={() => setBotApiTokenVisible((value) => !value)}
                >
                  <EyeIcon hidden={!botApiTokenVisible} />
                </button>
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

function TelegramPhoneInput({
  value,
  onChange,
  className = "",
}: {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <input
      className={`profile-input profile-input-explicit telegram-input ${className}`.trim()}
      type="tel"
      inputMode="tel"
      autoComplete="tel"
      maxLength={TELEGRAM_PHONE_FORMATTED_MAX_LENGTH}
      placeholder="+7 999 000-00-00"
      value={value}
      onChange={(e) => onChange(formatTelegramPhoneInput(e.target.value))}
    />
  );
}

function TelegramCodeInput({
  value,
  onChange,
  onDismiss,
}: {
  value: string;
  onChange: (value: string) => void;
  onDismiss: () => void;
}) {
  return (
    <div className="telegram-code-input-field">
      <input
        className="profile-input telegram-code-input"
        placeholder="Код из Telegram"
        maxLength={8}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button
        type="button"
        className="telegram-code-input-dismiss"
        aria-label="Отменить ввод кода"
        onClick={onDismiss}
      >
        <CloseIcon size={14} />
      </button>
    </div>
  );
}

function CloseIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="6.5" y1="6.5" x2="17.5" y2="17.5" />
      <line x1="17.5" y1="6.5" x2="6.5" y2="17.5" />
    </svg>
  );
}

function formatResendTimer(secondsLeft: number) {
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function TelegramResendCode({
  secondsLeft,
  onResend,
}: {
  secondsLeft: number;
  onResend: () => void;
}) {
  if (secondsLeft > 0) {
    return (
      <p className="telegram-resend-code" aria-live="polite">
        Отправить код повторно ({formatResendTimer(secondsLeft)})
      </p>
    );
  }

  return (
    <button className="telegram-resend-code telegram-resend-code--ready" onClick={onResend} type="button">
      Отправить код повторно
    </button>
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
