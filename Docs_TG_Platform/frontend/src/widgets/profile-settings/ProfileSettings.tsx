"use client";

import { useCallback, useEffect, useState } from "react";

import {
  useChannelProfile,
  useUpdateChannelProfile,
} from "@/entities/channel/model/useProfile";
import type { ChannelProfileConfig } from "@/shared/types";
import { Button } from "@/shared/ui/button";
import { Separator } from "@/shared/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { cn } from "@/shared/lib/utils";

import { AiModelsList } from "./ui/ai-models-list";
import { ChannelProfileForm } from "./ui/channel-profile-form";
import { PlatformAnalyticsPanel } from "./ui/platform-analytics-panel";
import { RubricsEditor } from "./ui/rubrics-editor";
import { TelegramAuthSection } from "./ui/telegram-auth-section";
import { TelegramChannelSection } from "./ui/telegram-channel-section";
import { TelegramOmnibotSection } from "./ui/telegram-omnibot-section";
import { ThemeToggle } from "./ui/theme-toggle";

type ProfileSettingsProps = {
  className?: string;
};

export function ProfileSettings({ className }: ProfileSettingsProps) {
  const { data: channelProfile } = useChannelProfile();
  const updateChannel = useUpdateChannelProfile();

  const [draft, setDraft] = useState<ChannelProfileConfig | null>(null);

  useEffect(() => {
    if (channelProfile) {
      setDraft(structuredClone(channelProfile));
    }
  }, [channelProfile]);

  const handleSave = useCallback(() => {
    if (!draft) return;
    updateChannel.mutate(draft);
  }, [draft, updateChannel]);

  if (!draft) {
    return <p className="p-4 text-sm text-muted-foreground">Загрузка профиля…</p>;
  }

  return (
    <div className={cn("p-4", className)}>
      <Tabs defaultValue="channel">
        <TabsList>
          <TabsTrigger value="channel">Канал</TabsTrigger>
          <TabsTrigger value="settings">Настройки</TabsTrigger>
          <TabsTrigger value="platform">Аналитика платформы</TabsTrigger>
        </TabsList>

        <TabsContent value="channel" className="mt-4">
          <div className="flex flex-col gap-6">
            <ChannelProfileForm config={draft} onChange={setDraft} />
            <Separator />
            <RubricsEditor
              rubrics={draft.rubrics}
              onChange={(rubrics) => setDraft({ ...draft, rubrics })}
            />
            <div className="flex justify-end">
              <Button type="button" onClick={handleSave} disabled={updateChannel.isPending}>
                {updateChannel.isPending ? "Сохранение…" : "Сохранить профиль"}
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <div className="flex flex-col gap-6">
            <AiModelsList />
            <ThemeToggle />
            <TelegramAuthSection />
            <TelegramChannelSection />
            <TelegramOmnibotSection />
          </div>
        </TabsContent>

        <TabsContent value="platform" className="mt-4">
          <PlatformAnalyticsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
