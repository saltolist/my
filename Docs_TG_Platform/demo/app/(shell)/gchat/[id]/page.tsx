import { STATIC_GCHAT_IDS } from "@/lib/staticParams";
import GlobalChatScreen from "@/components/screens/GlobalChatScreen";

export function generateStaticParams() {
  return STATIC_GCHAT_IDS.map((id) => ({ id }));
}

export default function GChatPage() {
  return <GlobalChatScreen />;
}
