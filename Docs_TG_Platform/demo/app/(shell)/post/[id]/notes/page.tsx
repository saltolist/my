import { STATIC_POST_IDS } from "@/lib/staticParams";
import PostScreen from "@/components/screens/PostScreen";

export function generateStaticParams() {
  return STATIC_POST_IDS.map((id) => ({ id }));
}

export default function PostNotesPage() {
  return <PostScreen />;
}
