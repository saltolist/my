import type { Metadata, Viewport } from "next";
import "./styles/globals.css";
import "./styles/media.css";
import "./styles/filter-toolbar.css";
import "./styles/profile.css";
import "./styles/analytics.css";
import "./styles/post.css";
import "./styles/notes.css";
import "./styles/feed.css";
import "./styles/chats.css";
import "./styles/gchat.css";

export const metadata: Metadata = {
  title: "TG Platform",
  description: "Платформа для ведения Telegram-канала с ИИ: лента, посты, чаты, заметки, аналитика.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
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
