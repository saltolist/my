import type { NoteFile } from "./types";
import { isNoteImageFile } from "./noteDraft";

export type NoteBodySegment =
  | { type: "text"; content: string }
  | { type: "embed"; name: string };

export type LineCell = { type: "text"; content: string } | { type: "embed"; name: string };
export type BodyLine = { cells: LineCell[] };
export type CellPos = { line: number; cell: number };

const EMBED_RE = /\[([^\]]+)\]/g;
export const MAX_IMAGES_PER_EMBED_ROW = 3;

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

export function isTextLine(line: BodyLine): boolean {
  return line.cells.length > 0 && line.cells.every((c) => c.type === "text");
}

export function isEmbedLine(line: BodyLine): boolean {
  return line.cells.length > 0 && line.cells.every((c) => c.type === "embed");
}

/** Текстовые и embed-строки всегда разделены: в одной строке не смешиваются. */
export function segmentsToLines(segments: NoteBodySegment[]): BodyLine[] {
  const lines: BodyLine[] = [];
  let embedBuf: LineCell[] = [];

  const flushEmbeds = () => {
    if (embedBuf.length > 0) {
      lines.push({ cells: embedBuf });
      embedBuf = [];
    }
  };

  for (const seg of segments) {
    if (seg.type === "embed") {
      embedBuf.push({ type: "embed", name: seg.name });
      continue;
    }
    flushEmbeds();
    if (!seg.content) {
      lines.push({ cells: [{ type: "text", content: "" }] });
      continue;
    }
    for (const part of seg.content.split("\n")) {
      lines.push({ cells: [{ type: "text", content: part }] });
    }
  }
  flushEmbeds();
  return lines.length > 0 ? lines : [{ cells: [{ type: "text", content: "" }] }];
}

export function linesToBody(lines: BodyLine[]): string {
  if (!lines.length) return "";
  return lines
    .map((line) => line.cells.map((c) => (c.type === "text" ? c.content : embedToken(c.name))).join(""))
    .join("\n");
}

/** Единый формат body для сравнения и сохранения (разделяет текст и вложения по строкам). */
export function canonicalNoteBody(body: string): string {
  return linesToBody(segmentsToLines(parseNoteBody(body)));
}

export function normalizeNoteBody(body: string, files: NoteFile[]): string {
  return linesToBody(normalizeEmbedImageRows(segmentsToLines(parseNoteBody(body)), files));
}

export function countEmbedRowImages(cells: LineCell[], files: NoteFile[]): number {
  return cells.filter((c) => c.type === "embed" && isImageEmbed(findNoteFile(files, c.name))).length;
}

function splitEmbedCellsToRows(cells: LineCell[], files: NoteFile[]): BodyLine[] {
  const rows: BodyLine[] = [];
  let buf: LineCell[] = [];
  let imageCount = 0;

  for (const cell of cells) {
    if (cell.type !== "embed") {
      buf.push(cell);
      continue;
    }
    const isImg = isImageEmbed(findNoteFile(files, cell.name));
    if (isImg && imageCount >= MAX_IMAGES_PER_EMBED_ROW) {
      if (buf.length) rows.push({ cells: buf });
      buf = [cell];
      imageCount = 1;
    } else {
      buf.push(cell);
      if (isImg) imageCount += 1;
    }
  }
  if (buf.length) rows.push({ cells: buf });
  return rows;
}

export function normalizeEmbedImageRows(lines: BodyLine[], files: NoteFile[]): BodyLine[] {
  return lines.flatMap((line) => (isEmbedLine(line) ? splitEmbedCellsToRows(line.cells, files) : [line]));
}

export function findNoteFile(files: NoteFile[], name: string): NoteFile | undefined {
  return files.find((f) => f.name === name);
}

export function insertEmbedInBody(body: string, offset: number, name: string): string {
  const token = embedToken(name);
  const pos = Math.max(0, Math.min(offset, body.length));
  return body.slice(0, pos) + token + body.slice(pos);
}

function cloneLines(lines: BodyLine[]): BodyLine[] {
  return lines.map((l) => ({ cells: [...l.cells] }));
}

function splitMixedLine(line: BodyLine): BodyLine[] {
  const hasText = line.cells.some((c) => c.type === "text");
  const hasEmbed = line.cells.some((c) => c.type === "embed");
  if (!hasText || !hasEmbed) return [line];

  const out: BodyLine[] = [];
  let embedBuf: LineCell[] = [];
  for (const cell of line.cells) {
    if (cell.type === "text") {
      if (embedBuf.length) {
        out.push({ cells: embedBuf });
        embedBuf = [];
      }
      out.push({ cells: [cell] });
    } else {
      embedBuf.push(cell);
    }
  }
  if (embedBuf.length) out.push({ cells: embedBuf });
  return out;
}

