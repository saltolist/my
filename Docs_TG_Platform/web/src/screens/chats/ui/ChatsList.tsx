"use client";

import { FilterToolbar, FilterToolbarAction } from "@/widgets/filter-toolbar";
import { GlobalChatCardView, LocalChatCardView } from "@/screens/chats/ui/ChatListCards";
import { routes } from "@/shared/lib/routes";
import type { ChatsScreenState } from "@/screens/chats/model/useChatsScreen";

import { EmptyState } from "@/shared/ui/empty-state";

type Props = {
  data: ChatsScreenState["data"];
  ui: Pick<ChatsScreenState["ui"], "isMobile">;
  actions: Pick<ChatsScreenState["actions"], "openGChat" | "goToHref">;
};

export default function ChatsList({ data, ui, actions }: Props) {
  const { tab, globalChats, localChats } = data;
  const { isMobile } = ui;
  const { openGChat, goToHref } = actions;

  return (
    <div className="chats-page">
      {tab === "global" || tab === "all" ? (
        <FilterToolbar
          className="chats-filter-row"
          width="content"
          action={
            <FilterToolbarAction
              label="Новый чат"
              onClick={() => goToHref(routes.home())}
              className={`filter-tab active chats-new-chat-btn${isMobile ? " filter-tab--dropdown" : ""}`}
              iconClassName="chats-new-chat-btn-icon"
            />
          }
        />
      ) : null}
      <div className="chats-scroll">
        <div className="chats-scroll-inner">
          {tab === "all" ? (
            globalChats.length === 0 && localChats.length === 0 ? (
              <EmptyState icon="💬" message="Нет чатов" />
            ) : (
              <>
                {globalChats.map((c) => (
                  <GlobalChatCardView key={c.id} chat={c} onOpen={openGChat} />
                ))}
                {localChats.map((row) => (
                  <LocalChatCardView
                    key={`${row.postId}-${row.chatId}`}
                    row={row}
                    onNavigate={goToHref}
                  />
                ))}
              </>
            )
          ) : (
            <>
              <div style={{ display: tab === "global" ? "" : "none" }}>
                {globalChats.length === 0 ? (
                  <EmptyState icon="💬" message="Нет глобальных чатов" />
                ) : (
                  globalChats.map((c) => (
                    <GlobalChatCardView key={c.id} chat={c} onOpen={openGChat} />
                  ))
                )}
              </div>
              <div style={{ display: tab === "local" ? "" : "none" }}>
                {localChats.length === 0 ? (
                  <EmptyState icon="📄" message="Нет локальных чатов" />
                ) : (
                  localChats.map((row) => (
                    <LocalChatCardView
                      key={`${row.postId}-${row.chatId}`}
                      row={row}
                      onNavigate={goToHref}
                    />
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
