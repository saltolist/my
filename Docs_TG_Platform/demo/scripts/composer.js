const LLM_PROVIDER_MODELS = {
  OpenAI: ['gpt-4o', 'gpt-4.1', 'gpt-4.1-mini'],
  Anthropic: ['claude-3-7-sonnet', 'claude-3-5-sonnet'],
  Mistral: ['mistral-large', 'mistral-small'],
  Google: ['gemini-1.5-pro', 'gemini-1.5-flash'],
  DeepSeek: ['deepseek-chat', 'deepseek-reasoner'],
  OpenRouter: ['meta-llama/llama-3.1-70b-instruct', 'qwen/qwen-2.5-72b-instruct'],
};

const WEB_SEARCH_PROVIDER_MODELS = {
  Perplexity: ['sonar-pro', 'sonar-reasoning'],
  Tavily: ['search-v1'],
  SerpAPI: ['google-search'],
  Exa: ['exa-neural'],
};

function shortComposerLabel(value, maxLen = 22) {
  const text = String(value || '').trim();
  if (text.length <= maxLen) return text;
  return text.slice(0, Math.max(0, maxLen - 2)) + '..';
}

function getLlmModelLabel(id) {
  const model = aiProfileConfig.llmModels.find(item => item.id === id);
  return model ? `${model.provider} / ${model.model || 'модель'}` : 'LLM не выбрана';
}

function getWebSearchModelLabel(id) {
  if (!id) return 'Нет';
  const model = aiProfileConfig.webSearchModels.find(item => item.id === id);
  return model ? `${model.provider} / ${model.model || 'модель'}` : 'Нет';
}

function ensureValidComposerTargets() {
  const availableLlm = aiProfileConfig.llmModels.filter(item => item.provider && item.model && item.active);
  const availableWeb = aiProfileConfig.webSearchModels.filter(item => item.provider && item.model && item.active);
  const fallbackLlm = availableLlm[0]?.id || '';
  Object.keys(composerTargets).forEach(scope => {
    const target = composerTargets[scope] || {};
    if (!availableLlm.some(item => item.id === target.llmId)) target.llmId = fallbackLlm;
    if (target.webId && !availableWeb.some(item => item.id === target.webId)) target.webId = '';
    if (typeof target.webId !== 'string') target.webId = '';
    composerTargets[scope] = target;
  });
}

function getMultiResponsePairs() {
  const llmSelected = aiProfileConfig.llmModels.filter(item => item.provider && item.model && item.active && item.includeInMulti);
  const webSelected = aiProfileConfig.webSearchModels.filter(item => item.provider && item.model && item.active && item.includeInMulti);
  const pairs = [];
  if (webSelected.length === 0) {
    llmSelected.forEach(llm => {
      pairs.push({
        id: `${llm.id}|none`,
        llmId: llm.id,
        webId: '',
        label: `${llm.provider}/${llm.model}`,
      });
    });
    return pairs;
  }
  llmSelected.forEach(llm => {
    webSelected.forEach(web => {
      pairs.push({
        id: `${llm.id}|${web.id}`,
        llmId: llm.id,
        webId: web.id,
        label: `${llm.provider}/${llm.model} + ${web.provider}/${web.model}`,
      });
    });
  });
  return pairs;
}

function getMultiResponseEligibility() {
  const llmSelectedCount = aiProfileConfig.llmModels.filter(item => item.provider && item.model && item.active && item.includeInMulti).length;
  const webSelectedCount = aiProfileConfig.webSearchModels.filter(item => item.provider && item.model && item.active && item.includeInMulti).length;
  const eligible = llmSelectedCount >= 2 || (llmSelectedCount >= 1 && webSelectedCount >= 2);
  return { eligible, llmSelectedCount, webSelectedCount };
}

function syncMultiResponseToggleAvailability() {
  const toggle = document.getElementById('multiresponse-toggle');
  const label = document.getElementById('multiresponse-toggle-label');
  if (!toggle || !label) return;
  const { eligible } = getMultiResponseEligibility();
  toggle.disabled = !eligible;
  label.classList.toggle('toggle-disabled-strike', !eligible);
  if (!eligible && aiProfileConfig.multiResponseEnabled) {
    aiProfileConfig.multiResponseEnabled = false;
  }
  toggle.checked = aiProfileConfig.multiResponseEnabled;
}

