//  SHARED HELPERS
// ══════════════════════════════════════════════════
function setAiVariant(scope, entityId, idx, variantIdx) {
  const messageIdx = Number(idx);
  const targetVariant = Number(variantIdx);
  if (scope === 'gchat') {
    const chat = globalChats.find(c => c.id === entityId);
    const msg = chat?.history?.[messageIdx];
    if (!msg || !Array.isArray(msg.variants)) return;
    msg.selectedVariant = targetVariant;
    if (currentGChat?.id === entityId) renderCurrentGChatMessages();
    return;
  }
  if (scope === 'post') {
    const postId = Number(entityId);
    const post = posts.find(p => p.id === postId);
    const msg = post?.chatHistory?.[messageIdx];
    if (!msg || !Array.isArray(msg.variants)) return;
    msg.selectedVariant = targetVariant;
    if (currentPost?.id === postId) renderPostBody();
  }
}

function cycleAiVariant(scope, entityId, idx, delta) {
  const messageIdx = Number(idx);
  const shift = Number(delta);
  if (scope === 'gchat') {
    const chat = globalChats.find(c => c.id === entityId);
    const msg = chat?.history?.[messageIdx];
    if (!msg || !Array.isArray(msg.variants) || msg.variants.length === 0) return;
    const current = Number(msg.selectedVariant) || 0;
    const next = (current + shift + msg.variants.length) % msg.variants.length;
    setAiVariant(scope, entityId, idx, next);
    return;
  }
  if (scope === 'post') {
    const postId = Number(entityId);
    const post = posts.find(p => p.id === postId);
    const msg = post?.chatHistory?.[messageIdx];
    if (!msg || !Array.isArray(msg.variants) || msg.variants.length === 0) return;
    const current = Number(msg.selectedVariant) || 0;
    const next = (current + shift + msg.variants.length) % msg.variants.length;
    setAiVariant(scope, entityId, idx, next);
  }
}

function chatMsgHTML(message, ctx = null) {
  const msg = (typeof message === 'string')
    ? { role: 'ai', text: message }
    : (message || { role: 'ai', text: '' });
  const isUser = msg.role === 'user';
  const plainText = (msg.text || '').replace(/\n/g, '<br>');

  let topHtml = '';
  let footerHtml = '';
  let textHtml = plainText;
  if (!isUser && Array.isArray(msg.variants) && msg.variants.length > 0) {
    const selectedIdx = Math.min(Math.max(Number(msg.selectedVariant) || 0, 0), msg.variants.length - 1);
    const selected = msg.variants[selectedIdx];
    textHtml = (selected?.text || '').replace(/\n/g, '<br>');
    if (ctx) {
      const showArrows = msg.variants.length > 1;
      footerHtml = `<div class="ai-variant-footer">
        <div class="ai-variant-label">${selected?.label || ''}</div>
        ${showArrows ? `<div class="ai-variant-nav">
          <button class="ai-variant-arrow" onclick="cycleAiVariant('${ctx.scope}','${ctx.entityId}',${ctx.index},-1)">←</button>
          <button class="ai-variant-arrow" onclick="cycleAiVariant('${ctx.scope}','${ctx.entityId}',${ctx.index},1)">→</button>
        </div>` : `<div class="ai-variant-nav"></div>`}
      </div>`;
    }
  } else if (!isUser && msg.targetLabel) {
    footerHtml = `<div class="ai-variant-footer">
      <div class="ai-variant-label">${msg.targetLabel}</div>
      <div class="ai-variant-nav"></div>
    </div>`;
  }

  return `<div class="msg-row ${isUser?'user':'ai'}">
    <div class="msg-body">
      <div class="msg-text">${topHtml}${textHtml}</div>
      ${footerHtml}
    </div>
  </div>`;
}

function handleKey(e, ctx) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    if      (ctx === 'home')  sendHome();
    else if (ctx === 'gchat') sendGChat();
    else if (ctx === 'feed')  sendFeedDraft();
    else if (ctx === 'post')  sendPost();
  }
}

function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 120) + 'px';
}

function truncate(str, n) {
  return str && str.length > n ? str.slice(0, n) + '…' : (str || '');
}

function extractTitle(text) {
  if (!text) return '';
  const firstLine = text.split('\n')[0];
  const dotIdx = firstLine.indexOf('.');
  return (dotIdx !== -1 ? firstLine.slice(0, dotIdx) : firstLine).trim();
}

function postTitle(p) {
  return extractTitle(p.text) || '(без названия)';
}

window.addEventListener('resize', () => {
  if (!currentNote) return;
  fitNoteTitleSize();
});

window.addEventListener('beforeunload', (e) => {
  if (!hasUnsavedNoteChanges() && !hasUnsavedSystemPromptChanges() && !hasUnsavedModelSettingsChanges() && !hasUnsavedTelegramSettingsChanges()) return;
  e.preventDefault();
  e.returnValue = '';
});
