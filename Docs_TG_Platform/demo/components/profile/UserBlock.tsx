"use client";

import { useEffect, useRef, useState } from "react";
import { checkPasswordStrength, PASSWORD_REQUIREMENTS_HINT } from "@/lib/check-password-strength";

const DEMO_USER = {
  nick: "researcher",
  email: "demo@tgplatform.local",
} as const;

const RESEND_COOLDOWN_SECONDS = 60;

type PasswordFlow = "idle" | "confirm-send" | "code" | "password";

export default function UserBlock() {
  const [flow, setFlow] = useState<PasswordFlow>("idle");
  const [emailCode, setEmailCode] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordConfirmVisible, setPasswordConfirmVisible] = useState(false);
  const [resendCooldownSec, setResendCooldownSec] = useState(0);
  const resendIntervalRef = useRef<number | null>(null);

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
    if (flow === "code") beginResendCooldown();
    else clearResendCooldown();
    return () => clearResendCooldown();
  }, [flow]);

  useEffect(() => {
    return () => clearResendCooldown();
  }, []);

  const resetFlow = () => {
    setFlow("idle");
    setEmailCode("");
    setPassword("");
    setPasswordConfirm("");
    setPasswordVisible(false);
    setPasswordConfirmVisible(false);
  };

  const startChangePassword = () => {
    setFlow("confirm-send");
    setEmailCode("");
    setPassword("");
    setPasswordConfirm("");
  };

  const sendEmailCode = () => {
    setFlow("code");
    setEmailCode("");
    setPassword("");
    setPasswordConfirm("");
  };

  const resendEmailCode = () => {
    if (resendCooldownSec > 0 || flow !== "code") return;
    beginResendCooldown();
  };

  const confirmEmailCode = () => {
    if (!emailCode.trim()) return;
    setFlow("password");
    setPassword("");
    setPasswordConfirm("");
  };

  const confirmNewPassword = () => {
    const next = password.trim();
    const repeat = passwordConfirm.trim();
    if (!next || next !== repeat || checkPasswordStrength(next).isWeak) return;
    resetFlow();
  };

  const passwordStrength = checkPasswordStrength(password);
  const passwordsMismatch =
    flow === "password" &&
    passwordConfirm.length > 0 &&
    password.trim() !== passwordConfirm.trim();
  const canConfirmPassword =
    password.trim().length > 0 &&
    passwordConfirm.trim().length > 0 &&
    password.trim() === passwordConfirm.trim() &&
    !passwordStrength.isWeak;

  return (
    <div className="profile-section profile-user-section">
      <div className="profile-section-title">Пользователь</div>

      <div className="profile-user-summary">
        <div className="profile-user-summary-row">
          <div className="profile-user-field">
            <div className="profile-label">Ник</div>
            <div className="profile-val">{DEMO_USER.nick}</div>
          </div>
          <div className="profile-user-field">
            <div className="profile-label">Почта</div>
            <div className="profile-val">{DEMO_USER.email}</div>
          </div>
        </div>
        {flow === "idle" ? (
          <button
            type="button"
            className="profile-user-change-text"
            onClick={startChangePassword}
          >
            Сменить пароль
          </button>
        ) : null}
      </div>

      {flow === "confirm-send" ? (
        <div className="profile-user-send-code-prompt">
          <p className="profile-user-send-code-message">
            Код будет отправлен на вашу почту{" "}
            <span className="profile-user-send-code-email">{DEMO_USER.email}</span>
          </p>
          <div className="profile-user-text-actions">
            <button type="button" className="profile-user-change-text" onClick={sendEmailCode}>
              Отправить
            </button>
            <button
              type="button"
              className="profile-user-change-text profile-user-change-text--muted"
              onClick={resetFlow}
            >
              Отменить
            </button>
          </div>
        </div>
      ) : null}

      {flow === "code" ? (
        <div className="profile-row profile-user-code-row">
          <div className="telegram-code-block telegram-desktop-code-block profile-user-code-block">
            <div className="telegram-inline-field-row telegram-desktop-code-inline profile-user-code-inline">
              <EmailCodeInput value={emailCode} onChange={setEmailCode} onDismiss={resetFlow} />
              <button
                type="button"
                className="btn btn-ghost telegram-inline-button"
                onClick={confirmEmailCode}
              >
                Подтвердить
              </button>
            </div>
            <EmailResendCode secondsLeft={resendCooldownSec} onResend={resendEmailCode} />
          </div>
        </div>
      ) : null}

      {flow === "password" ? (
        <div className="profile-user-password-form">
          <p className="profile-user-password-requirements">{PASSWORD_REQUIREMENTS_HINT}</p>
          <div className="profile-row">
            <div className="profile-label">Новый пароль</div>
            <PasswordInput
              autoComplete="new-password"
              placeholder="Введите пароль"
              toggleLabel="новый пароль"
              value={password}
              visible={passwordVisible}
              onChange={setPassword}
              onToggleVisible={() => setPasswordVisible((v) => !v)}
            />
          </div>
          {passwordStrength.message ? (
            <p className="profile-user-password-hint" role="alert">
              {passwordStrength.message}
            </p>
          ) : null}
          <div className="profile-row">
            <div className="profile-label">Повтор пароля</div>
            <PasswordInput
              autoComplete="new-password"
              placeholder="Повторите пароль"
              toggleLabel="повтор пароля"
              value={passwordConfirm}
              visible={passwordConfirmVisible}
              onChange={setPasswordConfirm}
              onToggleVisible={() => setPasswordConfirmVisible((v) => !v)}
            />
          </div>
          {passwordsMismatch ? (
            <p className="profile-user-password-hint" role="alert">
              Пароли не совпадают
            </p>
          ) : null}
          <div className="profile-action-buttons profile-action-buttons--ai profile-user-password-confirm">
            <button
              type="button"
              className="btn btn-ghost telegram-inline-button"
              disabled={!canConfirmPassword}
              onClick={confirmNewPassword}
            >
              Подтвердить
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function PasswordInput({
  value,
  onChange,
  visible,
  onToggleVisible,
  placeholder,
  autoComplete,
  toggleLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  onToggleVisible: () => void;
  placeholder: string;
  autoComplete: string;
  toggleLabel: string;
}) {
  return (
    <div className="telegram-input-wrap profile-user-password-input-wrap">
      <input
        className="profile-input profile-input-explicit telegram-input profile-user-password-input telegram-input-with-toggle"
        type={visible ? "text" : "password"}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button
        type="button"
        className="profile-api-key-toggle"
        aria-label={visible ? `Скрыть ${toggleLabel}` : `Показать ${toggleLabel}`}
        title={visible ? `Скрыть ${toggleLabel}` : `Показать ${toggleLabel}`}
        onClick={onToggleVisible}
      >
        <EyeIcon hidden={!visible} />
      </button>
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

function EmailCodeInput({
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
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        placeholder="Код из почты"
        maxLength={8}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button
        type="button"
        className="telegram-code-input-dismiss"
        aria-label="Отменить смену пароля"
        onClick={onDismiss}
      >
        <CloseIcon size={14} />
      </button>
    </div>
  );
}

function formatResendTimer(secondsLeft: number) {
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function EmailResendCode({
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
