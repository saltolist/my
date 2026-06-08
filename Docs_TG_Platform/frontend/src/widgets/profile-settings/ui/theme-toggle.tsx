"use client";

import { useEffect } from "react";
import { MoonIcon, MonitorIcon, SunIcon } from "lucide-react";

import { useUiStore } from "@/app/model/store/ui-store";
import type { ThemeMode } from "@/shared/types";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";

function applyTheme(mode: ThemeMode) {
  const root = document.documentElement;
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDark = mode === "dark" || (mode === "system" && prefersDark);
  root.classList.toggle("dark", isDark);
}

export function ThemeToggle() {
  const themePreference = useUiStore((s) => s.themePreference);
  const setThemePreference = useUiStore((s) => s.setThemePreference);

  useEffect(() => {
    applyTheme(themePreference);
  }, [themePreference]);

  const options: { value: ThemeMode; label: string; icon: React.ReactNode }[] = [
    { value: "light", label: "Светлая", icon: <SunIcon className="size-4" /> },
    { value: "dark", label: "Тёмная", icon: <MoonIcon className="size-4" /> },
    { value: "system", label: "Системная", icon: <MonitorIcon className="size-4" /> },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Тема интерфейса</CardTitle>
        <CardDescription>Светлая, тёмная или системная</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {options.map((option) => (
            <Button
              key={option.value}
              type="button"
              variant={themePreference === option.value ? "default" : "outline"}
              size="sm"
              className="gap-1.5"
              onClick={() => setThemePreference(option.value)}
            >
              {option.icon}
              {option.label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
