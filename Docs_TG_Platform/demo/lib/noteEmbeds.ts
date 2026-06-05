export type {
  BodyLine,
  CellPos,
  ImageGridSlotItem,
  LineCell,
  NoteBodySegment,
  NotePreviewItem,
  NotePreviewLine,
} from "@/lib/noteEmbeds/types";

export {
  EMBED_IMAGE_SLOT_GAP,
  EMBED_IMAGE_SLOT_H,
  EMBED_IMAGE_SLOT_W,
  MAX_IMAGES_PER_EMBED_ROW,
} from "@/lib/noteEmbeds/types";

export { embedToken, parseNoteBody, serializeNoteBody } from "@/lib/noteEmbeds/bodyParse";

export { findNoteFile, isImageEmbed } from "@/lib/noteEmbeds/embedFiles";

export {
  canonicalNoteBody,
  countEmbedRowImages,
  isEmbedLine,
  isImageEmbedRow,
  isTextLine,
  linesToBody,
  normalizeEmbedImageRows,
  normalizeNoteBody,
  segmentsToLines,
} from "@/lib/noteEmbeds/lines";

export {
  buildImageGridSlotLayout,
  dropBeforeToImageSlot,
  imageGridSlotToDropBefore,
  visibleEmbedIndices,
} from "@/lib/noteEmbeds/imageGrid";

export {
  insertEmbedAt,
  insertEmbedInBody,
  isDropNoop,
  moveEmbedAt,
  moveEmbedToImageGridSlot,
  moveEmbedToLineBefore,
} from "@/lib/noteEmbeds/embedMoves";

export { buildNotePreviewLines } from "@/lib/noteEmbeds/preview";

export { splitLineAtCaret, updateTextCell } from "@/lib/noteEmbeds/textEdit";
