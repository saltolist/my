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
/** Должно совпадать с `--note-embed-image-max-w` в globals.css (превью при перетаскивании). */
export const EMBED_IMAGE_SLOT_W = 400;
export const EMBED_IMAGE_SLOT_H = 200;
export const EMBED_IMAGE_SLOT_GAP = 8;

export function isImageEmbedRow(line: BodyLine, files: NoteFile[]): boolean {
  if (!isEmbedLine(line)) return false;
  return line.cells.some((c) => c.type === "embed" && isImageEmbed(findNoteFile(files, c.name)));
}

export function visibleEmbedIndices(line: BodyLine, lineIndex: number, dragFrom: CellPos | null): number[] {
  const indices: number[] = [];
  for (let ci = 0; ci < line.cells.length; ci++) {
    if (dragFrom?.line === lineIndex && dragFrom.cell === ci) continue;
    indices.push(ci);
  }
  return indices;
}

/** Слот 0..3 (3 = в конец ряда) → dropBefore.cell в исходной строке. */
export function imageGridSlotToDropBefore(
  line: BodyLine,
  lineIndex: number,
  slot: number,
  dragFrom: CellPos | null,
): CellPos {
  const indices = visibleEmbedIndices(line, lineIndex, dragFrom);
  if (slot <= 0) return { line: lineIndex, cell: indices[0] ?? 0 };
  if (slot >= indices.length) return { line: lineIndex, cell: line.cells.length };
  return { line: lineIndex, cell: indices[slot]! };
}

export function dropBeforeToImageSlot(
  line: BodyLine,
  lineIndex: number,
  before: CellPos,
  dragFrom: CellPos | null,
): number {
  const indices = visibleEmbedIndices(line, lineIndex, dragFrom);
  const idx = indices.indexOf(before.cell);
  return idx >= 0 ? idx : indices.length;
}

export type ImageGridSlotItem = {
  cell: LineCell;
  pos: CellPos;
  isPlaceholder: boolean;
};

function orderedSlotsWithPlaceholder(
  others: { cell: LineCell; ci: number }[],
  src: LineCell,
  placeholderPos: CellPos,
  rowLineIndex: number,
  targetSlot: number,
): ImageGridSlotItem[] {
  const ordered: ImageGridSlotItem[] = [];
  const slot = Math.max(0, Math.min(MAX_IMAGES_PER_EMBED_ROW, targetSlot));
  for (let i = 0; i < others.length; i++) {
    if (ordered.length === slot) {
      ordered.push({ cell: src, pos: placeholderPos, isPlaceholder: true });
    }
    ordered.push({
      cell: others[i]!.cell,
      pos: { line: rowLineIndex, cell: others[i]!.ci },
      isPlaceholder: false,
    });
  }
  if (ordered.length === slot) {
    ordered.push({ cell: src, pos: placeholderPos, isPlaceholder: true });
  }
  return ordered;
}

/** Раскладка 3 фиксированных слотов; при DnD — placeholder в insertSlot, без finalizeLines. */
export function buildImageGridSlotLayout(
  line: BodyLine,
  lineIndex: number,
  dragFrom: CellPos | null,
  insertSlot: number | null,
  files: NoteFile[],
  /** Embed с другой строки — показываем placeholder в этой сетке при наведении. */
  incomingEmbed: LineCell | null,
  incomingFrom: CellPos | null,
): (ImageGridSlotItem | null)[] {
  const slots: (ImageGridSlotItem | null)[] = [null, null, null];
  if (!isImageEmbedRow(line, files)) return slots;

  const draggingHere = dragFrom?.line === lineIndex;
  const srcLocal =
    draggingHere && line.cells[dragFrom.cell]?.type === "embed" ? line.cells[dragFrom.cell]! : null;

  const showIncoming =
    !draggingHere &&
    incomingEmbed?.type === "embed" &&
    insertSlot != null &&
    incomingFrom != null;

  if (showIncoming) {
    const others: { cell: LineCell; ci: number }[] = line.cells.map((cell, ci) => ({ cell, ci }));
    /** Слоты 2 и 3 при неполном ряду — одна и та же позиция «в конец»; иначе плейсхолдер то появляется, то пропадает и границы колонок дрожат. */
    const insertCap = Math.min(insertSlot!, others.length);
    const ordered = orderedSlotsWithPlaceholder(
      others,
      incomingEmbed,
      incomingFrom,
      lineIndex,
      insertCap,
    );
    ordered.forEach((item, i) => {
      if (i < MAX_IMAGES_PER_EMBED_ROW) slots[i] = item;
    });
    return slots;
  }

  if (!draggingHere || !srcLocal) {
    line.cells.forEach((cell, ci) => {
      if (ci < MAX_IMAGES_PER_EMBED_ROW) {
        slots[ci] = { cell, pos: { line: lineIndex, cell: ci }, isPlaceholder: false };
      }
    });
    return slots;
  }

  const others: { cell: LineCell; ci: number }[] = [];
  line.cells.forEach((cell, ci) => {
    if (ci === dragFrom.cell) return;
    others.push({ cell, ci });
  });

  const othersCount = others.length;
  const rawInsert = insertSlot ?? dragFrom.cell;
  const targetSlot = Math.min(
    Math.max(0, Math.min(MAX_IMAGES_PER_EMBED_ROW, rawInsert)),
    othersCount,
  );

  const ordered = orderedSlotsWithPlaceholder(others, srcLocal, dragFrom, lineIndex, targetSlot);

  ordered.forEach((item, i) => {
    if (i < MAX_IMAGES_PER_EMBED_ROW) slots[i] = item;
  });
  return slots;
}

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

