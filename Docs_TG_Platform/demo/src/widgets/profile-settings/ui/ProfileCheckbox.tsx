"use client";

import type { InputHTMLAttributes } from "react";

/**
 * Чекбокс профиля: hover-превью галочки не срабатывает сразу после клика,
 * пока курсор не уйдёт со строки и не вернётся.
 */
export default function ProfileCheckbox({
  onChange,
  onMouseLeave,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="checkbox"
      {...props}
      onChange={(e) => {
        e.target.classList.add("profile-checkbox--suppress-hover");
        onChange?.(e);
      }}
      onMouseLeave={(e) => {
        const related = e.relatedTarget as Node | null;
        const row = e.currentTarget.closest("label");
        if (row && related && row.contains(related)) return;
        e.currentTarget.classList.remove("profile-checkbox--suppress-hover");
        onMouseLeave?.(e);
      }}
    />
  );
}
