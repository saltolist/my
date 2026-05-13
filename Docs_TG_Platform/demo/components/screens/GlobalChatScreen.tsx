"use client";

import { useEffect, useRef } from "react";
import { globalChatById, useApp } from "@/state/AppContext";
import Composer from "../composer/Composer";
import ChatMessage from "../chat/ChatMessage";
import { ContextMenu } from "../ContextMenu";

export default function GlobalChatScreen() {
  const { state, navigate, navigateBack, dispatch, sendGChat } = useApp();
  const chat = globalChatById(state, state.currentGChatId);
  const messagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesRef.current) messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [chat?.history.length]);

  return (
    <>
      <div className="page-header">
        <div className="page-header-left">
          <div className="breadcrumb">
            <span className="bc-link" onClick={() => navigateBack("chats")}>
              Чаты
            </span>
            <span>/</span>
            <b>{chat?.title || "—"}</b>
          </div>
        </div>
        <div className="page-header-right">
          <button className="btn btn-ghost btn-sm" onClick={() => navigateBack("chats")} type="button">
            ← Назад
          </button>
          <ContextMenu
            items={[
              {
                label: "Удалить чат",
                icon: "🗑",
                danger: true,
                onClick: () => {
                  if (!chat) return;
                  if (!confirm(`Удалить чат «${chat.title}»?`)) return;
                  dispatch({ type: "DELETE_GLOBAL_CHAT", chatId: chat.id });
                  navigate("chats", { skipHistory: true });
                },
              },
            ]}
          />
        </div>
      </div>
      <div className="gchat-layout">
        <div className="gchat-messages" ref={messagesRef}>
          {chat?.history.map((m, i) => (
            <ChatMessage key={i} message={m} ctx={{ scope: "gchat", entityId: chat.id, index: i }} />
          ))}
        </div>
        <Composer scope="gchat" onSubmit={sendGChat} />
      </div>
    </>
  );
}
