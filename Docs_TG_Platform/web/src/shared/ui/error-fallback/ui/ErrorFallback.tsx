"use client";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorFallback({ error, reset }: Props) {
  return (
    <div className="empty" style={{ minHeight: "40vh", padding: "2rem" }}>
      <div className="eico">⚠️</div>
      <p>Что-то пошло не так</p>
      <p style={{ color: "var(--text2)", fontSize: "var(--ui-font-sm)", marginTop: "0.5rem" }}>
        {error.message || "Неизвестная ошибка"}
      </p>
      <button type="button" className="btn btn-ghost btn-sm" onClick={reset} style={{ marginTop: "1rem" }}>
        Попробовать снова
      </button>
    </div>
  );
}
