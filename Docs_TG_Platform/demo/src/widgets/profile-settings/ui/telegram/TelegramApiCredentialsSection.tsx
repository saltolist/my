"use client";

import ProfileEyeIcon from "@/widgets/profile-settings/ui/ProfileEyeIcon";
import type { TelegramProfileConfig } from "@/shared/types";

type Props = {
  cfg: TelegramProfileConfig;
  apiChangedFromSaved: boolean;
  apiHashVisible: boolean;
  onApiIdChange: (apiId: string) => void;
  onApiHashChange: (apiHash: string) => void;
  onToggleApiHashVisible: () => void;
  onSave: () => void;
  onCancel: () => void;
};

export default function TelegramApiCredentialsSection({
  cfg,
  apiChangedFromSaved,
  apiHashVisible,
  onApiIdChange,
  onApiHashChange,
  onToggleApiHashVisible,
  onSave,
  onCancel,
}: Props) {
  return (
    <div
      className={`telegram-api-credentials${apiChangedFromSaved ? " telegram-api-credentials--dirty" : ""}`}
    >
      <div className="profile-row telegram-api-id-row">
        <div className="profile-label">api_id</div>
        <input
          className="profile-input profile-input-explicit telegram-input telegram-api-id-input"
          value={cfg.apiId}
          placeholder="12345678"
          onChange={(e) => onApiIdChange(e.target.value)}
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
            onChange={(e) => onApiHashChange(e.target.value)}
          />
          <button
            type="button"
            className="profile-api-key-toggle"
            aria-label={apiHashVisible ? "Скрыть api_hash" : "Показать api_hash"}
            title={apiHashVisible ? "Скрыть api_hash" : "Показать api_hash"}
            onClick={onToggleApiHashVisible}
          >
            <ProfileEyeIcon hidden={!apiHashVisible} />
          </button>
        </div>
      </div>

      <div className="profile-action-buttons profile-action-buttons--ai telegram-api-actions">
        <button
          className="btn btn-primary telegram-api-action-btn"
          type="button"
          disabled={!apiChangedFromSaved}
          onClick={onSave}
        >
          Сохранить
        </button>
        <button
          className="btn btn-ghost telegram-api-action-btn telegram-api-action-btn--cancel"
          type="button"
          disabled={!apiChangedFromSaved}
          onClick={onCancel}
        >
          Отменить
        </button>
      </div>
    </div>
  );
}
