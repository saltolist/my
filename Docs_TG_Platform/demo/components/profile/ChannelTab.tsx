"use client";

import { useEffect, useMemo } from "react";
import type { ReactNode } from "react";
import { useApp } from "@/state/AppContext";
import type { ChannelProfileConfig, ChannelProfileRubric } from "@/lib/types";

export default function ChannelTab({ active }: { active: boolean }) {
  const { state, dispatch, setDirty } = useApp();
  const cfg = state.channelProfileConfig;
  const currentSnapshot = useMemo(() => JSON.stringify(cfg), [cfg]);
  const dirty = currentSnapshot !== state.channelProfileSavedSnapshot;

  useEffect(() => {
    setDirty("profile-channel", dirty);
  }, [dirty, setDirty]);

  useEffect(() => {
    return () => setDirty("profile-channel", false);
  }, [setDirty]);

  const update = (next: ChannelProfileConfig) =>
    dispatch({ type: "UPDATE_CHANNEL_PROFILE", config: next });

  const save = () => {
    if (!dirty) return;
    dispatch({ type: "SET_STATE", patch: { channelProfileSavedSnapshot: currentSnapshot } });
  };

  const reset = () => update(JSON.parse(state.channelProfileSavedSnapshot) as ChannelProfileConfig);

  const updateGroup = <K extends keyof ChannelProfileConfig>(
    group: K,
    patch: Partial<ChannelProfileConfig[K]>,
  ) => update({ ...cfg, [group]: { ...cfg[group], ...patch } });

  const addRubric = () =>
    update({
      ...cfg,
      rubrics: [
        ...cfg.rubrics,
        {
          id: "rubric-" + Date.now(),
          title: "Новая рубрика",
          description: "",
        },
      ],
    });

  const updateRubric = (id: string, patch: Partial<ChannelProfileRubric>) =>
    update({
      ...cfg,
      rubrics: cfg.rubrics.map((rubric) => (rubric.id === id ? { ...rubric, ...patch } : rubric)),
    });

  const removeRubric = (id: string) =>
    update({ ...cfg, rubrics: cfg.rubrics.filter((rubric) => rubric.id !== id) });

  return (
    <div className={`profile-panel${active ? " active" : ""}`}>
      <div className="profile-channel-actions">
        <div>
          <div className="profile-section-title">Канал как база знаний ИИ</div>
          <div className="profile-val profile-muted">
            Всё, что заполнено здесь, становится глобальным контекстом канала и наследуется
            локальными чатами постов.
          </div>
        </div>
        <div className="profile-action-buttons">
          <button className="btn btn-ghost btn-sm" disabled={!dirty} onClick={reset} type="button">
            Отменить
          </button>
          <button className="btn btn-primary btn-sm" disabled={!dirty} onClick={save} type="button">
            Сохранить профиль
          </button>
        </div>
      </div>

      <FormSection title="Ядро канала">
        <div className="profile-grid">
          <Area
            label="О чём канал"
            value={cfg.core.topic}
            onChange={(topic) => updateGroup("core", { topic })}
          />
          <Area
            label="Для кого"
            value={cfg.core.audience}
            onChange={(audience) => updateGroup("core", { audience })}
          />
          <Area
            label="Что обещает читателю"
            value={cfg.core.promise}
            onChange={(promise) => updateGroup("core", { promise })}
          />
          <Area
            label="Угол зрения"
            value={cfg.core.angle}
            onChange={(angle) => updateGroup("core", { angle })}
          />
        </div>
      </FormSection>

      <FormSection title="Голос и формат">
        <div className="profile-grid">
          <Area label="Тон" value={cfg.voice.tone} onChange={(tone) => updateGroup("voice", { tone })} />
          <Area
            label="Базовый формат"
            value={cfg.voice.format}
            onChange={(format) => updateGroup("voice", { format })}
          />
        </div>
        <Area
          label="Характерные фразы"
          value={cfg.voice.phrases}
          onChange={(phrases) => updateGroup("voice", { phrases })}
        />
      </FormSection>

      <FormSection title="Правила">
        <div className="profile-grid">
          <Area
            label="Обязательно"
            value={cfg.rules.must}
            onChange={(must) => updateGroup("rules", { must })}
          />
          <Area
            label="Избегать"
            value={cfg.rules.avoid}
            onChange={(avoid) => updateGroup("rules", { avoid })}
          />
        </div>
      </FormSection>

      <FormSection
        title="Рубрики"
        action={
          <button className="btn btn-primary btn-sm" onClick={addRubric} type="button">
            + Рубрика
          </button>
        }
      >
        {cfg.rubrics.map((rubric, index) => (
          <div className="rubric-editor" key={rubric.id}>
            <div className="rubric-editor-head">
              <div className="rubric-item">
                <div
                  className="rubric-dot"
                  style={{ background: RUBRIC_COLORS[index % RUBRIC_COLORS.length] }}
                />
                <div className="rubric-name">{rubric.title || "Без названия"}</div>
              </div>
              <button
                className="btn btn-danger btn-sm"
                disabled={cfg.rubrics.length <= 1}
                onClick={() => removeRubric(rubric.id)}
                type="button"
              >
                Удалить
              </button>
            </div>
            <div className="profile-grid">
              <Field label="Название" value={rubric.title} onChange={(title) => updateRubric(rubric.id, { title })} />
            </div>
            <Area label="Описание" value={rubric.description} onChange={(description) => updateRubric(rubric.id, { description })} />
          </div>
        ))}
      </FormSection>

      <div className="profile-section profile-section-muted">
        <div className="profile-section-title">
          Технические настройки
        </div>
        <div className="profile-val profile-muted">
          ИИ-движок, системный промпт, метрики ИИ и Telegram подключение редактируются на вкладке
          «Настройки», чтобы не смешивать базу знаний канала с интеграциями демо.
        </div>
      </div>
    </div>
  );
}

const RUBRIC_COLORS = ["var(--accent)", "var(--orange)", "var(--green)", "var(--purple)"];

function FormSection({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="profile-section">
      <div className="profile-section-title">
        {title}
        {action}
      </div>
      {children}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="profile-row">
      <span className="profile-label">{label}</span>
      <input
        className="profile-input profile-input-explicit"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function Area({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="profile-row">
      <span className="profile-label">{label}</span>
      <textarea
        className="profile-input profile-input-explicit profile-textarea profile-textarea-compact"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
