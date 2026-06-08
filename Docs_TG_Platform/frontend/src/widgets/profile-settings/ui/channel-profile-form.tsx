"use client";

import type { ChannelProfileConfig } from "@/shared/types";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";

type ChannelProfileFormProps = {
  config: ChannelProfileConfig;
  onChange: (next: ChannelProfileConfig) => void;
};

export function ChannelProfileForm({ config, onChange }: ChannelProfileFormProps) {
  const updateCore = (patch: Partial<ChannelProfileConfig["core"]>) => {
    onChange({ ...config, core: { ...config.core, ...patch } });
  };

  const updateVoice = (patch: Partial<ChannelProfileConfig["voice"]>) => {
    onChange({ ...config, voice: { ...config.voice, ...patch } });
  };

  return (
    <>
      <div>
        <h3 className="text-sm font-semibold">Профиль канала</h3>
        <p className="text-sm text-muted-foreground">
          Контекст для ИИ: тема, аудитория, обещание и тон
        </p>
      </div>

      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="channel-topic">О чём канал</Label>
          <Textarea
            id="channel-topic"
            value={config.core.topic}
            onChange={(e) => updateCore({ topic: e.target.value })}
            rows={2}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="channel-audience">Целевая аудитория</Label>
          <Textarea
            id="channel-audience"
            value={config.core.audience}
            onChange={(e) => updateCore({ audience: e.target.value })}
            rows={3}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="channel-promise">Ценность для аудитории</Label>
          <Textarea
            id="channel-promise"
            value={config.core.promise}
            onChange={(e) => updateCore({ promise: e.target.value })}
            rows={3}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="channel-tone">Тон и стиль</Label>
          <Textarea
            id="channel-tone"
            value={config.voice.tone}
            onChange={(e) => updateVoice({ tone: e.target.value })}
            rows={2}
          />
        </div>
      </div>
    </>
  );
}
