"use client";

import { Brain } from "lucide-react";

import { Label } from "@/shared/ui/label";
import { Switch } from "@/shared/ui/switch";
import { Textarea } from "@/shared/ui/textarea";

type NoteBodyEditorProps = {
  body: string;
  ai: boolean;
  readOnly?: boolean;
  onBodyChange: (value: string) => void;
  onAiChange: (value: boolean) => void;
};

export function NoteBodyEditor({
  body,
  ai,
  readOnly = false,
  onBodyChange,
  onAiChange,
}: NoteBodyEditorProps) {
  return (
    <>
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

      <Textarea
        value={body}
        onChange={(e) => onBodyChange(e.target.value)}
        placeholder="Текст заметки…"
        readOnly={readOnly}
        rows={12}
        className="min-h-[20rem] resize-y text-base leading-relaxed"
        aria-label="Текст заметки"
      />
    </>
  );
}
