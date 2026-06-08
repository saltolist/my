"use client";

import { useMemo } from "react";
import { BrainIcon } from "lucide-react";

import { useAiProfile } from "@/entities/channel/model/useProfile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";

import { AiModelRow, type AiModelRowModel } from "./ai-model-row";

export function AiModelsList() {
  const { data: aiProfile } = useAiProfile();

  const allModels = useMemo((): AiModelRowModel[] => {
    if (!aiProfile) return [];
    return [
      ...aiProfile.llmModels.map((m) => ({ ...m, group: "LLM" as const })),
      ...aiProfile.webSearchModels.map((m) => ({ ...m, group: "Web Search" as const })),
      ...aiProfile.orchestratorModels.map((m) => ({ ...m, group: "Оркестратор" as const })),
    ];
  }, [aiProfile]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BrainIcon className="size-4" />
          Модели ИИ
        </CardTitle>
        <CardDescription>Активные LLM и сервисы поиска</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {allModels.map((model) => (
          <AiModelRow key={model.id} model={model} />
        ))}
      </CardContent>
    </Card>
  );
}
