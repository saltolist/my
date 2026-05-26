"use client";

import { useState } from "react";
import { useApp } from "@/state/AppContext";
import { postTitle, chatListUserLine, chatListAssistantLine } from "@/lib/helpers";
import PageHeader from "../PageHeader";
import PageHeaderSearchInput from "../PageHeaderSearchInput";
import PageHeaderSelect from "../PageHeaderSelect";
import ChatListCardMenu from "../chat/ChatListCardMenu";
import { NavIconChats, NavIconFeed, NavIconSend } from "@/components/sidebar/NavIcons";
import { isOmnichannelChat } from "@/lib/omnichannel";
import { routes } from "@/lib/routes";
import type { ChatMessage, ChatsTab } from "@/lib/types";

type LocalChatRow = {
  postId: number;
  postTitle: string;
  chatId: number;
  title: string;
  preview: string;
  date: string;
  history: ChatMessage[];
};

export default function ChatsScreen() {
  const { state, dispatch, openGChat, goToHref } = useApp();
  const tab = state.chatsTab;
  const [search, setSearch] = useState("");

  const setTab = (t: ChatsTab) => dispatch({ type: "SET_STATE", patch: { chatsTab: t } });

  const q = search.trim().toLowerCase();
  const globalChats = state.globalChats.filter((c) => {
    if (!q) return true;
    const u = chatListUserLine(c.history, c.title);
    const a = chatListAssistantLine(c.history, c.preview);
    return `${u} ${a}`.toLowerCase().includes(q);
  });
  const localChats: LocalChatRow[] = state.posts
    .flatMap((p) =>
      p.chats.map<LocalChatRow>((c) => ({
        postId: p.id,
        postTitle: postTitle(p),
        chatId: c.id,
        title: c.title || "Без названия",
        preview: c.preview || "",
        date: c.date || "",
        history: c.history,
      })),
    )
    .filter((row) => {
      if (!q) return true;
      const u = chatListUserLine(row.history, row.title);
      const a = chatListAssistantLine(row.history, row.preview);
      return `${u} ${a} ${row.postTitle}`.toLowerCase().includes(q);
    });

  const globalCards = globalChats.map((c) => {
    const userLine = chatListUserLine(c.history, c.title);
    const assistantLine = chatListAssistantLine(c.history, c.preview);
    const omnichannel = isOmnichannelChat(c);
    return (
      <div key={c.id} className="chat-card" onClick={() => openGChat(c.id)}>
        <div className="chat-card-icon-rail" aria-hidden>
          {omnichannel ? <NavIconSend strokeWidth={1.5} /> : <NavIconChats strokeWidth={1.5} />}
        </div>
        <div className="chat-card-body-row">
          <div className="chat-card-main">
            <div className="chat-card-row1">
              <div className="chat-card-title">{userLine}</div>
              <div className="chat-card-menu-slot" onClick={(e) => e.stopPropagation()}>
                <ChatListCardMenu scope="global" chatId={c.id} title={c.title} />
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
  });

  const localCards = localChats.map((row) => {
    const userLine = chatListUserLine(row.history, row.title);
    const assistantLine = chatListAssistantLine(row.history, row.preview);
    return (
      <div
        key={`${row.postId}-${row.chatId}`}
        className="chat-card"
        title={`Пост: ${row.postTitle}`}
        onClick={() => goToHref(routes.post(row.postId, row.chatId))}
      >
        <div className="chat-card-icon-rail" aria-hidden>
          <NavIconFeed strokeWidth={1.5} outerStrokeWidth={1.5} />
        </div>
        <div className="chat-card-body-row">
          <div className="chat-card-main">
            <div className="chat-card-row1">
              <div className="chat-card-title">{userLine}</div>
              <div className="chat-card-menu-slot" onClick={(e) => e.stopPropagation()}>
                <ChatListCardMenu scope="local" postId={row.postId} chatId={row.chatId} title={row.title} />
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
  });

  return (
    <div className="chats-screen-host screen-header-host">
      <PageHeader
        title="Чаты"
        backTo="home"
        mobileSelect={
          <PageHeaderSelect
            ariaLabel="Область чатов"
            value={tab}
            options={[
              { value: "all", label: "Все" },
              { value: "global", label: "Глобальные" },
              { value: "local", label: "Локальные" },
            ]}
            onChange={(v) => setTab(v as typeof tab)}
          />
        }
        search={
          <div className="page-header-search-tools-row">
            <PageHeaderSearchInput
              placeholder="Поиск по чатам..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onDismiss={() => setSearch("")}
            />
            <div
              className="chats-tabs page-header-toolbar--desktop"
              role="tablist"
              aria-label="Область чатов"
            >
              <div
                role="tab"
                aria-selected={tab === "all"}
                className={`chats-tab${tab === "all" ? " active" : ""}`}
                onClick={() => setTab("all")}
              >
                Все
              </div>
              <div
                role="tab"
                aria-selected={tab === "global"}
                className={`chats-tab${tab === "global" ? " active" : ""}`}
                onClick={() => setTab("global")}
              >
                Глобальные
              </div>
              <div
                role="tab"
                aria-selected={tab === "local"}
                className={`chats-tab${tab === "local" ? " active" : ""}`}
                onClick={() => setTab("local")}
              >
                Локальные
              </div>
            </div>
          </div>
        }
      />
      <div className="chats-scroll">
      <div className="chats-scroll-pane">
        <div className="chats-scroll-inner">
          {tab === "all" ? (
            globalChats.length === 0 && localChats.length === 0 ? (
              <div className="empty">
                <div className="eico">💬</div>
                <p>Нет чатов</p>
              </div>
            ) : (
              <>
                {globalCards}
                {localCards}
              </>
            )
          ) : (
            <>
              <div style={{ display: tab === "global" ? "" : "none" }}>
                {globalChats.length === 0 ? (
                  <div className="empty">
                    <div className="eico">💬</div>
                    <p>Нет глобальных чатов</p>
                  </div>
                ) : (
                  globalCards
                )}
              </div>
              <div style={{ display: tab === "local" ? "" : "none" }}>
                {localChats.length === 0 ? (
                  <div className="empty">
                    <div className="eico">📄</div>
                    <p>Нет локальных чатов</p>
                  </div>
                ) : (
                  localCards
                )}
              </div>
            </>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
