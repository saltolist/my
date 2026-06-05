"use client";

import ChatsList from "@/components/screens/chats/ChatsList";
import ChatsScreenHeader from "@/components/screens/chats/ChatsScreenHeader";
import { useChatsScreen } from "@/lib/hooks/useChatsScreen";

export default function ChatsScreen() {
  const chats = useChatsScreen();

  return (
    <>
      <ChatsScreenHeader {...chats} />
      <ChatsList {...chats} />
    </>
  );
}
