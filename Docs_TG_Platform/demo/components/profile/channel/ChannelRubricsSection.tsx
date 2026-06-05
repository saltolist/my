"use client";

import {
  FormSection,
  RubricNoteFields,
} from "@/components/profile/channel/ChannelFormPrimitives";
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
    <FormSection
      title="Рубрики"
      action={
        <div className="profile-rubric-actions">
          <button
            className="btn btn-ghost btn-sm profile-rubric-save"
            disabled={!rubricsDirty}
            onClick={onSave}
            type="button"
          >
            Сохранить
          </button>
          {rubricsDirty ? (
            <button className="btn btn-ghost btn-sm" onClick={onReset} type="button">
              Отменить
            </button>
          ) : null}
          <button className="btn btn-ghost btn-sm" onClick={onAddRubric} type="button">
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
              onTitleChange={(title) => onUpdateRubric(rubric.id, { title })}
              onDescriptionChange={(description) => onUpdateRubric(rubric.id, { description })}
              onRemove={() => onRemoveRubric(rubric.id)}
              canRemove={cfg.rubrics.length > 1}
            />
          </div>
        ))}
      </div>
    </FormSection>
  );
}