export type NotePreviewItem =
  | { kind: "gap"; key: string }
  | { kind: "cell"; cell: LineCell; pos: CellPos; isPlaceholder?: boolean };

export type NotePreviewLine = {
  lineKey: string;
  isEmbed: boolean;
  isImageGrid: boolean;
  lineIndex: number;
  items: NotePreviewItem[];
};

function linesWithoutCell(lines: BodyLine[], at: CellPos, files: NoteFile[]): BodyLine[] {
  const next = cloneLines(lines);
  next[at.line]?.cells.splice(at.cell, 1);
  if (next[at.line]?.cells.length === 0) next.splice(at.line, 1);
  return finalizeLines(next, files);
}

function mapPreviewLines(
  displayLines: BodyLine[],
  placeholderName: string | null,
  files: NoteFile[],
): NotePreviewLine[] {
  let marked = false;
  return displayLines.map((line, li) => ({
    lineKey: `line-${li}`,
    isEmbed: isEmbedLine(line),
    isImageGrid: isImageEmbedRow(line, files),
    lineIndex: li,
    items: line.cells.map((cell, ci) => {
      const isPlaceholder =
        !!placeholderName &&
        !marked &&
        cell.type === "embed" &&
        cell.name === placeholderName;
      if (isPlaceholder) marked = true;
      return { kind: "cell" as const, cell, pos: { line: li, cell: ci }, isPlaceholder };
    }),
  }));
}

/** Превью = финальная раскладка после moveEmbedAt; перетаскиваемый элемент — невидимый placeholder. */
export function buildNotePreviewLines(
  lines: BodyLine[],
  dragFrom: CellPos | null,
  dropBefore: CellPos | null,
  files: NoteFile[],
): { lines: NotePreviewLine[]; trailingGap: boolean } {
  if (!dragFrom) {
    if (!dropBefore) {
      return {
        lines: lines.map((line, li) => ({
          lineKey: `line-${li}`,
          isEmbed: isEmbedLine(line),
          isImageGrid: isImageEmbedRow(line, files),
          lineIndex: li,
          items: line.cells.map((cell, ci) => ({ kind: "cell" as const, cell, pos: { line: li, cell: ci } })),
        })),
        trailingGap: false,
      };
    }

    const trailingGap = dropBefore.line === lines.length && dropBefore.cell === 0;
    const previewLines = lines.map((line, li) => {
      const items: NotePreviewItem[] = [];
      if (dropBefore.line === li && dropBefore.cell === 0) {
        items.push({ kind: "gap", key: `gap-line-${li}` });
      }
      if (isTextLine(line)) {
        line.cells.forEach((cell, ci) => {
          items.push({ kind: "cell", cell, pos: { line: li, cell: ci } });
        });
        return { lineKey: `line-${li}`, isEmbed: false, isImageGrid: false, lineIndex: li, items };
      }
      if (isImageEmbedRow(line, files)) {
        const slot =
          dropBefore.line === li
            ? visibleEmbedIndices(line, li, null).indexOf(dropBefore.cell)
            : -1;
        const insertSlot = slot >= 0 ? slot : line.cells.length;
        let visible = 0;
        for (let ci = 0; ci < line.cells.length; ci++) {
          if (visible === insertSlot) items.push({ kind: "gap", key: `gap-${li}-${insertSlot}` });
          items.push({ kind: "cell", cell: line.cells[ci]!, pos: { line: li, cell: ci } });
          visible += 1;
        }
        if (insertSlot >= line.cells.length) items.push({ kind: "gap", key: `gap-after-${li}` });
        return { lineKey: `line-${li}`, isEmbed: true, isImageGrid: true, lineIndex: li, items };
      }
      let gapAt = dropBefore.line === li ? dropBefore.cell : -1;
      let visible = 0;
      for (let ci = 0; ci < line.cells.length; ci++) {
        if (visible === gapAt) items.push({ kind: "gap", key: `gap-${li}-${gapAt}` });
        items.push({ kind: "cell", cell: line.cells[ci]!, pos: { line: li, cell: ci } });
        visible += 1;
      }
      if (dropBefore.line === li && dropBefore.cell === line.cells.length) {
        items.push({ kind: "gap", key: `gap-after-${li}` });
      }
      return { lineKey: `line-${li}`, isEmbed: true, isImageGrid: false, lineIndex: li, items };
    });
    return { lines: previewLines, trailingGap };
  }

  const src = lines[dragFrom.line]?.cells[dragFrom.cell];
  if (!src || src.type !== "embed") {
    return { lines: mapPreviewLines(lines, null, files), trailingGap: false };
  }

  if (!dropBefore || isDropNoop(dragFrom, dropBefore)) {
    return { lines: mapPreviewLines(linesWithoutCell(lines, dragFrom, files), null, files), trailingGap: false };
  }

  const displayLines = moveEmbedAt(lines, dragFrom, dropBefore, files);
  return { lines: mapPreviewLines(displayLines, src.name, files), trailingGap: false };
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

export function moveEmbedToLineBefore(lines: BodyLine[], from: CellPos, lineIndex: number, files: NoteFile[]): BodyLine[] {
  const src = lines[from.line]?.cells[from.cell];
  if (!src || src.type !== "embed") return lines;

  const next = cloneLines(lines);
  next[from.line].cells.splice(from.cell, 1);
  const removedSourceLine = next[from.line]?.cells.length === 0;
  if (removedSourceLine) next.splice(from.line, 1);

  const adjustedLine = removedSourceLine && from.line < lineIndex ? lineIndex - 1 : lineIndex;
  const targetLine = Math.max(0, Math.min(adjustedLine, next.length));
  next.splice(targetLine, 0, { cells: [src] });
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
