"use client";

import { useEffect, useRef, useState } from "react";
import { useApp } from "@/state/AppContext";
import PostCard from "../feed/PostCard";
import DraftsSection from "../feed/DraftsSection";
import { autoResize } from "@/lib/helpers";
import AttachMenu from "../composer/AttachMenu";

export default function FeedScreen() {
  const { state, dispatch, openPost } = useApp();
  const [draft, setDraft] = useState("");
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (taRef.current) autoResize(taRef.current);
  }, [draft]);

  const published = state.posts.filter((p) => p.status === "published");
  const scheduled = state.posts.filter((p) => p.status === "scheduled");
  const drafts = state.posts.filter((p) => p.status === "draft");

  function submitDraft() {
    const text = draft.trim();
    if (!text) return;
    const newPost = {
      id: Date.now(),
      status: "draft" as const,
      created: "только что",
      rubric: null,
      text,
      notes: [],
      chatHistory: [],
    };
    dispatch({ type: "UPDATE_POSTS", posts: [...state.posts, newPost] });
    setDraft("");
  }

  return (
    <>
      <div className="page-header">
        <h2>Лента</h2>
      </div>
      <div className="feed-layout">
        <div className="feed-scroll" id="feed-scroll">
          <div className="feed-inner">
            <div className="feed-section">
              <div className="section-label">Опубликованные</div>
              <div className="feed-section-cards">
                {published.map((p) => (
                  <PostCard key={p.id} post={p} onOpen={() => openPost(p.id)} />
                ))}
              </div>
            </div>
            <div className="feed-section">
              <div className="section-label">Отложенные</div>
              <div className="feed-section-cards">
                {scheduled.map((p) => (
                  <PostCard key={p.id} post={p} onOpen={() => openPost(p.id)} />
                ))}
              </div>
            </div>
            <DraftsSection drafts={drafts} />
          </div>
        </div>
        <div className="input-wrap">
          <div className="input-box">
            <textarea
              ref={taRef}
              id="feed-input"
              placeholder="Написать пост..."
              rows={1}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submitDraft();
                }
              }}
            />
            <div className="input-bottom">
              <div className="input-tools">
                <AttachMenu
                  scope="feed"
                  onAttach={(att) => {
                    const text =
                      att.kind === "file"
                        ? `Прикрепил файл: ${att.name}`
                        : att.kind === "post"
                          ? `@${att.title}`
                          : `Прикрепил медиа из поста «${att.postTitle}»: ${att.media}`;
                    setDraft((v) => (v.trim() ? `${v}\n${text}` : text));
                  }}
                />
              </div>
              <button className="send-btn" onClick={submitDraft} type="button">
                ↑
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
