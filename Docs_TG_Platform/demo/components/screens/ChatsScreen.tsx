"use client";

import { useState } from "react";
import { useApp } from "@/state/AppContext";
import { postTitle, truncate } from "@/lib/helpers";
import PageHeader from "../PageHeader";

type LocalChatRow = {
  postId: number;
  postTitle: string;
  chatId: number;
  title: string;
  preview: string;
  date: string;
};

export default function ChatsScreen() {
  const { state, dispatch, openGChat, openPost, navigateWithState } = useApp();
  const tab = state.chatsTab;
  const [search, setSearch] = useState("");

  const setTab = (t: "global" | "local") => dispatch({ type: "SET_STATE", patch: { chatsTab: t } });

  const q = search.trim().toLowerCase();
  const globalChats = state.globalChats.filter((c) =>
    !q || c.title.toLowerCase().includes(q) || (c.preview || "").toLowerCase().includes(q),
  );
  const localChats: LocalChatRow[] = state.posts.flatMap((p) =>
    p.chats.map<LocalChatRow>((c) => ({
      postId: p.id,
      postTitle: postTitle(p),
      chatId: c.id,
      title: c.title || "Без названия",
      preview: c.preview || "",
      date: c.date || "",
    })),
  ).filter(
    (row) =>
      !q ||
      row.title.toLowerCase().includes(q) ||
      row.postTitle.toLowerCase().includes(q) ||
      row.preview.toLowerCase().includes(q),
  );

  return (
    <>
      <PageHeader
        title="Чаты"
        backTo="home"
        search={
          <input
            type="text"
            className="page-header-search"
            placeholder="Поиск по чатам..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        }
      />
      <div className="chats-scroll">
        <div className="chats-scroll-inner">
          <div className="chats-tabs">
            <div className={`chats-tab${tab === "global" ? " active" : ""}`} onClick={() => setTab("global")}>
              Глобальные
            </div>
            <div className={`chats-tab${tab === "local" ? " active" : ""}`} onClick={() => setTab("local")}>
              Локальные
            </div>
          </div>
          <div style={{ display: tab === "global" ? "" : "none" }}>
            {globalChats.length === 0 ? (
              <div className="empty">
                <div className="eico">💬</div>
                <p>Нет глобальных чатов</p>
              </div>
            ) : (
              globalChats.map((c) => (
                <div key={c.id} className="chat-card" onClick={() => openGChat(c.id)}>
                  <div className="chat-card-icon">✦</div>
                  <div className="chat-card-body">
                    <div className="chat-card-title">{c.title}</div>
                    <div className="chat-card-preview">&quot;{c.preview}&quot;</div>
                  </div>
                  <div className="chat-card-right">
                    <div className="chat-card-date">{c.date}</div>
                    <button
                      className="chat-del-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!confirm("Удалить чат?")) return;
                        dispatch({ type: "DELETE_GLOBAL_CHAT", chatId: c.id });
                      }}
                      type="button"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          <div style={{ display: tab === "local" ? "" : "none" }}>
            {localChats.length === 0 ? (
              <div className="empty">
                <div className="eico">📄</div>
                <p>Нет локальных чатов</p>
              </div>
            ) : (
              localChats.map((row) => (
                <div
                  key={`${row.postId}-${row.chatId}`}
                  className="chat-card"
                  onClick={() =>
                    navigateWithState({
                      currentPostId: row.postId,
                      currentPostChatId: row.chatId,
                      postMode: "chat",
                      postViewStack: [],
                      isEditing: false,
                      screen: "post",
                    })
                  }
                >
                  <div className="chat-card-icon">💬</div>
                  <div className="chat-card-body">
                    <div className="chat-card-title">{row.title}</div>
                    <div className="chat-card-preview">
                      <span className="chat-card-post">{row.postTitle}</span> · &quot;
                      {truncate(row.preview, 50)}&quot;
                    </div>
                  </div>
                  <div className="chat-card-right">
                    <div className="chat-card-date">{row.date}</div>
                    <button
                      className="to-post-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        openPost(row.postId);
                      }}
                      type="button"
                    >
                      → пост
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
