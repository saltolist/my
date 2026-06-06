"use client";

import { useUi } from "@/app/model/store";

/** Кнопка выдвижения сайдбара в шапке экрана (видна только в адаптиве). */
export default function PageHeaderMenuButton() {
  const { setMobileSidebarOpen } = useUi();
  return (
    <button
      type="button"
      className="page-header-menu-btn"
      onClick={() => setMobileSidebarOpen(true)}
      aria-label="Открыть меню"
    >
      <svg className="page-header-menu-btn-icon" viewBox="0 0 24 24" aria-hidden>
        <path
          d="M5 7h14M5 12h14M5 17h14"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}
