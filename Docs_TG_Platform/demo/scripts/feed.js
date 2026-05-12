//  FEED
// ══════════════════════════════════════════════════
function renderFeed() {
  const pub  = posts.filter(p => p.status === 'published');
  const sch  = posts.filter(p => p.status === 'scheduled');
  const dft  = posts.filter(p => p.status === 'draft');
  let inner = '';
  inner += `<div class="feed-section"><div class="section-label">Опубликованные</div><div class="feed-section-cards">${pub.map(postCardHTML).join('')}</div></div>`;
  inner += `<div class="feed-section"><div class="section-label">Отложенные</div><div class="feed-section-cards">${sch.map(postCardHTML).join('')}</div></div>`;
  inner += `<div class="feed-section"><div class="section-label">Черновики</div><div class="feed-section-cards" id="feed-drafts">${dft.map(postCardHTML).join('')}</div></div>`;
  document.getElementById('feed-scroll').innerHTML = `<div class="feed-inner">${inner}</div>`;
  attachDraftDnd();
}

function postCardHTML(p) {
  let statusHtml;
  if (p.status === 'published') statusHtml = `<span class="post-status"><span class="dot-g">●</span> Опубликован</span>`;
  else if (p.status === 'scheduled') statusHtml = `<span class="post-status"><span class="dot-o">◷</span> Отложено · ${p.date}</span>`;
  else statusHtml = `<span class="post-status"><span class="dot-gr">✏</span> Черновик · создан ${p.created}</span>`;

  const metrics = (p.status === 'published' && p.metrics)
    ? `<div class="post-metrics"><span>👁 ${p.metrics.views}</span><span>❤ ${p.metrics.reactions}</span><span>↗ ${p.metrics.reposts}</span></div>`
    : '';
  const rubric = p.rubric ? `<span class="tag-pill">${p.rubric}</span>` : '';
  const isDraft = p.status === 'draft';
  const drag   = isDraft ? `<div class="drag-handle" title="Перетащить" onclick="event.stopPropagation()">⠿</div>` : '';
  const date   = p.status === 'published' ? `<span>·</span><span>${p.date}</span>` : '';
  const draftAttrs = isDraft ? ` data-draft-id="${p.id}"` : '';

  const textHtml = p.text
    ? `<div class="post-card-text">${p.text}</div>`
    : `<div class="post-card-text empty">Пост пустой — нажми чтобы начать писать</div>`;
  const mediaHtml = p.media
    ? `<div class="post-card-media">🖼 ${p.media}</div>`
    : '';

  return `<div class="post-card"${draftAttrs} onclick="openPost(${p.id})">
    ${drag}
    <div class="post-card-body">
      ${textHtml}
      ${mediaHtml}
      <div class="post-card-footer">
        <div class="post-meta">${statusHtml}${date}${rubric ? `<span>·</span>${rubric}` : ''}</div>
        ${metrics}
      </div>
    </div>
  </div>`;
}

function sendFeedDraft() {
  const inp = document.getElementById('feed-input');
  const text = inp.value.trim();
  if (!text) return;
  const np = {
      id: Date.now(), status: 'draft', created: 'только что',
    rubric: null, text, notes: [], chatHistory: []
  };
  posts.push(np);
  inp.value = ''; autoResize(inp);
  renderFeed();
}

// ── Drag-and-drop черновиков ──
// Порядок живёт в массиве `posts` в памяти вкладки (см. concept/12-demo.md).
// Drag стартует только с .drag-handle, drop разрешён только в секции `Черновики`.
let draftDndSourceId = null;

function attachDraftDnd() {
  const container = document.getElementById('feed-drafts');
  if (!container) return;
  const cards = container.querySelectorAll('.post-card[data-draft-id]');

  cards.forEach(card => {
    const handle = card.querySelector('.drag-handle');
    if (!handle) return;

    handle.addEventListener('mousedown', () => card.setAttribute('draggable', 'true'));
    card.addEventListener('mouseup',   () => card.setAttribute('draggable', 'false'));

    card.addEventListener('dragstart', (e) => {
      const id = parseInt(card.getAttribute('data-draft-id'), 10);
      draftDndSourceId = id;
      e.dataTransfer.effectAllowed = 'move';
      try { e.dataTransfer.setData('text/plain', String(id)); } catch (_) {}
      requestAnimationFrame(() => card.classList.add('is-dragging'));
    });

    card.addEventListener('dragend', () => {
      card.classList.remove('is-dragging');
      card.setAttribute('draggable', 'false');
      removeDropIndicator();
      draftDndSourceId = null;
    });

    card.addEventListener('dragover', (e) => {
      if (draftDndSourceId == null) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      const rect = card.getBoundingClientRect();
      const before = (e.clientY - rect.top) < rect.height / 2;
      showDropIndicator(card, before);
    });
  });

  container.addEventListener('dragover', (e) => {
    if (draftDndSourceId == null) return;
    if (!e.target.closest('.post-card[data-draft-id]')) {
      e.preventDefault();
      showDropIndicatorAtEnd(container);
    }
  });

  container.addEventListener('drop', (e) => {
    if (draftDndSourceId == null) return;
    e.preventDefault();
    const indicator = container.querySelector('.drop-indicator');
    let nextDraftId = null;
    if (indicator) {
      let next = indicator.nextElementSibling;
      while (next && !next.hasAttribute('data-draft-id')) next = next.nextElementSibling;
      if (next) nextDraftId = parseInt(next.getAttribute('data-draft-id'), 10);
    }
    reorderDraft(draftDndSourceId, nextDraftId);
  });
}

function showDropIndicator(refCard, before) {
  removeDropIndicator();
  if (refCard.getAttribute('data-draft-id') === String(draftDndSourceId)) return;
  const indicator = document.createElement('div');
  indicator.className = 'drop-indicator';
  if (before) refCard.parentNode.insertBefore(indicator, refCard);
  else        refCard.parentNode.insertBefore(indicator, refCard.nextSibling);
}

function showDropIndicatorAtEnd(container) {
  const last = container.querySelector('.drop-indicator:last-child');
  if (last) return;
  removeDropIndicator();
  const indicator = document.createElement('div');
  indicator.className = 'drop-indicator';
  container.appendChild(indicator);
}

function removeDropIndicator() {
  document.querySelectorAll('.drop-indicator').forEach(d => d.remove());
}

function reorderDraft(sourceId, beforeId) {
  if (sourceId === beforeId) return;
  const srcIdx = posts.findIndex(p => p.id === sourceId);
  if (srcIdx === -1) return;
  const [item] = posts.splice(srcIdx, 1);
  let insertAt;
  if (beforeId == null) {
    let lastDraftIdx = -1;
    posts.forEach((p, i) => { if (p.status === 'draft') lastDraftIdx = i; });
    insertAt = lastDraftIdx + 1;
  } else {
    insertAt = posts.findIndex(p => p.id === beforeId);
    if (insertAt < 0) insertAt = posts.length;
  }
  posts.splice(insertAt, 0, item);
  renderFeed();
}

// ══════════════════════════════════════════════════
