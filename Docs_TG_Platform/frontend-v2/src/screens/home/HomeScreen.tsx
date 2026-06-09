"use client";

export function HomeScreen() {
  return (
    <div className="mx-auto flex min-h-full w-full max-w-2xl flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Чем помочь сегодня?</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        Composer и глобальный ИИ-чат — следующий шаг. Пока здесь заглушка тела экрана.
      </p>
      <div className="mt-4 w-full max-w-xl rounded-2xl border border-dashed border-border bg-muted/30 px-4 py-8 text-sm text-muted-foreground">
        Поле ввода (Composer) появится здесь
      </div>
    </div>
  );
}
