"use client";

import ChatListCardMenu from "@/widgets/chat-thread/ui/ChatListCardMenu";
import { chatListAssistantLine, chatListUserLine } from "@/shared/lib/helpers";
import { matchesListContextFilter } from "@/shared/lib/listContextFilter";
import type { NoteListFilter, Post } from "@/shared/types";

type Props = {
  post: Post;
  search: string;
  contextFilter: NoteListFilter;
  onOpenChat: (chatId: number) => void;
};

export default function PostChatsList({ post, search, contextFilter, onOpenChat }: Props) {
  const q = search.trim().toLowerCase();
  const chats = post.chats.filter((c) => {
    if (!matchesListContextFilter(c.ai, contextFilter)) return false;
    if (!q) return true;
    const u = chatListUserLine(c.history, c.title || "Без названия");
    const a = chatListAssistantLine(c.history, c.preview || "");
    return `${u} ${a} ${c.title}`.toLowerCase().includes(q);
  });

  return (
    <div id="post-chats" className="post-chats visible">
      <div className="post-chats-inner">
        {post.chats.length === 0 ? (
          <div className="empty">
            <div className="eico">💬</div>
            <p>Пока нет локальных чатов</p>
          </div>
        ) : chats.length === 0 ? (
          <div className="empty">
            <div className="eico">💬</div>
            <p>{contextFilter === "all" ? "Ничего не найдено" : "Нет чатов по фильтру"}</p>
          </div>
        ) : (
          chats.map((c) => {
            const userLine = chatListUserLine(c.history, c.title || "Без названия");
            const assistantLine = chatListAssistantLine(c.history, c.preview || "");
            return (
              <div key={c.id} className="chat-card" onClick={() => onOpenChat(c.id)}>
                <div className="chat-card-body-row">
                  <div className="chat-card-main">
                    <div className="chat-card-row1">
                      <div className="chat-card-title">{userLine}</div>
                      <div className="chat-card-menu-slot" onClick={(e) => e.stopPropagation()}>
                        <ChatListCardMenu
                          scope="local"
                          postId={post.id}
                          chatId={c.id}
                          title={c.title || "Без названия"}
                        />
                      </div>
                    </div>
                    <div className="chat-card-row2">
                      <div className="chat-card-preview">{assistantLine || "—"}</div>
                      <div className="chat-card-date">{c.date}</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
