import {
  initialAiProfileConfig,
  initialChannelProfileConfig,
  initialGlobalChats,
  initialGlobalNotes,
  initialPosts,
} from "@/shared/data/seed-data";
import type { MswStore } from "@/shared/api/msw/store";

function cloneSeed<T>(value: T): T {
  return structuredClone(value);
}

/** Full demo seed (posts, chats, notes, profiles) for @demokanal connect in profile. */
export function importDemoKanalContent(target: MswStore): number {
  target.posts = cloneSeed(initialPosts);
  target.globalChats = cloneSeed(initialGlobalChats);
  target.globalNotes = cloneSeed(initialGlobalNotes);
  target.channelProfile = cloneSeed(initialChannelProfileConfig);
  target.aiProfile = cloneSeed(initialAiProfileConfig);
  return target.posts.length;
}
