import type { NoteFile } from "./types";
import { isNoteImageFile } from "./noteDraft";

export type NoteBodySegment =
  | { type: "text"; content: string }
  | { type: "embed"; name: string };

export type BodyRow = { type: "text"; content: string } | { type: "embed"; name: string };

const EMBED_RE = /\[([^\]]+)\]/g;

export function embedToken(name: string) {
  return `[${name}]`;
}

export function parseNoteBody(body: string): NoteBodySegment[] {
  if (!body) return [{ type: "text", content: "" }];
  const segments: NoteBodySegment[] = [];
  let last = 0;
  for (const m of body.matchAll(EMBED_RE)) {
    const index = m.index ?? 0;
    if (index > last) {
      segments.push({ type: "text", content: body.slice(last, index) });
    }
    segments.push({ type: "embed", name: m[1] });
    last = index + m[0].length;
  }
  if (last < body.length) {
    segments.push({ type: "text", content: body.slice(last) });
  }
  return segments.length > 0 ? segments : [{ type: "text", content: "" }];
}

export function serializeNoteBody(segments: NoteBodySegment[]): string {
  return segments.map((s) => (s.type === "text" ? s.content : embedToken(s.name))).join("");
}

export function segmentsToRows(segments: NoteBodySegment[]): BodyRow[] {
  const rows: BodyRow[] = [];
  for (const seg of segments) {
    if (seg.type === "embed") {
      rows.push({ type: "embed", name: seg.name });
      continue;
    }
    if (!seg.content) {
      rows.push({ type: "text", content: "" });
      continue;
    }
    for (const line of seg.content.split("\n")) {
      rows.push({ type: "text", content: line });
    }
  }
  return rows.length > 0 ? rows : [{ type: "text", content: "" }];
}

export function rowsToSegments(rows: BodyRow[]): NoteBodySegment[] {
  const segments: NoteBodySegment[] = [];
  let textBuf: string[] = [];

  const flush = () => {
    if (textBuf.length > 0) {
      segments.push({ type: "text", content: textBuf.join("\n") });
      textBuf = [];
    }
  };

  for (const row of rows) {
    if (row.type === "embed") {
      flush();
      segments.push({ type: "embed", name: row.name });
    } else {
      textBuf.push(row.content);
    }
  }
  flush();
  return segments.length > 0 ? segments : [{ type: "text", content: "" }];
}

export function rowsToBody(rows: BodyRow[]): string {
  return serializeNoteBody(rowsToSegments(rows));
}

export function findNoteFile(files: NoteFile[], name: string): NoteFile | undefined {
  return files.find((f) => f.name === name);
}

export function insertEmbedInBody(body: string, offset: number, name: string): string {
  const token = embedToken(name);
  const pos = Math.max(0, Math.min(offset, body.length));
  const before = body.slice(0, pos);
  const after = body.slice(pos);
  const padBefore = before.length > 0 && !before.endsWith("\n") && !before.endsWith(" ") ? "\n" : "";
  const padAfter = after.length > 0 && !after.startsWith("\n") && !after.startsWith(" ") ? "\n" : "";
  return `${before}${padBefore}${token}${padAfter}${after}`;
}

export function moveEmbedAtRow(rows: BodyRow[], fromRow: number, beforeRow: number): BodyRow[] {
  if (fromRow < 0 || fromRow >= rows.length || rows[fromRow]?.type !== "embed") return rows;
  if (beforeRow < 0 || beforeRow > rows.length) return rows;
  if (fromRow === beforeRow || fromRow + 1 === beforeRow) return rows;
  const next = [...rows];
  const [item] = next.splice(fromRow, 1);
  let insertAt = beforeRow;
  if (fromRow < beforeRow) insertAt -= 1;
  next.splice(insertAt, 0, item);
  return next;
}

export function insertEmbedAtRow(rows: BodyRow[], beforeRow: number, name: string): BodyRow[] {
  const pos = Math.max(0, Math.min(beforeRow, rows.length));
  const next = [...rows];
  next.splice(pos, 0, { type: "embed", name });
  return next;
}

export function updateTextRow(rows: BodyRow[], rowIndex: number, content: string): BodyRow[] {
  if (rowIndex < 0 || rowIndex >= rows.length || rows[rowIndex].type !== "text") return rows;
  const next = [...rows];
  next[rowIndex] = { type: "text", content };
  return next;
}

export function splitTextRow(rows: BodyRow[], rowIndex: number, at: number): BodyRow[] {
  if (rowIndex < 0 || rowIndex >= rows.length || rows[rowIndex].type !== "text") return rows;
  const line = rows[rowIndex].content;
  const next = [...rows];
  const before = line.slice(0, at);
  const after = line.slice(at);
  next.splice(rowIndex, 1, { type: "text", content: before }, { type: "text", content: after });
  return next;
}

export function isImageEmbed(file: NoteFile | undefined): boolean {
  return !!file && isNoteImageFile(file);
}
