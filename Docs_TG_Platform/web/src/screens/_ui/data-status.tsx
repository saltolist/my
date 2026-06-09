"use client";

type DataStatusProps = {
  loading?: boolean;
  error?: Error | null;
  count?: number;
  label: string;
};

export function DataStatus({ loading, error, count, label }: DataStatusProps) {
  if (loading) {
    return (
      <p className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
        Загрузка {label}…
      </p>
    );
  }

  if (error) {
    return (
      <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
        Ошибка загрузки {label}: {error.message}
      </p>
    );
  }

  return (
    <p className="rounded-lg border border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
      {label}: {count ?? 0} из seed/MSW
    </p>
  );
}
