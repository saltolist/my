import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TG Platform — Demo",
  description: "Демо-версия TG Platform: концептная витрина без бэкенда.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