function renderComposerControls() {
  ensureValidComposerTargets();
  const scopes = ['home', 'gchat', 'post'];
  const llmOptions = aiProfileConfig.llmModels.filter(item => item.provider && item.model && item.active);
  const webOptions = aiProfileConfig.webSearchModels.filter(item => item.provider && item.model && item.active);
  scopes.forEach(scope => {
    const llmSelect = document.getElementById(`composer-llm-${scope}`);
    const webSelect = document.getElementById(`composer-web-${scope}`);
    const multiInput = document.getElementById(`composer-multi-${scope}`);
    if (!llmSelect || !webSelect || !multiInput) return;

    llmSelect.innerHTML = llmOptions.length > 0
      ? llmOptions.map(item => `<option value="${item.id}">${shortComposerLabel(`${item.provider} / ${item.model}`)}</option>`).join('')
      : '<option value="">Нет LLM моделей</option>';
    webSelect.innerHTML = `
      <option value="">Нет</option>
      ${webOptions.map(item => `<option value="${item.id}">${shortComposerLabel(`${item.provider} / ${item.model}`)}</option>`).join('')}
    `;
    if (llmOptions.length > 0) llmSelect.value = composerTargets[scope].llmId;
    webSelect.value = composerTargets[scope].webId || '';
    llmSelect.disabled = llmOptions.length === 0;
    webSelect.disabled = false;

    const isMulti = aiProfileConfig.multiResponseEnabled;
    llmSelect.style.display = isMulti ? 'none' : '';
    webSelect.style.display = isMulti ? 'none' : '';
    if (isMulti) {
      llmSelect.disabled = true;
      webSelect.disabled = true;
    }
    multiInput.classList.toggle('hidden', !isMulti);
  });
}

function onComposerLlmChange(scope, value) {
  composerTargets[scope].llmId = value;
}

function onComposerWebSearchChange(scope, value) {
  composerTargets[scope].webId = value;
}

function updateLlmProvider(index, provider) {
  if (!aiProfileConfig.llmModels[index]) return;
  const row = aiProfileConfig.llmModels[index];
  row.provider = provider;
  if (!provider) {
    row.model = '';
    row.apiKey = '';
  } else {
    const models = LLM_PROVIDER_MODELS[provider] || [];
    if (!models.includes(row.model)) row.model = models[0] || '';
  }
  renderAiProfileControls();
  renderComposerControls();
  syncModelSettingsSaveButton();
}

function updateLlmModel(index, modelName) {
  if (!aiProfileConfig.llmModels[index]) return;
  aiProfileConfig.llmModels[index].model = modelName;
  renderComposerControls();
  syncModelSettingsSaveButton();
}

function updateLlmApiKey(index, value) {
  if (!aiProfileConfig.llmModels[index]) return;
  aiProfileConfig.llmModels[index].apiKey = value;
  syncModelSettingsSaveButton();
}

function toggleLlmActive(index, checked) {
  if (!aiProfileConfig.llmModels[index]) return;
  const row = aiProfileConfig.llmModels[index];
  row.active = !!checked;
  if (!row.active) row.includeInMulti = false;
  renderComposerControls();
  syncMultiResponseToggleAvailability();
  syncModelSettingsSaveButton();
}

function toggleLlmInMulti(index, checked) {
  if (!aiProfileConfig.llmModels[index]) return;
  aiProfileConfig.llmModels[index].includeInMulti = !!checked;
  syncMultiResponseToggleAvailability();
  syncModelSettingsSaveButton();
}

function updateWebProvider(index, provider) {
  if (!aiProfileConfig.webSearchModels[index]) return;
  const row = aiProfileConfig.webSearchModels[index];
  row.provider = provider;
  if (!provider) {
    row.model = '';
    row.apiKey = '';
  } else {
    const models = WEB_SEARCH_PROVIDER_MODELS[provider] || [];
    if (!models.includes(row.model)) row.model = models[0] || '';
  }
  renderAiProfileControls();
  renderComposerControls();
  syncModelSettingsSaveButton();
}

function updateWebModel(index, modelName) {
  if (!aiProfileConfig.webSearchModels[index]) return;
  aiProfileConfig.webSearchModels[index].model = modelName;
  renderComposerControls();
  syncModelSettingsSaveButton();
}

