//  POST SPACE
// ══════════════════════════════════════════════════
function openPost(id) {
  if (id === 'new') {
    const np = { id: Date.now(), status: 'draft', created: 'только что', rubric: null, text: '', notes: [], chatHistory: [] };
    posts.push(np);
    currentPost = np;
  } else {
    currentPost = posts.find(p => p.id === id);
  }
  if (!currentPost) return;
  postMode  = 'chat';
  isEditing = false;
  navigate('post');
  renderPostHeader();
  renderPostBody();
}

function renderPostHeader() {
  const p = currentPost;
  document.getElementById('post-bc').textContent = truncate(postTitle(p), 38);

  // rebuild ctx menu items based on post status
  let ctxItems = ``;
  ctxItems += `<div class="ctx-item ${postMode==='notes'?'active':''}" onclick="togglePostMode()">${postMode === 'chat' ? '📋 Заметки' : '💬 Чат'}</div>`;
  if (p.status === 'draft') {
    ctxItems += `<div class="ctx-item" onclick="ctxPublishPost()">📢 Опубликовать</div>`;
    ctxItems += `<div class="ctx-item" onclick="ctxSchedulePost()">🕐 Запланировать</div>`;
  }
  if (p.status === 'scheduled') {
    ctxItems += `<div class="ctx-item" onclick="ctxPublishPost()">📢 Опубликовать</div>`;
    ctxItems += `<div class="ctx-item" onclick="ctxCancelSchedule()">✕ Отменить публикацию</div>`;
  }
  ctxItems += `<div class="ctx-item danger" onclick="ctxPostDelete()">🗑 Удалить</div>`;
  const ctxEl = document.getElementById('post-ctx');
  if (ctxEl) ctxEl.innerHTML = ctxItems;
}

function renderPostBody() {
  const p = currentPost;
  const chatEl  = document.getElementById('post-chat');
  const notesEl = document.getElementById('post-notes');
  const inputEl = document.getElementById('post-chat-input-wrap');

  if (postMode === 'chat') {
    chatEl.classList.remove('hidden');
    notesEl.classList.remove('visible');
    inputEl.style.display = '';

    let badge;
    if (p.status === 'published') badge = `<span class="status-badge badge-pub">● Опубликован</span>`;
    else if (p.status === 'scheduled') badge = `<span class="status-badge badge-sch">◷ Отложено · ${p.date}</span>`;
    else badge = `<span class="status-badge badge-dft">✏ Черновик</span>`;
    const metrics = (p.status === 'published' && p.metrics)
      ? `<span class="post-card-metrics">👁 ${p.metrics.views} · ❤ ${p.metrics.reactions} · ↗ ${p.metrics.reposts}</span>`
      : '';

    let inner = `<div class="post-msg-card" id="post-msg-card">
      <div class="post-msg-label">Вы</div>`;
    if (isEditing) {
      inner += `<textarea class="post-msg-textarea" id="post-text-edit">${p.text}</textarea>
        <div class="post-edit-actions">
          <button class="btn btn-ghost btn-sm" onclick="cancelEdit()">Отмена</button>
          <button class="btn btn-primary btn-sm" onclick="saveEdit()">Сохранить</button>
        </div>`;
    } else {
      inner += `<div class="post-msg-text">${p.text || '<span style="color:var(--text3)">Пост пустой — начни писать...</span>'}</div>
        <div class="post-status-row">${badge}${metrics}<button class="edit-trigger-btn" onclick="startEdit()">✏ Редактировать</button></div>`;
    }
    inner += `</div>`;

    p.chatHistory.forEach((m, idx) => { inner += chatMsgHTML(m, { scope: 'post', entityId: p.id, index: idx }); });
    chatEl.innerHTML = `<div class="post-body-inner">${inner}</div>`;
    chatEl.onscroll = syncPostJumpButton;
    syncPostJumpButton();
  } else {
    chatEl.classList.add('hidden');
    notesEl.classList.add('visible');
    inputEl.style.display = 'none';
    chatEl.onscroll = null;
    togglePostJumpButton(false);
    renderPostNotes();
  }
}

