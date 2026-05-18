"use client";

import type { InputHTMLAttributes } from "react";

/**
 * Чекбокс профиля: hover-подсветка галочки не срабатывает сразу после включения,
 * пока курсор не уйдёт и не вернётся.
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
        if (e.target.checked) {
          e.target.classList.add("profile-checkbox--suppress-hover");
        } else {
          e.target.classList.remove("profile-checkbox--suppress-hover");
        }
        onChange?.(e);
      }}
      onMouseLeave={(e) => {
        e.currentTarget.classList.remove("profile-checkbox--suppress-hover");
        onMouseLeave?.(e);
      }}
    />
  );
}
