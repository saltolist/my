"use client";

import { useCallback, useEffect, useState } from "react";

import type { Post, PostMedia } from "@/shared/types";

export function usePostEditState(post: Post | undefined) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState("");
  const [editMedia, setEditMedia] = useState<PostMedia[]>([]);

  useEffect(() => {
    if (post) {
      setEditText(post.text);
      setEditMedia(post.media ?? []);
    }
  }, [post]);

  const resetEdit = useCallback(() => {
    if (!post) return;
    setEditText(post.text);
    setEditMedia(post.media ?? []);
  }, [post]);

  const cancelEdit = useCallback(() => {
    setIsEditing(false);
    resetEdit();
  }, [resetEdit]);

  return {
    isEditing,
    editText,
    editMedia,
    setEditText,
    startEdit: () => setIsEditing(true),
    finishEdit: () => setIsEditing(false),
    cancelEdit,
  };
}
