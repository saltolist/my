"use client";

import { useEffect } from "react";
import { AppProvider, useApp } from "@/state/AppContext";
import Sidebar from "./sidebar/Sidebar";
import MobileTopbar from "./sidebar/MobileTopbar";
import HomeScreen from "./screens/HomeScreen";
import GlobalChatScreen from "./screens/GlobalChatScreen";
import FeedScreen from "./screens/FeedScreen";
import PostScreen from "./screens/PostScreen";
import NoteScreen from "./screens/NoteScreen";
import ChatsScreen from "./screens/ChatsScreen";
import NotesScreen from "./screens/NotesScreen";
import AnalyticsScreen from "./screens/AnalyticsScreen";
import ProfileScreen from "./screens/ProfileScreen";

function AppShell() {
  const { state, mobileSidebarOpen, setMobileSidebarOpen } = useApp();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMobileSidebarOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [setMobileSidebarOpen]);

  useEffect(() => {
    document.body.classList.toggle("mobile-sidebar-open", mobileSidebarOpen);
  }, [mobileSidebarOpen]);

  return (
    <div id="app">
      <MobileTopbar />
      <div className="mobile-sidebar-backdrop" onClick={() => setMobileSidebarOpen(false)} />
      <Sidebar />
      <div id="main">
        <Screen active={state.screen === "home"}>
          <HomeScreen />
        </Screen>
        <Screen active={state.screen === "gchat"}>
          <GlobalChatScreen />
        </Screen>
        <Screen active={state.screen === "feed"}>
          <FeedScreen />
        </Screen>
        <Screen active={state.screen === "post"}>
          <PostScreen />
        </Screen>
        <Screen active={state.screen === "note"}>
          <NoteScreen />
        </Screen>
        <Screen active={state.screen === "chats"}>
          <ChatsScreen />
        </Screen>
        <Screen active={state.screen === "notes"}>
          <NotesScreen />
        </Screen>
        <Screen active={state.screen === "analytics"}>
          <AnalyticsScreen />
        </Screen>
        <Screen active={state.screen === "profile"}>
          <ProfileScreen />
        </Screen>
      </div>
    </div>
  );
}

function Screen({ active, children }: { active: boolean; children: React.ReactNode }) {
  return <div className={`screen${active ? " active" : ""}`}>{children}</div>;
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
