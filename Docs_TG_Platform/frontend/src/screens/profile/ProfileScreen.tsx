"use client";

import { ProfileSettings } from "@/widgets/profile-settings";
import { PageHeader } from "@/widgets/page-header";

export function ProfileScreen() {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <PageHeader title="Профиль" />
      <div className="min-h-0 flex-1 overflow-auto">
        <ProfileSettings />
      </div>
    </div>
  );
}
