"use client";

import { Pencil } from "lucide-react";

import { PostMediaBlock } from "@/entities/post";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";
import type { Post, PostMedia } from "@/shared/types";

export type PostInlineEditorProps = {
  post: Post;
  isEditing: boolean;
  editText: string;
  editMedia: PostMedia[];
  onEditTextChange: (text: string) => void;
  onStartEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
};

export function PostInlineEditor({
  post,
  isEditing,
  editText,
  editMedia,
  onEditTextChange,
  onStartEdit,
  onSave,
  onCancel,
}: PostInlineEditorProps) {
  if (isEditing) {
    return (
      <>
        {editMedia[0] ? (
          <PostMediaBlock media={editMedia[0]} className="bg-transparent" />
        ) : null}
        <Textarea
          value={editText}
          onChange={(e) => onEditTextChange(e.target.value)}
          rows={6}
          placeholder="Текст поста…"
          aria-label="Редактирование поста"
        />
        <div className="flex gap-2">
          <Button size="sm" onClick={onSave}>
            Сохранить
          </Button>
          <Button size="sm" variant="ghost" onClick={onCancel}>
            Отмена
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      {post.media?.[0] ? (
        <PostMediaBlock media={post.media[0]} className="bg-transparent" />
      ) : null}
      <p className="whitespace-pre-wrap text-sm leading-relaxed">
        {post.text || (
          <span className="italic text-muted-foreground">
            Пост пустой — начни писать…
          </span>
        )}
      </p>
      <Button size="sm" variant="outline" className="w-fit" onClick={onStartEdit}>
        <Pencil className="size-3.5" />
        Редактировать
      </Button>
    </>
  );
}
