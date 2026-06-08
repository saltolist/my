import type { PostComment } from "@/shared/types";

type PostCommentRowProps = {
  comment: PostComment;
};

export function PostCommentRow({ comment }: PostCommentRowProps) {
  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">{comment.author}</span>
        <span>{comment.date}</span>
      </div>
      <p className="text-sm whitespace-pre-wrap">{comment.text}</p>
    </div>
  );
}