function updateWebApiKey(index, value) {
  if (!aiProfileConfig.webSearchModels[index]) return;
  aiProfileConfig.webSearchModels[index].apiKey = value;
  syncModelSettingsSaveButton();
}

function toggleWebActive(index, checked) {
  if (!aiProfileConfig.webSearchModels[index]) return;
  const row = aiProfileConfig.webSearchModels[index];
  row.active = !!checked;
  if (!row.active) row.includeInMulti = false;
  renderComposerControls();
  syncMultiResponseToggleAvailability();
  syncModelSettingsSaveButton();
}

function toggleWebInMulti(index, checked) {
  if (!aiProfileConfig.webSearchModels[index]) return;
  aiProfileConfig.webSearchModels[index].includeInMulti = !!checked;
  syncMultiResponseToggleAvailability();
  syncModelSettingsSaveButton();
}

function addLlmModelRow() {
  aiProfileConfig.llmModels.push({
    id: 'llm-' + Date.now(),
    provider: '',
    model: '',
    apiKey: '',
    active: true,
    includeInMulti: false,
  });
  renderAiProfileControls();
  renderComposerControls();
  syncModelSettingsSaveButton();
}

function addWebSearchModelRow() {
  aiProfileConfig.webSearchModels.push({
    id: 'web-' + Date.now(),
    provider: '',
    model: '',
    apiKey: '',
    active: true,
    includeInMulti: false,
  });
  renderAiProfileControls();
  renderComposerControls();
  syncModelSettingsSaveButton();
}

function renderAiProfileControls() {
  const llmWrap = document.getElementById('llm-models-list');
  const webWrap = document.getElementById('web-models-list');
  const toggle = document.getElementById('multiresponse-toggle');
  if (!llmWrap || !webWrap || !toggle) return;

  llmWrap.innerHTML = aiProfileConfig.llmModels.map((model, idx) => `
    <div class="profile-model-row">
      <select class="profile-input profile-model-provider" onchange="updateLlmProvider(${idx}, this.value)">
        <option value="">Выберите провайдера</option>
        ${Object.keys(LLM_PROVIDER_MODELS).map(provider => `<option value="${provider}" ${provider === model.provider ? 'selected' : ''}>${provider}</option>`).join('')}
      </select>
      <select class="profile-input profile-model-name" onchange="updateLlmModel(${idx}, this.value)" ${model.provider ? '' : 'disabled'}>
        <option value="">Выберите модель</option>
        ${(LLM_PROVIDER_MODELS[model.provider] || []).map(modelName => `<option value="${modelName}" ${modelName === model.model ? 'selected' : ''}>${modelName}</option>`).join('')}
      </select>
      <input class="profile-input profile-model-key" type="password" value="${model.apiKey}" placeholder="API key" oninput="updateLlmApiKey(${idx}, this.value)" style="${model.provider ? '' : 'display:none'}">
      <label class="profile-val profile-model-multi">
        <input type="checkbox" ${model.active ? 'checked' : ''} onchange="toggleLlmActive(${idx}, this.checked)">
        Активна
      </label>
      <label class="profile-val profile-model-multi">
        <input type="checkbox" ${model.includeInMulti ? 'checked' : ''} onchange="toggleLlmInMulti(${idx}, this.checked)">
        В мультиответ
      </label>
    </div>
  `).join('');

  webWrap.innerHTML = aiProfileConfig.webSearchModels.map((model, idx) => `
    <div class="profile-model-row">
      <select class="profile-input profile-model-provider" onchange="updateWebProvider(${idx}, this.value)">
        <option value="">Выберите провайдера</option>
        ${Object.keys(WEB_SEARCH_PROVIDER_MODELS).map(provider => `<option value="${provider}" ${provider === model.provider ? 'selected' : ''}>${provider}</option>`).join('')}
      </select>
      <select class="profile-input profile-model-name" onchange="updateWebModel(${idx}, this.value)" ${model.provider ? '' : 'disabled'}>
        <option value="">Выберите модель</option>
        ${(WEB_SEARCH_PROVIDER_MODELS[model.provider] || []).map(modelName => `<option value="${modelName}" ${modelName === model.model ? 'selected' : ''}>${modelName}</option>`).join('')}
      </select>
      <input class="profile-input profile-model-key" type="password" value="${model.apiKey}" placeholder="API key" oninput="updateWebApiKey(${idx}, this.value)" style="${model.provider ? '' : 'display:none'}">
      <label class="profile-val profile-model-multi">
        <input type="checkbox" ${model.active ? 'checked' : ''} onchange="toggleWebActive(${idx}, this.checked)">
        Активна
      </label>
      <label class="profile-val profile-model-multi">
        <input type="checkbox" ${model.includeInMulti ? 'checked' : ''} onchange="toggleWebInMulti(${idx}, this.checked)">
        В мультиответ
      </label>
    </div>
  `).join('');

  syncMultiResponseToggleAvailability();
  syncModelSettingsSaveButton();
}

