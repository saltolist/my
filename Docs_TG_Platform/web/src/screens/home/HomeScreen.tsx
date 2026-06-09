"use client";

import { PlaceholderScreen } from "@/screens/_ui/placeholder-screen";

export function HomeScreen() {
  return (
    <PlaceholderScreen
      title="Чем помочь сегодня?"
      subtitle="Composer и глобальный ИИ-чат — следующий шаг (M2+)."
    >
      <div className="rounded-2xl border border-dashed border-border bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
        Поле ввода (Composer) появится здесь
      </div>
    </PlaceholderScreen>
  );
}
