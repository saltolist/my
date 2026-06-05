"use client";

import { MenuIconPlus } from "@/widgets/page-header/ui/HeaderMenuIcons";
import { GlobalChatCard, LocalChatCard } from "@/screens/chats/ui/ChatListCards";
import { routes } from "@/shared/lib/routes";
import type { ChatsScreenState } from "@/screens/chats/model/useChatsScreen";

type Props = Pick<
  ChatsScreenState,
  "tab" | "isMobile" | "globalChats" | "localChats" | "openGChat" | "goToHref"
>;

function ChatsEmpty({ icon, message }: { icon: string; message: string }) {
  return (
    <div className="empty">
      <div className="eico">{icon}</div>
      <p>{message}</p>
    </div>
  );
}

export default function ChatsList({
  tab,
  isMobile,
  globalChats,
  localChats,
  openGChat,
  goToHref,
}: Props) {
  return (
    <div className="chats-page">
      {tab === "global" || tab === "all" ? (
        <div className="chats-filter-row">
          <button
            type="button"
            className={`filter-tab active chats-new-chat-btn${isMobile ? " filter-tab--dropdown" : ""}`}
            onClick={() => goToHref(routes.home())}
          >
            <span className="chats-new-chat-btn-icon" aria-hidden>
              <MenuIconPlus size={12} strokeWidth={2} />
            </span>
            <span>Новый чат</span>
          </button>
        </div>
      ) : null}
      <div className="chats-scroll">
        <div className="chats-scroll-inner">
          {tab === "all" ? (
            globalChats.length === 0 && localChats.length === 0 ? (
              <ChatsEmpty icon="💬" message="Нет чатов" />
            ) : (
              <>
                {globalChats.map((c) => (
                  <GlobalChatCard key={c.id} chat={c} onOpen={openGChat} />
                ))}
                {localChats.map((row) => (
                  <LocalChatCard
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
                  <ChatsEmpty icon="💬" message="Нет глобальных чатов" />
                ) : (
                  globalChats.map((c) => (
                    <GlobalChatCard key={c.id} chat={c} onOpen={openGChat} />
                  ))
                )}
              </div>
              <div style={{ display: tab === "local" ? "" : "none" }}>
                {localChats.length === 0 ? (
                  <ChatsEmpty icon="📄" message="Нет локальных чатов" />
                ) : (
                  localChats.map((row) => (
                    <LocalChatCard
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
