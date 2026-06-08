# widgets/note-editor

Full-page note editor for global and post-scoped notes.

## Structure

```
note-editor/
├── NoteEditor.tsx              # orchestrator: dirty state, file pick
├── ui/
│   ├── note-header-toolbar.tsx # title, attach, save, delete
│   ├── note-body-editor.tsx    # AI toggle + textarea (embed UI later)
│   ├── note-files-panel.tsx    # attachment list
│   └── note-embed-drag-preview.tsx  # stub for inline embed DnD
└── index.ts
```

Body editing is a plain textarea for now; rich embed UI will land in a later phase.

## Props

Controlled component: parent owns `title`, `body`, `ai`, `files` and save/delete handlers. `baselineSnapshot` enables save button gating via `buildNoteSnapshot`.
