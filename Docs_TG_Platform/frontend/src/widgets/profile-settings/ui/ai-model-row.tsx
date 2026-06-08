"use client";

import type { LlmModel } from "@/shared/types";
import { Badge } from "@/shared/ui/badge";
import { Switch } from "@/shared/ui/switch";

export type AiModelRowModel = LlmModel & {
  group: "LLM" | "Web Search" | "Оркестратор";
};

type AiModelRowProps = {
  model: AiModelRowModel;
};

export function AiModelRow({ model }: AiModelRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border/60 px-3 py-2">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">
          {model.provider} / {model.model}
        </p>
        <p className="text-xs text-muted-foreground">{model.group}</p>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant={model.active ? "default" : "secondary"}>
          {model.active ? "Активна" : "Выключена"}
        </Badge>
        <Switch checked={model.active} disabled aria-label="Статус модели" />
      </div>
    </div>
  );
}
