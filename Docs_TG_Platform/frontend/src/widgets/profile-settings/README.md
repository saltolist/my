# widgets/profile-settings

Channel profile, app settings, and platform analytics tabs.

## Structure

```
profile-settings/
├── ProfileSettings.tsx         # tab composition + channel draft state
├── ui/
│   ├── channel-profile-form.tsx
│   ├── rubrics-editor.tsx
│   ├── ai-models-list.tsx
│   ├── ai-model-row.tsx
│   ├── theme-toggle.tsx
│   ├── telegram-auth-section.tsx
│   ├── telegram-channel-section.tsx
│   ├── telegram-omnibot-section.tsx
│   └── platform-analytics-panel.tsx
└── index.ts
```

## Tabs

| Tab | Contents |
|-----|----------|
| Канал | Channel profile form, rubrics editor, save |
| Настройки | AI models, theme, Telegram MTProto, channel, Omnibot |
| Аналитика платформы | Token usage mock metrics |

Channel tab mutates via `useUpdateChannelProfile`. Settings sections are read-only mock data from profile repositories.
