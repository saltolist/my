import { CheckIcon, ClockIcon, PencilIcon } from "../note/NoteHeaderIcons";
import type { Post } from "@/lib/types";

/** Статус поста в подвале карточки (лента и пространство поста). */
export default function PostStatus({
  post,
}: {
  post: Pick<Post, "status" | "date" | "created">;
}) {
  if (post.status === "published") {
    return (
      <span className="post-status">
        <span className="post-status-icon post-status-icon--published" aria-hidden>
          <CheckIcon size="100%" />
        </span>
        <span className="post-status-label">
          Опубликован{post.date ? ` · ${post.date}` : ""}
        </span>
      </span>
    );
  }
  if (post.status === "scheduled") {
    return (
      <span className="post-status">
        <span className="post-status-icon post-status-icon--scheduled" aria-hidden>
          <ClockIcon size="100%" />
        </span>
        <span className="post-status-label">Отложено · {post.date}</span>
      </span>
    );
  }
  return (
    <span className="post-status">
      <span className="post-status-icon" aria-hidden>
        <PencilIcon size="100%" />
      </span>
      <span className="post-status-label">Черновик · создан {post.created}</span>
    </span>
  );
}
