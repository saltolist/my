"use client";

import ChatsList from "@/screens/chats/ui/ChatsList";
import ChatsScreenHeader from "@/screens/chats/ui/ChatsScreenHeader";
import { useChatsScreen } from "@/screens/chats/model/useChatsScreen";

export default function ChatsScreen() {
  const chats = useChatsScreen();

  return (
    <>
      <ChatsScreenHeader {...chats} />
      <ChatsList {...chats} />
    </>
  );
}
