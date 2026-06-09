"use client";

import { Brain } from "lucide-react";

import { Label } from "@/shared/ui/label";
import { Switch } from "@/shared/ui/switch";

type NoteAiPanelProps = {
  ai: boolean;
  readOnly?: boolean;
  onAiChange: (value: boolean) => void;
};

export function NoteAiPanel({ ai, readOnly = false, onAiChange }: NoteAiPanelProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-muted/30 px-4 py-3">
      <Switch
        id="note-ai-toggle"
        checked={ai}
        onCheckedChange={onAiChange}
        disabled={readOnly}
      />
      <Label htmlFor="note-ai-toggle" className="flex cursor-pointer items-center gap-2">
        <Brain className="size-4 text-muted-foreground" />
        Учитывать в контексте ИИ
      </Label>
    </div>
  );
}
