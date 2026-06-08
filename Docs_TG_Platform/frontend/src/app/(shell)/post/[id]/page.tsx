import { POST_NEW_SLUG, STATIC_POST_IDS } from "@/shared/lib/staticParams";
import { PostScreen } from "@/screens/post";

export function generateStaticParams() {
  return [...STATIC_POST_IDS, POST_NEW_SLUG].map((id) => ({ id }));
}

export default function PostPage() {
  return <PostScreen />;
}
