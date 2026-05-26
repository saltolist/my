"use client";

import { useEffect, useMemo, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { flattenVisibleWithPaths, lastAssistantFlatIndex } from "@/lib/chatPaths";
import { isOmnichannelChat, isOmnichannelChatId } from "@/lib/omnichannel";
import { parseAppPath, parseGChatSearchParam } from "@/lib/routes";
import { globalChatById, useApp } from "@/state/AppContext";
import Composer from "../composer/Composer";
import ChatMessage from "../chat/ChatMessage";
import { MenuIconTrash } from "../HeaderMenuIcons";
import { ContextMenu } from "../ContextMenu";
import PageHeaderMenuButton from "../PageHeaderMenuButton";
import PageHeaderOverflow from "../PageHeaderOverflow";
import { routes } from "@/lib/routes";

export default function GlobalChatScreen() {
  const { state, navigateBack, goToHref, dispatch, sendGChat } = useApp();
  const pathname = usePathname() ?? "/";
  const searchParams = useSearchParams();
  const chatId =
    parseAppPath(pathname).gchatId ??
    parseGChatSearchParam(searchParams.get("id")) ??
    state.currentGChatId;
  const chat = globalChatById(state, chatId);
  const omnichannel = chat ? isOmnichannelChat(chat) : isOmnichannelChatId(chatId);
  const messagesRef = useRef<HTMLDivElement>(null);
  const chatHistory = chat?.history;
  const flatMessages = useMemo(() => flattenVisibleWithPaths(chatHistory ?? []), [chatHistory]);
  const lastAssistantFlat = useMemo(() => lastAssistantFlatIndex(flatMessages), [flatMessages]);

  useEffect(() => {
    if (messagesRef.current) messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [flatMessages.length]);

  return (
    <div className="gchat-layout screen-header-host">
          <div className="page-header">
            <div className="page-header-left">
              <PageHeaderMenuButton />
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
              <div className="page-header-actions--desktop">
                <button className="btn btn-ghost btn-sm" onClick={() => navigateBack("chats")} type="button">
                  ← Назад
                </button>
                {omnichannel ? null : (
                  <ContextMenu
                    items={[
                      {
                        label: "Удалить чат",
                        icon: <MenuIconTrash />,
                        danger: true,
                        onClick: () => {
                          if (!chat) return;
                          if (!confirm(`Удалить чат «${chat.title}»?`)) return;
                          dispatch({ type: "DELETE_GLOBAL_CHAT", chatId: chat.id });
                          goToHref(routes.chats(), { replace: true });
                        },
                      },
                    ]}
                  />
                )}
              </div>
              <PageHeaderOverflow
                className="page-header-actions--mobile"
                items={[
                  {
                    label: "Удалить чат",
                    icon: <MenuIconTrash />,
                    danger: true,
                    hidden: omnichannel || !chat,
                    onClick: () => {
                      if (!chat) return;
                      if (!confirm(`Удалить чат «${chat.title}»?`)) return;
                      dispatch({ type: "DELETE_GLOBAL_CHAT", chatId: chat.id });
                      goToHref(routes.chats(), { replace: true });
                    },
                  },
                ]}
              />
            </div>
          </div>
        <div className="gchat-messages" ref={messagesRef}>
          <div className="gchat-messages-pane">
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
      <Composer scope="gchat" onSubmit={sendGChat} />
    </div>
  );
}
