//  STATE
// ══════════════════════════════════════════════════
let currentPost  = null;
let postMode     = 'chat'; // 'chat' | 'notes'
let isEditing    = false;
let currentGChat = null;
let currentNote  = null;
let noteMode     = 'view'; // 'view' | 'edit'
let noteFrom     = 'notes'; // where to go back
let chatsTab     = 'global';
let noteFilter   = 'all';
let noteScope    = 'global';
let pinnedPostIds = [1, 2];
let noteSavedSnapshot = '';
let systemPromptSavedSnapshot = aiProfileConfig.systemPrompt;
let modelSettingsSavedSnapshot = '';
let telegramSettingsSavedSnapshot = '';
const composerTargets = {
  home: { llmId: 'llm-1', webId: 'web-1' },
  gchat: { llmId: 'llm-1', webId: 'web-1' },
  post: { llmId: 'llm-1', webId: 'web-1' },
};

// ══════════════════════════════════════════════════
