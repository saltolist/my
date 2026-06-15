"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/entities/auth";
import { useAuth } from "@/app/providers/AuthProvider";
import { DEMO_EMAIL, DEMO_PASSWORD } from "@/shared/lib/auth/constants";
import { routes } from "@/shared/lib/routes";
import { getApiErrorMessage } from "@/shared/api/getApiErrorMessage";
import { showToast } from "@/shared/ui/toast";
import {
  AuthField,
  AuthHeaderLink,
  AuthInput,
  AuthPasswordInput,
  AuthPrimaryActions,
  AuthSecondaryLink,
  AuthShell,
} from "@/screens/_ui/auth-shell";

export function LoginScreen() {
  const router = useRouter();
  const { setSession } = useAuth();
  const [email, setEmail] = useState(DEMO_EMAIL);
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      const session = await login({ email: email.trim(), password });
      setSession(session);
      router.replace(routes.feed());
    } catch (error) {
      showToast({
        message: getApiErrorMessage(error, "Не удалось войти"),
        variant: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Вход"
      titleAction={
        <AuthHeaderLink onClick={() => router.push(routes.register())}>Регистрация</AuthHeaderLink>
      }
      subtitle="Демо-аккаунт уже заполнен — нажмите «Войти» или измените данные."
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <AuthField label="Email">
          <AuthInput
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </AuthField>

        <AuthField label="Пароль">
          <AuthPasswordInput
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </AuthField>

        <AuthPrimaryActions className="auth-login-actions">
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? "Вход…" : "Войти"}
          </button>
          <AuthSecondaryLink onClick={() => router.push(routes.loginForgot())}>
            Не помню пароль
          </AuthSecondaryLink>
        </AuthPrimaryActions>
      </form>
    </AuthShell>
  );
}
