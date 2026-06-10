import { initialGlobalChats } from "@/shared/data/seed-data";

/** Legacy `/gchat/{id}/` — RouteSync redirects to `/gchat/?id={id}`. */
export function generateStaticParams() {
  return initialGlobalChats.map((chat) => ({ id: chat.id }));
}

export default function GChatLegacyPage() {
  return null;
}
