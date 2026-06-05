"use client";

import ChatListCardMenu from "@/components/chat/ChatListCardMenu";
import { NavIconChats, NavIconFeed, NavIconSend } from "@/components/sidebar/NavIcons";
import { chatListAssistantLine, chatListUserLine } from "@/lib/helpers";
import { isOmnichannelChat } from "@/lib/omnichannel";
import { routes } from "@/lib/routes";
import type { GlobalChat } from "@/lib/types";
import type { LocalChatRow } from "@/lib/hooks/useChatsScreen";

type GlobalProps = {
  chat: GlobalChat;
  onOpen: (id: string) => void;
};

export function GlobalChatCard({ chat, onOpen }: GlobalProps) {
  const userLine = chatListUserLine(chat.history, chat.title);
  const assistantLine = chatListAssistantLine(chat.history, chat.preview);
  const omnichannel = isOmnichannelChat(chat);

  return (
    <div className="chat-card" onClick={() => onOpen(chat.id)}>
      <div className="chat-card-icon-rail" aria-hidden>
        {omnichannel ? <NavIconSend strokeWidth={1.5} /> : <NavIconChats strokeWidth={1.5} />}
      </div>
      <div className="chat-card-body-row">
        <div className="chat-card-main">
          <div className="chat-card-row1">
            <div className="chat-card-title">{userLine}</div>
            <div className="chat-card-menu-slot" onClick={(e) => e.stopPropagation()}>
              <ChatListCardMenu scope="global" chatId={chat.id} title={chat.title} />
            </div>
          </div>
          <div className="chat-card-row2">
            <div className="chat-card-preview">{assistantLine || "—"}</div>
            <div className="chat-card-date">{chat.date}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

type LocalProps = {
  row: LocalChatRow;
  onNavigate: (href: string) => void;
};

export function LocalChatCard({ row, onNavigate }: LocalProps) {
  const userLine = chatListUserLine(row.history, row.title);
  const assistantLine = chatListAssistantLine(row.history, row.preview);

  return (
    <div
      className="chat-card"
      title={`Пост: ${row.postTitle}`}
      onClick={() => onNavigate(routes.post(row.postId, row.chatId))}
    >
      <div className="chat-card-icon-rail" aria-hidden>
        <NavIconFeed strokeWidth={1.5} outerStrokeWidth={1.5} />
      </div>
      <div className="chat-card-body-row">
        <div className="chat-card-main">
          <div className="chat-card-row1">
            <div className="chat-card-title">{userLine}</div>
            <div className="chat-card-menu-slot" onClick={(e) => e.stopPropagation()}>
              <ChatListCardMenu
                scope="local"
                postId={row.postId}
                chatId={row.chatId}
                title={row.title}
              />
            </div>
          </div>
          <div className="chat-card-row2">
            <div className="chat-card-preview">{assistantLine || "—"}</div>
            <div className="chat-card-date">{row.date}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
