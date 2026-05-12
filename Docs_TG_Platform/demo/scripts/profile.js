//  PROFILE TABS
// ══════════════════════════════════════════════════
function switchProfileTab(idx, el) {
  const isSettingsActive = !!document.getElementById('ptab-1')?.classList.contains('active');
  if (isSettingsActive && idx !== 1 && (hasUnsavedSystemPromptChanges() || hasUnsavedModelSettingsChanges() || hasUnsavedTelegramSettingsChanges())) {
    const ok = confirm('Есть несохранённые изменения в настройках профиля. Перейти без сохранения?');
    if (!ok) return;
  }
  document.querySelectorAll('.profile-tab').forEach((t,i) => t.classList.toggle('active', i === idx));
  document.querySelectorAll('.profile-panel').forEach((p,i) => p.classList.toggle('active', i === idx));
  if (idx === 1) {
    renderAiProfileControls();
    renderTelegramProfileControls();
    syncSystemPromptSaveButton();
    syncModelSettingsSaveButton();
    syncTelegramSettingsSaveButton();
  }
}

function profileEscape(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function getTelegramStatusLabel() {
  if (telegramProfileConfig.authStatus === 'connected' && telegramProfileConfig.channelStatus === 'connected') {
    return { className: 'ok', text: 'MTProto подключён' };
  }
  if (telegramProfileConfig.authStatus === 'code-sent') {
    return { className: 'warn', text: 'Ждёт код входа' };
  }
  if (telegramProfileConfig.authStatus === 'authorized') {
    return { className: 'warn', text: 'Аккаунт авторизован' };
  }
  return { className: 'muted', text: 'Не подключён' };
}

function renderTelegramProfileControls() {
  const wrap = document.getElementById('telegram-profile-controls');
  if (!wrap) return;

  const status = getTelegramStatusLabel();
  const isConnected = telegramProfileConfig.authStatus === 'connected' && telegramProfileConfig.channelStatus === 'connected';
  const isAuthorized = ['authorized', 'connected'].includes(telegramProfileConfig.authStatus);
  const codeHidden = telegramProfileConfig.authStatus === 'code-sent' ? '' : 'hidden';
  const channelHidden = isAuthorized ? '' : 'hidden';

  wrap.innerHTML = `
    <div class="telegram-status-row">
      <div>
        <div class="profile-label">Статус</div>
        <div class="telegram-status ${status.className}">
          <span class="telegram-status-dot"></span>
          ${status.text}
        </div>
      </div>
      <button class="btn btn-ghost btn-sm" onclick="resetTelegramDemo()">Сбросить демо</button>
    </div>

    <div class="telegram-steps">
      <div class="telegram-step ${isAuthorized ? 'done' : 'active'}">
        <span>1</span>
        <div>
          <b>Авторизация аккаунта</b>
          <small>api_id, api_hash и телефон для MTProto-сессии</small>
        </div>
      </div>
      <div class="telegram-step ${isAuthorized ? (isConnected ? 'done' : 'active') : ''}">
        <span>2</span>
        <div>
          <b>Подключение канала</b>
          <small>username, invite link или id канала</small>
        </div>
      </div>
      <div class="telegram-step ${isConnected ? 'done' : ''}">
        <span>3</span>
        <div>
          <b>Синхронизация</b>
          <small>история постов и новые события</small>
        </div>
      </div>
    </div>

    <div class="telegram-form-grid">
      <div class="profile-row">
        <div class="profile-label">api_id</div>
        <input class="profile-input telegram-input" value="${profileEscape(telegramProfileConfig.apiId)}" placeholder="12345678" oninput="updateTelegramField('apiId', this.value)">
      </div>
      <div class="profile-row">
        <div class="profile-label">api_hash</div>
        <input class="profile-input telegram-input" type="password" value="${profileEscape(telegramProfileConfig.apiHash)}" placeholder="••••••••••••••••" oninput="updateTelegramField('apiHash', this.value)">
      </div>
      <div class="profile-row">
        <div class="profile-label">Телефон аккаунта</div>
        <input class="profile-input telegram-input" value="${profileEscape(telegramProfileConfig.phone)}" placeholder="+7 999 000-00-00" oninput="updateTelegramField('phone', this.value)">
      </div>
      <div class="profile-row">
        <div class="profile-label">Session name</div>
        <input class="profile-input telegram-input" value="${profileEscape(telegramProfileConfig.sessionName)}" placeholder="author-main.session" oninput="updateTelegramField('sessionName', this.value)">
      </div>
    </div>

    <div class="telegram-action-row">
      <button class="btn btn-primary btn-sm" onclick="startTelegramAuthDemo()">Отправить код</button>
      <div class="telegram-code-row ${codeHidden}">
        <input class="profile-input telegram-code-input" id="telegram-code-input" placeholder="Код из Telegram" maxlength="8">
        <button class="btn btn-ghost btn-sm" onclick="confirmTelegramCodeDemo()">Подтвердить</button>
      </div>
    </div>

    <div class="telegram-channel-block ${channelHidden}">
      <div class="telegram-form-grid">
        <div class="profile-row">
          <div class="profile-label">Канал</div>
          <input class="profile-input telegram-input" value="${profileEscape(telegramProfileConfig.channel)}" placeholder="@channel или -100..." oninput="updateTelegramField('channel', this.value)">
        </div>
        <div class="profile-row">
          <div class="profile-label">Режим синхронизации</div>
          <select class="profile-input telegram-input" onchange="updateTelegramField('syncMode', this.value)">
            <option value="live-only" ${telegramProfileConfig.syncMode === 'live-only' ? 'selected' : ''}>Только новые посты</option>
            <option value="history-and-live" ${telegramProfileConfig.syncMode === 'history-and-live' ? 'selected' : ''}>История + новые посты</option>
            <option value="publish-only" ${telegramProfileConfig.syncMode === 'publish-only' ? 'selected' : ''}>Только публикация</option>
          </select>
        </div>
      </div>
      <div class="telegram-action-row">
        <button class="btn btn-primary btn-sm" onclick="connectTelegramChannelDemo()">Подключить канал</button>
        <button class="btn btn-ghost btn-sm" onclick="runTelegramSyncDemo()" ${isConnected ? '' : 'disabled'}>Синхронизировать</button>
        <button class="btn btn-primary btn-sm" id="telegram-settings-save-btn" onclick="saveTelegramSettings()" disabled>Сохранить</button>
      </div>
    </div>

    <div class="telegram-sync-card ${isConnected ? '' : 'hidden'}">
      <div>
        <div class="profile-label">Подключённый канал</div>
        <div class="profile-val">${profileEscape(telegramProfileConfig.channelTitle)} · ${profileEscape(telegramProfileConfig.channel)}</div>
      </div>
      <div>
        <div class="profile-label">Последняя синхронизация</div>
        <div class="profile-val">${profileEscape(telegramProfileConfig.lastSync)}</div>
      </div>
      <div>
        <div class="profile-label">Импортировано постов</div>
        <div class="profile-val">${telegramProfileConfig.importedPosts}</div>
      </div>
    </div>
  `;

  syncTelegramSettingsSaveButton();
}

function buildTelegramSettingsSnapshot() {
  return JSON.stringify({
    apiId: telegramProfileConfig.apiId || '',
    apiHash: telegramProfileConfig.apiHash || '',
    phone: telegramProfileConfig.phone || '',
    sessionName: telegramProfileConfig.sessionName || '',
    channel: telegramProfileConfig.channel || '',
    syncMode: telegramProfileConfig.syncMode || '',
  });
}

function hasUnsavedTelegramSettingsChanges() {
  return buildTelegramSettingsSnapshot() !== telegramSettingsSavedSnapshot;
}

function syncTelegramSettingsSaveButton() {
  const btn = document.getElementById('telegram-settings-save-btn');
  if (!btn) return;
  btn.disabled = !hasUnsavedTelegramSettingsChanges();
}

function saveTelegramSettings() {
  telegramSettingsSavedSnapshot = buildTelegramSettingsSnapshot();
  syncTelegramSettingsSaveButton();
}

function updateTelegramField(field, value) {
  telegramProfileConfig[field] = value;
  syncTelegramSettingsSaveButton();
}

function startTelegramAuthDemo() {
  telegramProfileConfig.authStatus = 'code-sent';
  telegramProfileConfig.authStep = 'code';
  telegramProfileConfig.channelStatus = telegramProfileConfig.channelStatus === 'connected' ? 'pending' : telegramProfileConfig.channelStatus;
  renderTelegramProfileControls();
}

function confirmTelegramCodeDemo() {
  const code = document.getElementById('telegram-code-input')?.value.trim();
  telegramProfileConfig.authStatus = code ? 'authorized' : 'code-sent';
  telegramProfileConfig.authStep = code ? 'channel' : 'code';
  renderTelegramProfileControls();
}

function connectTelegramChannelDemo() {
  telegramProfileConfig.authStatus = 'connected';
  telegramProfileConfig.authStep = 'connected';
  telegramProfileConfig.channelStatus = 'connected';
  telegramProfileConfig.channelTitle = telegramProfileConfig.channel.replace('@', '') || 'Telegram канал';
  telegramProfileConfig.lastSync = 'только что';
  telegramProfileConfig.importedPosts = Math.max(telegramProfileConfig.importedPosts, 128);
  saveTelegramSettings();
  renderTelegramProfileControls();
}

function runTelegramSyncDemo() {
  telegramProfileConfig.lastSync = 'только что';
  telegramProfileConfig.importedPosts += 3;
  renderTelegramProfileControls();
}

function resetTelegramDemo() {
  telegramProfileConfig.authStatus = 'idle';
  telegramProfileConfig.authStep = 'credentials';
  telegramProfileConfig.channelStatus = 'idle';
  telegramProfileConfig.lastSync = '—';
  telegramProfileConfig.importedPosts = 0;
  renderTelegramProfileControls();
  saveTelegramSettings();
}

// ══════════════════════════════════════════════════
