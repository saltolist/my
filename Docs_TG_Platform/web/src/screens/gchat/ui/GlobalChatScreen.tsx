"use client";

import { Composer } from "@/widgets/composer";
import GlobalChatMessages from "@/screens/gchat/ui/GlobalChatMessages";
import GlobalChatScreenHeader from "@/screens/gchat/ui/GlobalChatScreenHeader";
import { useGlobalChatScreen } from "@/screens/gchat/model/useGlobalChatScreen";

export default function GlobalChatScreen() {
  const { data, ui, actions } = useGlobalChatScreen();

  return (
    <>
      <GlobalChatScreenHeader data={data} actions={actions} />
      <div className="gchat-layout">
        <GlobalChatMessages data={data} ui={ui} />
        <Composer scope="gchat" onSubmit={actions.sendGChat} />
      </div>
    </>
  );
}