function toggleMultiResponse(enabled) {
  const { eligible } = getMultiResponseEligibility();
  aiProfileConfig.multiResponseEnabled = !!enabled && eligible;
  syncMultiResponseToggleAvailability();
  renderComposerControls();
  syncModelSettingsSaveButton();
}

function getSystemPromptDraft() {
  const input = document.getElementById('system-prompt-input');
  if (!input) return systemPromptSavedSnapshot;
  return input.value;
}

function buildModelSettingsSnapshot() {
  return JSON.stringify({
    llmModels: aiProfileConfig.llmModels.map(item => ({
      provider: item.provider || '',
      model: item.model || '',
      apiKey: item.apiKey || '',
      active: !!item.active,
      includeInMulti: !!item.includeInMulti,
    })),
    webSearchModels: aiProfileConfig.webSearchModels.map(item => ({
      provider: item.provider || '',
      model: item.model || '',
      apiKey: item.apiKey || '',
      active: !!item.active,
      includeInMulti: !!item.includeInMulti,
    })),
    multiResponseEnabled: !!aiProfileConfig.multiResponseEnabled,
  });
}

function hasUnsavedModelSettingsChanges() {
  return buildModelSettingsSnapshot() !== modelSettingsSavedSnapshot;
}

function syncModelSettingsSaveButton() {
  const btn = document.getElementById('model-settings-save-btn');
  if (!btn) return;
  btn.disabled = !hasUnsavedModelSettingsChanges();
}

function saveModelSettings() {
  if (!hasUnsavedModelSettingsChanges()) return;
  modelSettingsSavedSnapshot = buildModelSettingsSnapshot();
  syncModelSettingsSaveButton();
}

function hasUnsavedSystemPromptChanges() {
  return getSystemPromptDraft() !== systemPromptSavedSnapshot;
}

function syncSystemPromptSaveButton() {
  const btn = document.getElementById('system-prompt-save-btn');
  if (!btn) return;
  btn.disabled = !hasUnsavedSystemPromptChanges();
}

function onSystemPromptInput() {
  syncSystemPromptSaveButton();
}

function saveSystemPrompt() {
  const input = document.getElementById('system-prompt-input');
  if (!input) return;
  if (!hasUnsavedSystemPromptChanges()) return;
  aiProfileConfig.systemPrompt = input.value;
  systemPromptSavedSnapshot = aiProfileConfig.systemPrompt;
  syncSystemPromptSaveButton();
}

function hydrateSystemPromptEditor() {
  const input = document.getElementById('system-prompt-input');
  if (!input) return;
  input.value = aiProfileConfig.systemPrompt;
  systemPromptSavedSnapshot = aiProfileConfig.systemPrompt;
  syncSystemPromptSaveButton();
}

function canLeaveProfileSettings(nextScreenId) {
  const profileScreen = document.getElementById('screen-profile');
  const settingsTab = document.getElementById('ptab-1');
  const isProfileActive = !!profileScreen?.classList.contains('active');
  const isSettingsActive = !!settingsTab?.classList.contains('active');
  if (!isProfileActive || !isSettingsActive) return true;
  if (nextScreenId === 'profile') return true;
  if (!hasUnsavedSystemPromptChanges() && !hasUnsavedModelSettingsChanges() && !hasUnsavedTelegramSettingsChanges()) return true;
  return confirm('Есть несохранённые изменения в настройках профиля. Уйти без сохранения?');
}

// ══════════════════════════════════════════════════
