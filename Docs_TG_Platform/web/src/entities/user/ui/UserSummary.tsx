"use client";

import type { UserPasswordFlow } from "@/shared/lib/profile/defaultUser";

type Props = {
  nick: string;
  email: string;
  flow: UserPasswordFlow;
  onStartChangePassword: () => void;
};

export default function UserSummary({ nick, email, flow, onStartChangePassword }: Props) {
  return (
    <div className="profile-user-summary">
      <div className="profile-user-summary-row">
        <div className="profile-user-field">
          <div className="profile-label">Ник</div>
          <div className="profile-val">{nick}</div>
        </div>
        <div className="profile-user-field">
          <div className="profile-label">Почта</div>
          <div className="profile-val">{email}</div>
        </div>
      </div>
      {flow === "idle" ? (
        <button type="button" className="profile-user-change-text" onClick={onStartChangePassword}>
          Сменить пароль
        </button>
      ) : null}
    </div>
  );
}
