import { CheckIcon, ClockIcon, PencilIcon } from "../note/NoteHeaderIcons";
import type { Post } from "@/lib/types";

/** Иконка статуса поста (SVG). */
export function PostStatusIcon({
  post,
  size = "100%",
}: {
  post: Pick<Post, "status">;
  size?: number | string;
}) {
  if (post.status === "published") {
    return (
      <span className="post-status-icon post-status-icon--published" aria-hidden>
        <CheckIcon size={size} />
      </span>
    );
  }
  if (post.status === "scheduled") {
    return (
      <span className="post-status-icon post-status-icon--scheduled" aria-hidden>
        <ClockIcon size={size} />
      </span>
    );
  }
  return (
    <span className="post-status-icon" aria-hidden>
      <PencilIcon size={size} />
    </span>
  );
}

/** Статус поста в подвале карточки (лента и пространство поста). */
export default function PostStatus({
  post,
}: {
  post: Pick<Post, "status" | "date" | "created">;
}) {
  if (post.status === "published") {
    return (
      <span className="post-status">
        <PostStatusIcon post={post} />
        <span className="post-status-label">
          Опубликован{post.date ? ` · ${post.date}` : ""}
        </span>
      </span>
    );
  }
  if (post.status === "scheduled") {
    return (
      <span className="post-status">
        <PostStatusIcon post={post} />
        <span className="post-status-label">Отложено · {post.date}</span>
      </span>
    );
  }
  return (
    <span className="post-status">
      <PostStatusIcon post={post} />
      <span className="post-status-label">Черновик · создан {post.created}</span>
    </span>
  );
}
