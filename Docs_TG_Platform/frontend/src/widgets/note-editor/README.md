# Note editor widget

Rich note editor with inline embeds, image grids, and pointer/drag DnD.

## Structure

```
note-editor/
├── NoteEditor.tsx              # orchestrator (view/edit, AI panel, files)
├── model/
│   ├── useNoteEditorState.ts   # view/edit mode, file pick, cancel
│   ├── useNoteBodyEditor.ts    # composes lines + drag + view mode hooks
│   └── noteBodyEditor/         # embed DnD state machine (ported from legacy)
└── ui/
    ├── note-body-editor.tsx    # canvas + drag float portal
    ├── note-ai-panel.tsx       # AI context toggle
    ├── note-header-toolbar.tsx # title, save, view/edit, attach
    ├── note-files-panel.tsx    # draggable file list → body embeds
    ├── note-hidden-file-input.tsx
    └── noteBodyEditor/         # NoteBodyCanvas, NoteBodyCell, ImageGridLine, …
```

## Embed DnD

- Drop files from `NoteFilesPanel` into body (`application/x-note-embed` MIME)
- Reorder embeds via pointer drag (edit + view modes)
- Image rows auto-layout in 3-column grid
- Styles: `src/app/note-body.css`
