"use client";

import ChatsList from "@/screens/chats/ui/ChatsList";
import ChatsScreenHeader from "@/screens/chats/ui/ChatsScreenHeader";
import { useChatsScreen } from "@/screens/chats/model/useChatsScreen";

export default function ChatsScreen() {
  const { data, ui, actions } = useChatsScreen();

  return (
    <>
      <ChatsScreenHeader ui={ui} />
      <ChatsList data={data} ui={ui} actions={actions} />
    </>
  );
}
