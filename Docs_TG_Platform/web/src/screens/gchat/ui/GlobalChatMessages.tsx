"use client";

import type { ChatMessage as ChatMessageType } from "@/shared/types";
import { ChatMessage } from "@/widgets/chat-thread";

type FlatRow = { message: ChatMessageType; path: number[] };

type GlobalChatMessagesProps = {
  chatId: string | null;
  flatMessages: FlatRow[];
  historyRevision: string;
  lastAssistantFlat: number;
  messagesRef: React.RefObject<HTMLDivElement | null>;
};

export function GlobalChatMessages({
  chatId,
  flatMessages,
  historyRevision,
  lastAssistantFlat,
  messagesRef,
}: GlobalChatMessagesProps) {
  if (!chatId) return null;

  return (
    <div className="composer-scroll-wrap">
      <div className="gchat-messages" ref={messagesRef}>
        <div className="composer-scroll-body" key={historyRevision}>
          {flatMessages.map(({ message, path }, i) => (
            <ChatMessage
              key={path.join("-")}
              message={message}
              ctx={{ scope: "gchat", entityId: chatId, path }}
              isLastAssistantMessage={message.role === "ai" && i === lastAssistantFlat}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