function finalizeLines(lines: BodyLine[], files: NoteFile[]): BodyLine[] {
  const split = lines.flatMap(splitMixedLine);
  const withEmbeds = normalizeEmbedImageRows(split, files);
  const next = withEmbeds
    .map((line) => ({
      cells: line.cells.length > 0 ? line.cells : [{ type: "text" as const, content: "" }],
    }))
    .filter((line) => line.cells.some((c) => (c.type === "text" ? c.content.length > 0 : true)));
  return next.length > 0 ? next : [{ cells: [{ type: "text", content: "" }] }];
}

function adjustBeforeAfterRemoval(lines: BodyLine[], from: CellPos, before: CellPos): CellPos {
  let { line, cell } = before;
  if (from.line < line) line -= 1;
  else if (from.line === line && from.cell < cell) cell -= 1;
  return { line: Math.max(0, line), cell: Math.max(0, cell) };
}

export function isDropNoop(from: CellPos, before: CellPos): boolean {
  return from.line === before.line && (from.cell === before.cell || from.cell + 1 === before.cell);
}

export function moveEmbedAt(lines: BodyLine[], from: CellPos, before: CellPos, files: NoteFile[]): BodyLine[] {
  const src = lines[from.line]?.cells[from.cell];
  if (!src || src.type !== "embed") return lines;
  if (isDropNoop(from, before)) return lines;

  const next = cloneLines(lines);
  next[from.line].cells.splice(from.cell, 1);
  if (next[from.line].cells.length === 0) next.splice(from.line, 1);

  const at = adjustBeforeAfterRemoval(next, from, before);
  const target = next[at.line];
  const isImg = isImageEmbed(findNoteFile(files, src.name));

  if (!target || isTextLine(target)) {
    next.splice(at.line, 0, { cells: [src] });
    return finalizeLines(next, files);
  }

  const imagesInRow = countEmbedRowImages(target.cells, files);
  if (isImg && imagesInRow >= MAX_IMAGES_PER_EMBED_ROW) {
    next.splice(at.line + 1, 0, { cells: [src] });
    return finalizeLines(next, files);
  }

  target.cells.splice(Math.min(at.cell, target.cells.length), 0, src);
  return finalizeLines(next, files);
}

export function insertEmbedAt(lines: BodyLine[], before: CellPos, name: string, files: NoteFile[]): BodyLine[] {
  const next = cloneLines(lines);
  const line = Math.min(before.line, next.length);
  const target = next[line];
  const embed: LineCell = { type: "embed", name };
  const isImg = isImageEmbed(findNoteFile(files, name));

  if (!target || isTextLine(target)) {
    next.splice(line, 0, { cells: [embed] });
    return finalizeLines(next, files);
  }

  const imagesInRow = countEmbedRowImages(target.cells, files);
  if (isImg && imagesInRow >= MAX_IMAGES_PER_EMBED_ROW) {
    next.splice(line + 1, 0, { cells: [embed] });
    return finalizeLines(next, files);
  }

  target.cells.splice(Math.min(before.cell, target.cells.length), 0, embed);
  return finalizeLines(next, files);
}

export function updateTextCell(lines: BodyLine[], pos: CellPos, content: string): BodyLine[] {
  const next = cloneLines(lines);
  const line = next[pos.line];
  if (!line || !isTextLine(line) || line.cells[0]?.type !== "text") return lines;
  line.cells[0] = { type: "text", content };
  return next;
}

export function splitLineAtCaret(lines: BodyLine[], pos: CellPos, offset: number): BodyLine[] {
  const line = lines[pos.line];
  const cell = line?.cells[0];
  if (!line || !isTextLine(line) || cell?.type !== "text") return lines;

  const before = cell.content.slice(0, offset);
  const after = cell.content.slice(offset);
  const next = [
    ...lines.slice(0, pos.line),
    { cells: [{ type: "text" as const, content: before }] },
    { cells: [{ type: "text" as const, content: after }] },
    ...lines.slice(pos.line + 1),
  ];
  return next;
}

export function isImageEmbed(file: NoteFile | undefined): boolean {
  return !!file && isNoteImageFile(file);
}
