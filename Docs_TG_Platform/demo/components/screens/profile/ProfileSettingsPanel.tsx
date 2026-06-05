"use client";

import AiModelsBlock from "@/components/profile/AiModelsBlock";
import SystemPromptBlock from "@/components/profile/SystemPromptBlock";
import TelegramBlock from "@/components/profile/TelegramBlock";
import ThemeBlock from "@/components/profile/ThemeBlock";
import UserBlock from "@/components/profile/UserBlock";

type Props = {
  active: boolean;
  settingsTabActive: boolean;
};

export default function ProfileSettingsPanel({ active, settingsTabActive }: Props) {
  return (
    <div className={`profile-panel profile-panel--settings${active ? " active" : ""}`}>
      <ThemeBlock />
      <UserBlock />
      <AiModelsBlock />
      <SystemPromptBlock active={settingsTabActive} />
      <TelegramBlock />
    </div>
  );
}
