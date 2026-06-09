import type { PreviewDomain } from "@/shared/data/preview-seed";
import {
  RECENT_SIDEBAR_MAX,
  type RecentChatsModel,
  type RecentNoteRow,
  type RecentNotesModel,
  type RecentRow,
} from "@/widgets/sidebar/model/types";

const byChatActivity = (a: RecentRow, b: RecentRow) =>
  b.historyLen - a.historyLen || a.seq - b.seq;

const byNoteActivity = (a: RecentNoteRow, b: RecentNoteRow) =>
  b.weight - a.weight || a.seq - b.seq;

export function buildRecentChatsModel(
  data: PreviewDomain,
  sidebarPostId: number | null,
): RecentChatsModel {
  const globalRows: RecentRow[] = data.globalChats.map((c, seq) => ({
    kind: "global",
    key: `g:${c.id}`,
    id: c.id,
    title: c.title,
    historyLen: c.historyLen,
    seq,
  }));
  globalRows.sort(byChatActivity);

  const inPostSpace =
    sidebarPostId != null && data.posts.some((p) => p.id === sidebarPostId);

  if (!inPostSpace) {
    const allLocal: RecentRow[] = [];
    let seq = 0;
    for (const p of data.posts) {
      for (const c of p.chats) {
        allLocal.push({
          kind: "local",
          key: `l:${p.id}-${c.id}`,
          postId: p.id,
          chatId: c.id,
          title: c.title,
          historyLen: c.historyLen,
          seq: seq++,
        });
      }
    }
    const mixed = [...globalRows, ...allLocal];
    mixed.sort(byChatActivity);
    return { mode: "flat", rows: mixed.slice(0, RECENT_SIDEBAR_MAX) };
  }

  const post = data.posts.find((p) => p.id === sidebarPostId)!;
  const thisPostRows: RecentRow[] = post.chats.map((c, seq) => ({
    kind: "local" as const,
    key: `l:${post.id}-${c.id}`,
    postId: post.id,
    chatId: c.id,
    title: c.title,
    historyLen: c.historyLen,
    seq,
  }));
  thisPostRows.sort(byChatActivity);

  const othersRows: RecentRow[] = [];
  let oSeq = 0;
  for (const c of data.globalChats) {
    othersRows.push({
      kind: "global",
      key: `g:${c.id}`,
      id: c.id,
      title: c.title,
      historyLen: c.historyLen,
      seq: oSeq++,
    });
  }
  for (const p of data.posts) {
    if (p.id === post.id) continue;
    for (const c of p.chats) {
      othersRows.push({
        kind: "local",
        key: `l:${p.id}-${c.id}`,
        postId: p.id,
        chatId: c.id,
        title: c.title,
        historyLen: c.historyLen,
        seq: oSeq++,
      });
    }
  }
  othersRows.sort(byChatActivity);

  return {
    mode: "grouped",
    thisPost: thisPostRows.slice(0, RECENT_SIDEBAR_MAX),
    others: othersRows.slice(0, RECENT_SIDEBAR_MAX),
  };
}

export function buildRecentNotesModel(
  data: PreviewDomain,
  sidebarPostId: number | null,
): RecentNotesModel {
  const globalRows: RecentNoteRow[] = data.globalNotes.map((n, seq) => ({
    key: `g:${n.id}`,
    title: n.title,
    weight: n.body.length,
    seq,
    isGlobal: true,
    id: n.id,
  }));
  globalRows.sort(byNoteActivity);

  const inPostSpace =
    sidebarPostId != null && data.posts.some((p) => p.id === sidebarPostId);

  if (!inPostSpace) {
    const allLocal: RecentNoteRow[] = [];
    let seq = 0;
    for (const p of data.posts) {
      for (const n of p.notes) {
        allLocal.push({
          key: `l:${p.id}-${n.id}`,
          title: n.title,
          weight: n.body.length,
          seq: seq++,
          isGlobal: false,
          id: n.id,
          postId: p.id,
        });
      }
    }
    const mixed = [...globalRows, ...allLocal];
    mixed.sort(byNoteActivity);
    return { mode: "flat", rows: mixed.slice(0, RECENT_SIDEBAR_MAX) };
  }

  const post = data.posts.find((p) => p.id === sidebarPostId)!;
  const thisPostRows: RecentNoteRow[] = post.notes.map((n, seq) => ({
    key: `l:${post.id}-${n.id}`,
    title: n.title,
    weight: n.body.length,
    seq,
    isGlobal: false,
    id: n.id,
    postId: post.id,
  }));
  thisPostRows.sort(byNoteActivity);

  const othersRows: RecentNoteRow[] = [];
  let oSeq = 0;
  for (const n of data.globalNotes) {
    othersRows.push({
      key: `g:${n.id}`,
      title: n.title,
      weight: n.body.length,
      seq: oSeq++,
      isGlobal: true,
      id: n.id,
    });
  }
  for (const p of data.posts) {
    if (p.id === post.id) continue;
    for (const n of p.notes) {
      othersRows.push({
        key: `l:${p.id}-${n.id}`,
        title: n.title,
        weight: n.body.length,
        seq: oSeq++,
        isGlobal: false,
        id: n.id,
        postId: p.id,
      });
    }
  }
  othersRows.sort(byNoteActivity);

  return {
    mode: "grouped",
    thisPost: thisPostRows.slice(0, RECENT_SIDEBAR_MAX),
    others: othersRows.slice(0, RECENT_SIDEBAR_MAX),
  };
}
