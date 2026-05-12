"use client";

import { useEffect, useRef, useState } from "react";
import { useApp } from "@/state/AppContext";
import PostCard from "../feed/PostCard";
import DraftsSection from "../feed/DraftsSection";
import { autoResize, postTitle, readFileAsMedia } from "@/lib/helpers";
import AttachMenu from "../composer/AttachMenu";
import PostMediaBlock from "../post/PostMediaBlock";
import PageHeader from "../PageHeader";
import type { Post, PostMedia } from "@/lib/types";

export default function FeedScreen() {
  const { state, dispatch, openPost } = useApp();
  const [draft, setDraft] = useState("");
  const [pendingMedia, setPendingMedia] = useState<PostMedia[]>([]);
  const [search, setSearch] = useState("");
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (taRef.current) autoResize(taRef.current, 16);
  }, [draft]);

  const q = search.trim().toLowerCase();
  const matchPost = (p: Post) =>
    !q ||
    postTitle(p).toLowerCase().includes(q) ||
    (p.text || "").toLowerCase().includes(q);
  const published = state.posts.filter((p) => p.status === "published" && matchPost(p));
  const scheduled = state.posts.filter((p) => p.status === "scheduled" && matchPost(p));
  const drafts = state.posts.filter((p) => p.status === "draft" && matchPost(p));

  function submitDraft() {
    const text = draft.trim();
    if (!text && pendingMedia.length === 0) return;
    const newPost: Post = {
      id: Date.now(),
      status: "draft",
      created: "только что",
      rubric: null,
      text,
      notes: [],
      chatHistory: [],
      ...(pendingMedia.length > 0 ? { media: [...pendingMedia] } : {}),
    };
    dispatch({ type: "UPDATE_POSTS", posts: [...state.posts, newPost] });
    setDraft("");
    setPendingMedia([]);
  }

  function removePendingMedia(index: number) {
    setPendingMedia((arr) => arr.filter((_, i) => i !== index));
  }

  return (
    <>
      <PageHeader
        title="Лента"
        backTo="home"
        search={
          <input
            type="text"
            className="page-header-search"
            placeholder="Поиск по постам..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        }
      />
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
            {pendingMedia.length > 0 ? (
              <PostMediaBlock media={pendingMedia} onRemove={removePendingMedia} />
            ) : null}
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
                if (e.key === "Backspace" && draft === "" && pendingMedia.length > 0) {
                  e.preventDefault();
                  setPendingMedia((arr) => arr.slice(0, -1));
                }
              }}
            />
            <div className="input-bottom">
              <div className="input-tools">
                <AttachMenu
                  scope="feed"
                  onAttach={async (att) => {
                    if (att.kind === "file" && att.file) {
                      try {
                        const media = await readFileAsMedia(att.file);
                        setPendingMedia((arr) => [...arr, media]);
                      } catch {
                        /* ignore read errors in demo */
                      }
                    }
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
