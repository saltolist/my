import { postTitle } from "@/shared/lib/postTitle";
import type { Post } from "@/shared/types";

type ComposerMentionDropdownProps = {
  posts: Post[];
  onSelect: (postId: number) => void;
};

export function ComposerMentionDropdown({ posts, onSelect }: ComposerMentionDropdownProps) {
  if (posts.length === 0) return null;

  return (
    <div className="absolute bottom-full left-0 z-10 mb-1 max-h-40 w-full overflow-y-auto rounded-lg border bg-popover p-1 shadow-md">
      {posts.slice(0, 6).map((post) => (
        <button
          key={post.id}
          type="button"
          className="flex w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted"
          onClick={() => onSelect(post.id)}
        >
          {postTitle(post)}
        </button>
      ))}
    </div>
  );
}
