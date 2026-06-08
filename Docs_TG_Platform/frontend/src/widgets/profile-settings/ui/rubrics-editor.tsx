"use client";

import type { ChannelProfileRubric } from "@/shared/types";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";

type RubricsEditorProps = {
  rubrics: ChannelProfileRubric[];
  onChange: (rubrics: ChannelProfileRubric[]) => void;
};

export function RubricsEditor({ rubrics, onChange }: RubricsEditorProps) {
  const updateRubric = (id: string, patch: Partial<ChannelProfileRubric>) => {
    onChange(rubrics.map((rubric) => (rubric.id === id ? { ...rubric, ...patch } : rubric)));
  };

  const addRubric = () => {
    const next: ChannelProfileRubric = {
      id: `rubric-${Date.now()}`,
      title: "Новая рубрика",
      description: "",
    };
    onChange([...rubrics, next]);
  };

  const removeRubric = (id: string) => {
    onChange(rubrics.filter((rubric) => rubric.id !== id));
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">Рубрики</h3>
          <p className="text-sm text-muted-foreground">Тематические блоки контента</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addRubric}>
          Добавить
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        {rubrics.map((rubric) => (
          <Card key={rubric.id} size="sm">
            <CardContent className="grid gap-3 pt-0">
              <div className="grid gap-2">
                <Label htmlFor={`rubric-title-${rubric.id}`}>Название</Label>
                <Input
                  id={`rubric-title-${rubric.id}`}
                  value={rubric.title}
                  onChange={(e) => updateRubric(rubric.id, { title: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor={`rubric-desc-${rubric.id}`}>Описание</Label>
                <Textarea
                  id={`rubric-desc-${rubric.id}`}
                  value={rubric.description}
                  onChange={(e) => updateRubric(rubric.id, { description: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="flex justify-end">
                <Button type="button" variant="ghost" size="sm" onClick={() => removeRubric(rubric.id)}>
                  Удалить
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