function renderPostNotes() {
  const p = currentPost;
  let html = '';
  p.notes.forEach(n => {
    html += `<div class="note-card" onclick="openNoteFromPost(${n.id})">
      <div class="note-card-body">
        <div class="note-card-title">${n.title}</div>
        <div class="note-card-preview-post">${n.body || 'Пустая заметка'}</div>
      </div>
      <div class="note-card-footer">
        <span class="note-date">${n.date}</span>
        <div style="display:flex;gap:6px;align-items:center">
          <button class="note-ai-toggle ${n.ai?'on':''}" onclick="event.stopPropagation();togglePostNoteAI(${n.id})">${n.ai?'● ИИ':'○ ИИ'}</button>
          <span class="note-del" onclick="event.stopPropagation();deletePostNote(${n.id})">🗑</span>
        </div>
      </div>
    </div>`;
  });
  html += `<div class="note-card new-note" onclick="addPostNote()">
    <span style="font-size:22px">＋</span><span style="font-size:12px">Новая заметка</span>
  </div>`;
  if (p.notes.length === 0) html = `<div class="empty"><div class="eico">📝</div><p>Нет заметок для этого поста</p></div>` + html;
  document.getElementById('post-notes-inner').innerHTML = html;
}

function togglePostMode() {
  postMode = postMode === 'chat' ? 'notes' : 'chat';
  renderPostHeader();
  renderPostBody();
}

function startEdit() { isEditing = true; renderPostBody(); setTimeout(() => { const ta = document.getElementById('post-text-edit'); if(ta){ta.focus();ta.setSelectionRange(ta.value.length,ta.value.length);} },30); }
function cancelEdit() { isEditing = false; renderPostBody(); }
function saveEdit() {
  const ta = document.getElementById('post-text-edit');
  if (ta) { currentPost.text = ta.value; }
  isEditing = false; renderPostHeader(); renderPostBody();
}
function ctxPublishPost()   { document.querySelectorAll('.ctx-dropdown').forEach(d=>d.classList.remove('open')); currentPost.status='published'; currentPost.date='сегодня'; currentPost.metrics={views:'0',reactions:0,reposts:0}; renderPostHeader(); }
function ctxSchedulePost()  { document.querySelectorAll('.ctx-dropdown').forEach(d=>d.classList.remove('open')); currentPost.status='scheduled'; currentPost.date='10 мая 20:00'; renderPostHeader(); }
function ctxCancelSchedule(){ document.querySelectorAll('.ctx-dropdown').forEach(d=>d.classList.remove('open')); currentPost.status='draft'; currentPost.created='сейчас'; renderPostHeader(); }
function scrollToPostTop(){
  const c = document.getElementById('post-chat');
  if (c) c.scrollTo({ top: 0, behavior: 'smooth' });
}

function togglePostJumpButton(show) {
  const btn = document.getElementById('post-jump-btn');
  const actions = document.getElementById('post-hdr-actions');
  if (!btn) return;
  btn.classList.toggle('visible', !!show);
  if (actions) actions.classList.toggle('has-jump', !!show);
}

function syncPostJumpButton() {
  if (postMode !== 'chat') return togglePostJumpButton(false);
  const scrollArea = document.getElementById('post-chat');
  const postCard = document.getElementById('post-msg-card');
  if (!scrollArea || !postCard) return togglePostJumpButton(false);
  const scrollRect = scrollArea.getBoundingClientRect();
  const cardRect = postCard.getBoundingClientRect();
  const cardHiddenByTop = cardRect.bottom < (scrollRect.top + 8);
  togglePostJumpButton(cardHiddenByTop);
}

function getPostMediaItems() {
  if (!currentPost) return [];
  if (Array.isArray(currentPost.media)) return currentPost.media;
  if (typeof currentPost.media === 'string' && currentPost.media.trim()) return [currentPost.media.trim()];
  return [];
}

function renderPostAttachMenu() {
  const menu = document.getElementById('post-attach-menu');
  if (!menu) return;
  const media = getPostMediaItems();
  let html = '';
  if (media.length > 0) {
    media.forEach((item, idx) => {
      html += `<div class="ctx-item" onclick="attachPostMedia(${idx})">🖼 Медиа из поста: ${truncate(String(item), 28)}</div>`;
    });
  } else {
    html += `<div class="ctx-item disabled">🖼 В посте нет медиа</div>`;
  }
  html += `<div class="ctx-item" onclick="triggerPostFilePicker()">📎 Прикрепить файл с компьютера</div>`;
  menu.innerHTML = html;
}

function togglePostAttachMenu(event) {
  if (event) event.stopPropagation();
  renderPostAttachMenu();
  ctxToggle('post-attach-menu');
}

function attachPostMedia(idx) {
  document.querySelectorAll('.ctx-dropdown').forEach(d => d.classList.remove('open'));
  if (!currentPost) return;
  const media = getPostMediaItems();
  const picked = media[idx];
  if (!picked) return;
  currentPost.chatHistory.push({ role: 'user', text: `Прикрепил медиа из поста: ${picked}` });
  renderPostBody();
  const area = document.getElementById('post-chat');
  if (area) area.scrollTop = area.scrollHeight;
}

