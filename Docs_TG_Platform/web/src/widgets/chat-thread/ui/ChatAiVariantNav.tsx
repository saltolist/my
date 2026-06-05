"use client";

import { BrainIcon } from "@/shared/ui/model-picker/ui/ModelPicker";
import { BranchChevronIcon } from "@/entities/message/ui/MessageIcons";

type Props = {
  modelTitle: string;
  canGoPrev: boolean;
  canGoNext: boolean;
  onPrev: () => void;
  onNext: () => void;
};

export default function ChatAiVariantNav({
  modelTitle,
  canGoPrev,
  canGoNext,
  onPrev,
  onNext,
}: Props) {
  return (
    <div className="msg-user-branch-row msg-ai-variant-row">
      <button
        type="button"
        className="msg-user-branch-arrow"
        aria-label={canGoPrev ? "Предыдущая модель" : "Предыдущей модели нет"}
        title={canGoPrev ? "Предыдущая модель" : "Предыдущей модели нет"}
        disabled={!canGoPrev}
        onClick={onPrev}
      >
        <BranchChevronIcon dir="left" />
      </button>
      <span
        className={`ai-msg-model-hint msg-ai-variant-model${modelTitle.trim() ? "" : " msg-ai-variant-model--empty"}`}
        role="img"
        tabIndex={modelTitle.trim() ? 0 : undefined}
        aria-label={modelTitle.trim() ? `Модель: ${modelTitle}` : "Модель"}
        title={modelTitle.trim() || undefined}
        data-tooltip={modelTitle.trim() || undefined}
      >
        <span className="ai-msg-toolbar-model-ico" aria-hidden>
          <BrainIcon />
        </span>
      </span>
      <button
        type="button"
        className="msg-user-branch-arrow"
        aria-label={canGoNext ? "Следующая модель" : "Следующей модели нет"}
        title={canGoNext ? "Следующая модель" : "Следующей модели нет"}
        disabled={!canGoNext}
        onClick={onNext}
      >
        <BranchChevronIcon dir="right" />
      </button>
    </div>
  );
}
