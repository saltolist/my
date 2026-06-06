"use client";

import { GlobalChatCard, LocalChatCard } from "@/entities/chat";
import { ChatListCardMenu } from "@/widgets/chat-thread";
import { NavIconChats, NavIconFeed, NavIconSend } from "@/widgets/sidebar";
import { chatListAssistantLine, chatListUserLine } from "@/shared/lib/helpers";
import { isOmnichannelChat } from "@/shared/lib/omnichannel";
import { routes } from "@/shared/lib/routes";
import type { GlobalChat } from "@/shared/types";
import type { LocalChatRow } from "@/entities/chat";

type GlobalProps = {
  chat: GlobalChat;
  onOpen: (id: string) => void;
};

export function GlobalChatCardView({ chat, onOpen }: GlobalProps) {
  const userLine = chatListUserLine(chat.history, chat.title);
  const assistantLine = chatListAssistantLine(chat.history, chat.preview);
  const omnichannel = isOmnichannelChat(chat);

  return (
    <GlobalChatCard
      userLine={userLine}
      assistantLine={assistantLine}
      date={chat.date}
      onOpen={() => onOpen(chat.id)}
      iconRail={
        omnichannel ? <NavIconSend strokeWidth={1.5} /> : <NavIconChats strokeWidth={1.5} />
      }
      menu={<ChatListCardMenu scope="global" chatId={chat.id} title={chat.title} />}
    />
  );
}

type LocalProps = {
  row: LocalChatRow;
  onNavigate: (href: string) => void;
};

export function LocalChatCardView({ row, onNavigate }: LocalProps) {
  const userLine = chatListUserLine(row.history, row.title);
  const assistantLine = chatListAssistantLine(row.history, row.preview);

  return (
    <LocalChatCard
      userLine={userLine}
      assistantLine={assistantLine}
      date={row.date}
      titleAttr={`Пост: ${row.postTitle}`}
      onOpen={() => onNavigate(routes.post(row.postId, row.chatId))}
      iconRail={<NavIconFeed strokeWidth={1.5} outerStrokeWidth={1.5} />}
      menu={
        <ChatListCardMenu
          scope="local"
          postId={row.postId}
          chatId={row.chatId}
          title={row.title}
        />
      }
    />
  );
}