function triggerPostFilePicker() {
  document.querySelectorAll('.ctx-dropdown').forEach(d => d.classList.remove('open'));
  const fileInput = document.getElementById('post-file-input');
  if (fileInput) fileInput.click();
}

function onPostFilePicked(event) {
  if (!currentPost) return;
  const file = event?.target?.files?.[0];
  if (!file) return;
  currentPost.chatHistory.push({ role: 'user', text: `Прикрепил файл: ${file.name}` });
  renderPostBody();
  const area = document.getElementById('post-chat');
  if (area) area.scrollTop = area.scrollHeight;
  event.target.value = '';
}

function getPinnedPostsMediaItems() {
  return posts
    .filter(p => pinnedPostIds.includes(p.id))
    .flatMap(p => {
      if (Array.isArray(p.media)) return p.media.map(m => ({ postId: p.id, media: m, postTitle: postTitle(p) }));
      if (typeof p.media === 'string' && p.media.trim()) return [{ postId: p.id, media: p.media.trim(), postTitle: postTitle(p) }];
      return [];
    });
}

function renderGlobalAttachMenu(scope) {
  const menu = document.getElementById(`${scope}-attach-menu`);
  if (!menu) return;
  const media = getPinnedPostsMediaItems();
  let html = '';
  if (media.length > 0) {
    media.forEach((item, idx) => {
      html += `<div class="ctx-item" onclick="attachPinnedMedia('${scope}',${idx})">🖼 ${truncate(item.postTitle, 16)}: ${truncate(String(item.media), 20)}</div>`;
    });
  } else {
    html += `<div class="ctx-item disabled">🖼 В запиненных постах нет медиа</div>`;
  }
  html += `<div class="ctx-item" onclick="triggerGlobalFilePicker('${scope}')">📎 Прикрепить файл с компьютера</div>`;
  menu.innerHTML = html;
}

function toggleGlobalAttachMenu(event, scope) {
  if (event) event.stopPropagation();
  renderGlobalAttachMenu(scope);
  ctxToggle(`${scope}-attach-menu`);
}

function applyGlobalAttachment(scope, text) {
  if (scope === 'gchat' && currentGChat) {
    currentGChat.history.push({ role: 'user', text });
    renderCurrentGChatMessages();
    return;
  }
  const inp = document.getElementById('home-input');
  if (!inp) return;
  inp.value = inp.value.trim() ? `${inp.value}\n${text}` : text;
  autoResize(inp);
}

function attachPinnedMedia(scope, idx) {
  document.querySelectorAll('.ctx-dropdown').forEach(d => d.classList.remove('open'));
  const media = getPinnedPostsMediaItems();
  const picked = media[idx];
  if (!picked) return;
  applyGlobalAttachment(scope, `Прикрепил медиа из поста «${picked.postTitle}»: ${picked.media}`);
}

function triggerGlobalFilePicker(scope) {
  document.querySelectorAll('.ctx-dropdown').forEach(d => d.classList.remove('open'));
  const fileInput = document.getElementById(`${scope}-file-input`);
  if (fileInput) fileInput.click();
}

function onGlobalFilePicked(scope, event) {
  const file = event?.target?.files?.[0];
  if (!file) return;
  applyGlobalAttachment(scope, `Прикрепил файл: ${file.name}`);
  event.target.value = '';
}

function addPostNote() {
  const title = prompt('Название заметки:');
  if (!title) return;
  currentPost.notes.push({ id: Date.now(), title, date: 'сейчас', ai: false, body: '' });
  renderPostNotes();
}
function deletePostNote(id) {
  if (!confirm('Удалить заметку?')) return;
  currentPost.notes = currentPost.notes.filter(n => n.id !== id);
  renderPostNotes();
}
function togglePostNoteAI(id) {
  const n = currentPost?.notes.find(n => n.id === id);
  if (!n) return;
  n.ai = !n.ai;
  renderPostNotes();
}
function openNoteFromPost(id) {
  const n = currentPost.notes.find(n => n.id === id);
  if (!n) return;
  currentNote = { ...n, postId: currentPost.id, isGlobal: false };
  if (!Array.isArray(currentNote.files)) currentNote.files = [];
  noteSavedSnapshot = buildNoteSnapshot(currentNote);
  noteFrom = 'post';
  noteMode = 'view';
  navigate('note');
  renderNotePage();
}

// ══════════════════════════════════════════════════
