"use client";

import { useState } from "react";
import { useApp } from "@/state/AppContext";
import { postTitle, truncate } from "@/lib/helpers";
import PageHeader from "../PageHeader";

export default function ChatsScreen() {
  const { state, dispatch, openGChat, openPost } = useApp();
  const tab = state.chatsTab;
  const [search, setSearch] = useState("");

  const setTab = (t: "global" | "local") => dispatch({ type: "SET_STATE", patch: { chatsTab: t } });

  const q = search.trim().toLowerCase();
  const globalChats = state.globalChats.filter((c) =>
    !q || c.title.toLowerCase().includes(q) || (c.preview || "").toLowerCase().includes(q),
  );
  const localPosts = state.posts
    .filter((p) => p.chatHistory.length > 0)
    .filter((p) => !q || postTitle(p).toLowerCase().includes(q));

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
            {localPosts.length === 0 ? (
              <div className="empty">
                <div className="eico">📄</div>
                <p>Нет локальных чатов</p>
              </div>
            ) : (
              localPosts.map((p) => {
                const last = p.chatHistory[p.chatHistory.length - 1];
                return (
                  <div key={p.id} className="chat-card" onClick={() => openPost(p.id)}>
                    <div className="chat-card-icon">📄</div>
                    <div className="chat-card-body">
                      <div className="chat-card-title">{postTitle(p)}</div>
                      <div className="chat-card-preview">&quot;{truncate(last.text || "", 55)}&quot;</div>
                    </div>
                    <div className="chat-card-right">
                      <div className="chat-card-date">{p.date || p.created || ""}</div>
                      <button
                        className="to-post-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          openPost(p.id);
                        }}
                        type="button"
                      >
                        → пост
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
}
