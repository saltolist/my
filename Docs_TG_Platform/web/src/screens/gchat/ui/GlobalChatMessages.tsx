"use client";

import { ChatMessage } from "@/widgets/chat-thread";
import type { GlobalChatScreenState } from "@/screens/gchat/model/useGlobalChatScreen";

type Props = {
  data: Pick<
    GlobalChatScreenState["data"],
    "chat" | "flatMessages" | "lastAssistantFlat"
  >;
  ui: Pick<GlobalChatScreenState["ui"], "messagesRef">;
};

export default function GlobalChatMessages({ data, ui }: Props) {
  const { chat, flatMessages, lastAssistantFlat } = data;
  const { messagesRef } = ui;

  return (
    <div className="composer-scroll-wrap">
      <div className="gchat-messages" ref={messagesRef}>
        <div className="composer-scroll-body">
          {chat
            ? flatMessages.map(({ message: m, path }, i) => (
                <ChatMessage
                  key={path.join("-")}
                  message={m}
                  ctx={{ scope: "gchat", entityId: chat.id, path }}
                  isLastAssistantMessage={m.role === "ai" && i === lastAssistantFlat}
                />
              ))
            : null}
        </div>
      </div>
    </div>
  );
}
