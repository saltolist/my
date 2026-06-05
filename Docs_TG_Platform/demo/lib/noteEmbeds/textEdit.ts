import { cloneLines, isTextLine } from "@/lib/noteEmbeds/lines";
import type { BodyLine, CellPos } from "@/lib/noteEmbeds/types";

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
