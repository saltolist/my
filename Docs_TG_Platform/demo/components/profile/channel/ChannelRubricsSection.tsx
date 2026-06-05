"use client";

import { RubricNoteFields } from "@/components/profile/channel/ChannelFormPrimitives";
import type { ChannelProfileConfig } from "@/lib/types";

type Props = {
  cfg: ChannelProfileConfig;
  rubricsDirty: boolean;
  onAddRubric: () => void;
  onUpdateRubric: (id: string, patch: { title?: string; description?: string }) => void;
  onRemoveRubric: (id: string) => void;
  onSave: () => void;
  onReset: () => void;
};

export default function ChannelRubricsSection({
  cfg,
  rubricsDirty,
  onAddRubric,
  onUpdateRubric,
  onRemoveRubric,
  onSave,
  onReset,
}: Props) {
  return (
    <div className="profile-section profile-rubrics-section">
      <div className="profile-section-title">Рубрики</div>
      <div className="profile-rubrics-grid">
        {cfg.rubrics.map((rubric) => (
          <div className="rubric-editor" key={rubric.id}>
            <RubricNoteFields
              title={rubric.title}
              description={rubric.description}
              onTitleChange={(title) => onUpdateRubric(rubric.id, { title })}
              onDescriptionChange={(description) => onUpdateRubric(rubric.id, { description })}
              onRemove={() => onRemoveRubric(rubric.id)}
              canRemove={cfg.rubrics.length > 1}
            />
          </div>
        ))}
      </div>
      <div className="profile-action-buttons profile-action-buttons--ai">
        <button className="btn btn-ghost" onClick={onAddRubric} type="button">
          + Рубрика
        </button>
        <button className="btn btn-primary" disabled={!rubricsDirty} onClick={onSave} type="button">
          Сохранить
        </button>
        {rubricsDirty ? (
          <button className="btn btn-ghost" onClick={onReset} type="button">
            Отменить
          </button>
        ) : null}
      </div>
    </div>
  );
}
