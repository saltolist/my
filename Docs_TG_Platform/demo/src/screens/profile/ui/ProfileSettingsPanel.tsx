"use client";

import AiModelsBlock from "@/widgets/profile-settings/ui/AiModelsBlock";
import SystemPromptBlock from "@/widgets/profile-settings/ui/SystemPromptBlock";
import TelegramBlock from "@/widgets/profile-settings/ui/TelegramBlock";
import ThemeBlock from "@/widgets/profile-settings/ui/ThemeBlock";
import UserBlock from "@/widgets/profile-settings/ui/UserBlock";

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
