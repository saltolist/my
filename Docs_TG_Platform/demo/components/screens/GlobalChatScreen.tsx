"use client";

import { useEffect, useMemo, useRef } from "react";
import { flattenVisibleWithPaths, lastAssistantFlatIndex } from "@/lib/chatPaths";
import { isOmnichannelChat, isOmnichannelChatId } from "@/lib/omnichannel";
import { globalChatById, useApp } from "@/state/AppContext";
import Composer from "../composer/Composer";
import ChatMessage from "../chat/ChatMessage";
import { ContextMenu } from "../ContextMenu";

export default function GlobalChatScreen() {
  const { state, navigate, navigateBack, dispatch, sendGChat } = useApp();
  const chat = globalChatById(state, state.currentGChatId);
  const omnichannel = chat ? isOmnichannelChat(chat) : isOmnichannelChatId(state.currentGChatId);
  const messagesRef = useRef<HTMLDivElement>(null);
  const chatHistory = chat?.history;
  const flatMessages = useMemo(() => flattenVisibleWithPaths(chatHistory ?? []), [chatHistory]);
  const lastAssistantFlat = useMemo(() => lastAssistantFlatIndex(flatMessages), [flatMessages]);

  useEffect(() => {
    if (messagesRef.current) messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [flatMessages.length]);

  return (
    <>
      <div className="page-header">
        <div className="page-header-left">
          <div className="breadcrumb">
            <span className="bc-link" onClick={() => navigateBack("chats")}>
              Чаты
            </span>
            <span className="bc-sep">/</span>
            <span className="crumb-current">{chat?.title || "—"}</span>
          </div>
        </div>
        <div className="page-header-center" aria-hidden="true" />
        <div className="page-header-right">
          <button className="btn btn-ghost btn-sm" onClick={() => navigateBack("chats")} type="button">
            ← Назад
          </button>
          {omnichannel ? null : (
            <ContextMenu
              items={[
                {
                  label: "Удалить чат",
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
          )}
        </div>
      </div>
      <div className="gchat-layout">
        <div className="gchat-messages" ref={messagesRef}>
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
        <Composer scope="gchat" onSubmit={sendGChat} />
      </div>
    </>
  );
}
