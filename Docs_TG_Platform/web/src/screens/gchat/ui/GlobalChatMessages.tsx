"use client";

import { ChatMessage } from "@/widgets/chat-thread";
import type { GlobalChatScreenState } from "@/screens/gchat/model/useGlobalChatScreen";

type Props = Pick<
  GlobalChatScreenState,
  "chat" | "flatMessages" | "lastAssistantFlat" | "messagesRef"
>;

export default function GlobalChatMessages({
  chat,
  flatMessages,
  lastAssistantFlat,
  messagesRef,
}: Props) {
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
