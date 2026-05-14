"use client";

import { ContextMenu, type CtxMenuItem } from "@/components/ContextMenu";
import { useApp } from "@/state/AppContext";
import MessageTrashIcon from "./MessageTrashIcon";
import MessageRenameIcon from "./MessageRenameIcon";

function MoreDotsTrigger() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <circle cx="5" cy="12" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="19" cy="12" r="2" />
    </svg>
  );
}

type Props =
  | { scope: "global"; chatId: string; title: string }
  | { scope: "local"; postId: number; chatId: number; title: string };

export default function ChatListCardMenu(props: Props) {
  const { dispatch, navigate, state } = useApp();
  const { title } = props;

  const items: CtxMenuItem[] = [
    {
      label: "Переименовать",
      icon: <MessageRenameIcon />,
      onClick: () => {
        const next = window.prompt("Новое название чата", title);
        if (next == null) return;
        const t = next.trim();
        if (!t) return;
        if (props.scope === "global") {
          dispatch({ type: "RENAME_GLOBAL_CHAT", chatId: props.chatId, title: t });
        } else {
          dispatch({
            type: "RENAME_LOCAL_CHAT",
            postId: props.postId,
            chatId: props.chatId,
            title: t,
          });
        }
      },
    },
    {
      label: "Удалить",
      icon: <MessageTrashIcon />,
      danger: true,
      onClick: () => {
        if (!window.confirm(`Удалить чат «${title}»?`)) return;
        if (props.scope === "global") {
          dispatch({ type: "DELETE_GLOBAL_CHAT", chatId: props.chatId });
          if (state.screen === "gchat" && state.currentGChatId === props.chatId) {
            navigate("chats", { skipHistory: true });
          }
        } else {
          dispatch({
            type: "DELETE_LOCAL_CHAT",
            postId: props.postId,
            chatId: props.chatId,
          });
        }
      },
    },
  ];

  return (
    <ContextMenu
      className="chat-card-ctx"
      align="right"
      portal
      triggerAriaLabel="Действия с чатом"
      trigger={<MoreDotsTrigger />}
      items={items}
    />
  );
}
