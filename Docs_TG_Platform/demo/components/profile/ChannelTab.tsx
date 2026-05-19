"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import type { ReactNode } from "react";
import MessageTrashIcon from "@/components/chat/MessageTrashIcon";
import { useFitTitleSize } from "@/lib/use-fit-title";
import { useApp } from "@/state/AppContext";
import type { ChannelProfileConfig, ChannelProfileRubric } from "@/lib/types";

export default function ChannelTab({ active }: { active: boolean }) {
  const { state, dispatch, setDirty } = useApp();
  const cfg = state.channelProfileConfig;
  const savedCfg = useMemo(
    () => JSON.parse(state.channelProfileSavedSnapshot) as ChannelProfileConfig,
    [state.channelProfileSavedSnapshot],
  );
  const channelProfileSnapshot = useMemo(
    () => JSON.stringify({ core: cfg.core, voice: cfg.voice, rules: cfg.rules }),
    [cfg.core, cfg.voice, cfg.rules],
  );
  const savedChannelProfileSnapshot = useMemo(
    () => JSON.stringify({ core: savedCfg.core, voice: savedCfg.voice, rules: savedCfg.rules }),
    [savedCfg.core, savedCfg.voice, savedCfg.rules],
  );
  const rubricsSnapshot = useMemo(() => JSON.stringify(cfg.rubrics), [cfg.rubrics]);
  const savedRubricsSnapshot = useMemo(() => JSON.stringify(savedCfg.rubrics), [savedCfg.rubrics]);
  const channelProfileDirty = channelProfileSnapshot !== savedChannelProfileSnapshot;
  const rubricsDirty = rubricsSnapshot !== savedRubricsSnapshot;
  const dirty = channelProfileDirty || rubricsDirty;

  useEffect(() => {
    setDirty("profile-channel", dirty);
  }, [dirty, setDirty]);

  useEffect(() => {
    return () => setDirty("profile-channel", false);
  }, [setDirty]);

  const update = (next: ChannelProfileConfig) =>
    dispatch({ type: "UPDATE_CHANNEL_PROFILE", config: next });

  const saveChannelProfile = () => {
    if (!channelProfileDirty) return;
    dispatch({
      type: "SET_STATE",
      patch: {
        channelProfileSavedSnapshot: JSON.stringify({
          ...savedCfg,
          core: cfg.core,
          voice: cfg.voice,
          rules: cfg.rules,
        }),
      },
    });
  };

  const resetChannelProfile = () => {
    if (!channelProfileDirty) return;
    update({
      ...cfg,
      core: savedCfg.core,
      voice: savedCfg.voice,
      rules: savedCfg.rules,
    });
  };

  const saveRubrics = () => {
    if (!rubricsDirty) return;
    dispatch({
      type: "SET_STATE",
      patch: {
        channelProfileSavedSnapshot: JSON.stringify({
          ...savedCfg,
          rubrics: cfg.rubrics,
        }),
      },
    });
  };

  const resetRubrics = () => {
    if (!rubricsDirty) return;
    update({ ...cfg, rubrics: savedCfg.rubrics });
  };

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
      </div>

      <div className="profile-section profile-channel-combined-section">
        <ChannelSubsection title="Ядро канала">
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
        </ChannelSubsection>

        <div className="profile-channel-divider" />

        <ChannelSubsection title="Голос и формат">
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
        </ChannelSubsection>

        <div className="profile-channel-divider" />

        <ChannelSubsection title="Правила">
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
        </ChannelSubsection>
        <div className="profile-action-buttons profile-action-buttons--ai">
          <button className="btn btn-primary" disabled={!channelProfileDirty} onClick={saveChannelProfile} type="button">
            Сохранить
          </button>
          {channelProfileDirty ? (
            <button className="btn btn-ghost" onClick={resetChannelProfile} type="button">
              Отменить
            </button>
          ) : null}
        </div>
      </div>

      <FormSection
        title="Рубрики"
        action={
          <div className="profile-rubric-actions">
            <button className="btn btn-ghost btn-sm profile-rubric-save" disabled={!rubricsDirty} onClick={saveRubrics} type="button">
              Сохранить
            </button>
            {rubricsDirty ? (
              <button className="btn btn-ghost btn-sm" onClick={resetRubrics} type="button">
                Отменить
              </button>
            ) : null}
            <button className="btn btn-ghost btn-sm" onClick={addRubric} type="button">
              + Рубрика
            </button>
          </div>
        }
      >
        <div className="profile-rubrics-grid">
          {cfg.rubrics.map((rubric) => (
            <div className="rubric-editor" key={rubric.id}>
              <RubricNoteFields
                title={rubric.title}
                description={rubric.description}
                onTitleChange={(title) => updateRubric(rubric.id, { title })}
                onDescriptionChange={(description) => updateRubric(rubric.id, { description })}
                onRemove={() => removeRubric(rubric.id)}
                canRemove={cfg.rubrics.length > 1}
              />
            </div>
          ))}
        </div>
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

function ChannelSubsection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="profile-channel-subsection">
      <div className="profile-subsection-title">{title}</div>
      {children}
    </div>
  );
}

function RubricNoteFields({
  title,
  description,
  onTitleChange,
  onDescriptionChange,
  onRemove,
  canRemove,
}: {
  title: string;
  description: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  useFitTitleSize(titleRef, title, true, { maxSize: 18, minSize: 13 });

  const resizeDescription = () => {
    const textarea = descriptionRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  useLayoutEffect(() => {
    resizeDescription();
  }, [description]);

  const focusDescription = () => {
    const textarea = descriptionRef.current;
    if (!textarea) return;
    textarea.focus();
    const end = textarea.value.length;
    textarea.setSelectionRange(end, end);
  };

  return (
    <div className="rubric-note-fields">
      <div className="rubric-note-title-row">
        <textarea
          ref={titleRef}
          className="rubric-note-title"
          rows={1}
          placeholder="Название"
          value={title}
          onChange={(e) => {
            onTitleChange(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key !== "Enter") return;
            e.preventDefault();
            focusDescription();
          }}
        />
        <button
          className="rubric-note-delete"
          disabled={!canRemove}
          onClick={onRemove}
          type="button"
          aria-label="Удалить рубрику"
          title={canRemove ? "Удалить рубрику" : "Нельзя удалить последнюю рубрику"}
        >
          <MessageTrashIcon />
        </button>
      </div>
      <div className="rubric-note-divider" />
      <textarea
        ref={descriptionRef}
        className="rubric-note-description"
        rows={5}
        placeholder="Описание"
        value={description}
        onChange={(e) => {
          onDescriptionChange(e.target.value);
          requestAnimationFrame(resizeDescription);
        }}
      />
    </div>
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
