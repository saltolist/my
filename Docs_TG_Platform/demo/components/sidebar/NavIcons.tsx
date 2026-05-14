import type { ReactNode, SVGProps } from "react";

const stroke = {
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

type IconProps = SVGProps<SVGSVGElement>;

function BaseIcon({ children, ...rest }: IconProps & { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} aria-hidden="true" {...stroke} {...rest}>
      {children}
    </svg>
  );
}

/** Логотип платформы — экран / панель (монохром, currentColor) */
export function NavIconLogo(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <rect x="5" y="3" width="14" height="18" rx="2" ry="2" />
      <line x1="8.5" y1="7.5" x2="15.5" y2="7.5" />
      <line x1="8.5" y1="11" x2="15.5" y2="11" />
      <line x1="8.5" y1="14.5" x2="12.5" y2="14.5" />
    </BaseIcon>
  );
}

/** Лента — карточка между двумя вертикалями и три строки (как в референсе) */
export function NavIconFeed(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <line x1="4" y1="3.5" x2="4" y2="20.5" />
      <line x1="20" y1="3.5" x2="20" y2="20.5" />
      <rect x="7" y="6" width="10" height="12" rx="2.5" ry="2.5" />
      <line x1="8.5" y1="9.25" x2="14.25" y2="9.25" />
      <line x1="8.5" y1="12" x2="12.35" y2="12" />
      <line x1="8.5" y1="14.75" x2="13.85" y2="14.75" />
    </BaseIcon>
  );
}

/** Аналитика — столбчатая диаграмма */
export function NavIconAnalytics(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </BaseIcon>
  );
}

/** Заметки — лист с линиями */
export function NavIconNotes(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="14" y2="17" />
    </BaseIcon>
  );
}

/** Чаты — облако сообщения */
export function NavIconChats(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      <line x1="9" y1="9" x2="15" y2="9" />
      <line x1="9" y1="12" x2="13" y2="12" />
    </BaseIcon>
  );
}

/** Новый чат — плюс */
export function NavIconPlus(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </BaseIcon>
  );
}

/** Профиль — силуэт пользователя */
export function NavIconProfile(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20a8 8 0 0 1 16 0" />
    </BaseIcon>
  );
}
