"use client";

import { useState } from "react";
import ProfileResendCode, { useProfileResendCooldown } from "./ProfileResendCode";

const DEMO_USER = {
  nick: "researcher",
  email: "demo@tgplatform.local",
} as const;

type PasswordFlow = "idle" | "code" | "password";

export default function UserBlock() {
  const [flow, setFlow] = useState<PasswordFlow>("idle");
  const [emailCode, setEmailCode] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const codeFlowActive = flow === "code";
  const { secondsLeft: resendCooldownSec, clearCooldown, resend: resendEmailCode } =
    useProfileResendCooldown(codeFlowActive);

  const resetFlow = () => {
    setFlow("idle");
    setEmailCode("");
    setPassword("");
    setPasswordConfirm("");
    clearCooldown();
  };

  const startChangePassword = () => {
    setFlow("code");
    setEmailCode("");
    setPassword("");
    setPasswordConfirm("");
  };

  const confirmEmailCode = () => {
    if (!emailCode.trim()) return;
    clearCooldown();
    setFlow("password");
    setPassword("");
    setPasswordConfirm("");
  };

  const confirmNewPassword = () => {
    const next = password.trim();
    const repeat = passwordConfirm.trim();
    if (!next || next !== repeat) return;
    resetFlow();
  };

  const passwordsMismatch =
    flow === "password" &&
    passwordConfirm.length > 0 &&
    password.trim() !== passwordConfirm.trim();

  return (
    <div className="profile-section profile-user-section">
      <div className="profile-section-title">Пользователь</div>

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
        <div className="profile-user-action-line">
          <button
            type="button"
            className="profile-user-text-action"
            onClick={startChangePassword}
          >
            Сменить пароль
          </button>
        </div>
      ) : null}

      {flow === "code" ? (
        <div className="profile-row profile-user-code-row">
          <div className="profile-label">Код отправлен на вашу почту</div>
          <div className="telegram-inline-field-row telegram-inline-field-row--with-resend profile-user-inline-row">
            <div className="telegram-code-input-field profile-user-code-field">
              <input
                className="profile-input telegram-code-input"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="Код из почты"
                maxLength={8}
                value={emailCode}
                onChange={(e) => setEmailCode(e.target.value)}
              />
              <button
                type="button"
                className="telegram-code-input-dismiss"
                aria-label="Отменить смену пароля"
                onClick={resetFlow}
              >
                <CloseIcon size={14} />
              </button>
            </div>
            <button
              type="button"
              className="btn btn-ghost telegram-inline-button"
              disabled={!emailCode.trim()}
              onClick={confirmEmailCode}
            >
              Подтвердить
            </button>
            <ProfileResendCode secondsLeft={resendCooldownSec} onResend={resendEmailCode} />
          </div>
        </div>
      ) : null}

      {flow === "password" ? (
        <div className="profile-user-password-form">
          <div className="profile-row">
            <div className="profile-label">Новый пароль</div>
            <input
              className="profile-input profile-input-explicit profile-user-password-input"
              type="password"
              autoComplete="new-password"
              placeholder="Введите пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="profile-row">
            <div className="profile-label">Повтор пароля</div>
            <input
              className="profile-input profile-input-explicit profile-user-password-input"
              type="password"
              autoComplete="new-password"
              placeholder="Повторите пароль"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
            />
          </div>
          {passwordsMismatch ? (
            <p className="profile-user-password-hint" role="alert">
              Пароли не совпадают
            </p>
          ) : null}
          <div className="profile-row profile-user-action-row">
            <div className="profile-label" aria-hidden>
              &nbsp;
            </div>
            <button
              type="button"
              className="btn btn-ghost telegram-inline-button"
              disabled={
                !password.trim() ||
                !passwordConfirm.trim() ||
                password.trim() !== passwordConfirm.trim()
              }
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
