import { STATIC_POST_IDS, POST_NEW_SLUG } from "@/lib/staticParams";
import PostScreen from "@/components/screens/PostScreen";

export function generateStaticParams() {
  return [...STATIC_POST_IDS, POST_NEW_SLUG].map((id) => ({ id }));
}

export default function PostPage() {
  return <PostScreen />;
}
