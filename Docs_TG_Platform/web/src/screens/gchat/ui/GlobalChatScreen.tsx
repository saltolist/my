"use client";

import { Composer } from "@/widgets/composer";
import GlobalChatMessages from "@/screens/gchat/ui/GlobalChatMessages";
import GlobalChatScreenHeader from "@/screens/gchat/ui/GlobalChatScreenHeader";
import { useGlobalChatScreen } from "@/screens/gchat/model/useGlobalChatScreen";

export default function GlobalChatScreen() {
  const gchat = useGlobalChatScreen();

  return (
    <>
      <GlobalChatScreenHeader {...gchat} />
      <div className="gchat-layout">
        <GlobalChatMessages {...gchat} />
        <Composer scope="gchat" onSubmit={gchat.sendGChat} />
      </div>
    </>
  );
}
