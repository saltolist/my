//  FEED
// ══════════════════════════════════════════════════
function renderFeed() {
  const pub  = posts.filter(p => p.status === 'published');
  const sch  = posts.filter(p => p.status === 'scheduled');
  const dft  = posts.filter(p => p.status === 'draft');
  let inner = '';
  inner += `<div class="feed-section"><div class="section-label">Опубликованные</div><div class="feed-section-cards">${pub.map(postCardHTML).join('')}</div></div>`;
  inner += `<div class="feed-section"><div class="section-label">Отложенные</div><div class="feed-section-cards">${sch.map(postCardHTML).join('')}</div></div>`;
  inner += `<div class="feed-section"><div class="section-label">Черновики</div><div class="feed-section-cards">${dft.map(postCardHTML).join('')}</div></div>`;
  document.getElementById('feed-scroll').innerHTML = `<div class="feed-inner">${inner}</div>`;
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
  const drag   = p.status === 'draft' ? `<div class="drag-handle">⠿</div>` : '';
  const date   = p.status === 'published' ? `<span>·</span><span>${p.date}</span>` : '';

  const textHtml = p.text
    ? `<div class="post-card-text">${p.text}</div>`
    : `<div class="post-card-text empty">Пост пустой — нажми чтобы начать писать</div>`;
  const mediaHtml = p.media
    ? `<div class="post-card-media">🖼 ${p.media}</div>`
    : '';

  return `<div class="post-card" onclick="openPost(${p.id})">
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

// ══════════════════════════════════════════════════
