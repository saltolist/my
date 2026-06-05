"use client";

import Composer from "@/components/composer/Composer";
import GlobalChatMessages from "@/components/screens/gchat/GlobalChatMessages";
import GlobalChatScreenHeader from "@/components/screens/gchat/GlobalChatScreenHeader";
import { useGlobalChatScreen } from "@/lib/hooks/useGlobalChatScreen";

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
