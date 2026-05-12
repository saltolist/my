// ── Init ──
renderComposerControls();
renderAiProfileControls();
renderTelegramProfileControls();
hydrateSystemPromptEditor();
modelSettingsSavedSnapshot = buildModelSettingsSnapshot();
telegramSettingsSavedSnapshot = buildTelegramSettingsSnapshot();
syncModelSettingsSaveButton();
syncTelegramSettingsSaveButton();
renderFeed();
renderNotesList();
