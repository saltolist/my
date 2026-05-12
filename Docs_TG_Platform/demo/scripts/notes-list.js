//  NOTES LIST
// ══════════════════════════════════════════════════
let noteFilterState = 'all';
function setNoteScope(scope) {
  noteScope = scope;
  document.getElementById('notes-scope-global').classList.toggle('active', scope === 'global');
  document.getElementById('notes-scope-local').classList.toggle('active', scope === 'local');
  renderNotesList();
}

function setNoteFilter(f) {
  noteFilterState = f;
  ['all','ai','noai'].forEach(k => document.getElementById('nf-'+k).classList.toggle('active', k === f));
  renderNotesList();
}

function renderNotesList() {
  const q = (document.getElementById('notes-search').value || '').toLowerCase();
  const items = noteScope === 'global'
    ? globalNotes.map(n => ({ ...n, isGlobal: true }))
    : posts.flatMap(p => p.notes.map(n => ({ ...n, isGlobal: false, postId: p.id, postTitle: postTitle(p) })));

  const filtered = items.filter(n => {
    if (noteFilterState === 'ai'   && !n.ai) return false;
    if (noteFilterState === 'noai' &&  n.ai) return false;
    if (q && !n.title.toLowerCase().includes(q) && !n.body.toLowerCase().includes(q)) return false;
    return true;
  });
  let html = '';
  filtered.forEach(n => {
    const openAction = n.isGlobal
      ? `openGlobalNote('${n.id}')`
      : `openLocalNoteFromList(${n.postId}, ${n.id})`;
    html += `<div class="note-card-page" onclick="${openAction}">
      <div class="note-card-name">${n.title}</div>
      <div class="note-card-preview">${n.body}</div>
      ${!n.isGlobal ? `<div class="note-local-info">📌 Локальная • <a onclick="event.stopPropagation();openPost(${n.postId})">к посту</a></div>` : ''}
      <div class="note-card-footer-pg">
        <span class="note-card-date-pg">${n.date}</span>
        <div style="display:flex;gap:6px;align-items:center">
          <button class="note-ai-toggle ${n.ai?'on':''}" onclick="event.stopPropagation();toggleAnyNoteAI(${n.isGlobal ? `'global','${n.id}'` : `'local',${n.postId},${n.id}`})">${n.ai?'● ИИ':'○ ИИ'}</button>
          <button class="note-del" onclick="event.stopPropagation();deleteAnyNote(${n.isGlobal ? `'global','${n.id}'` : `'local',${n.postId},${n.id}`})">🗑</button>
        </div>
      </div>
    </div>`;
  });
  if (html === '') {
    const emptyText = noteScope === 'global' ? 'Нет глобальных заметок' : 'Нет локальных заметок';
    html = `<div class="empty" style="grid-column:1/-1"><div class="eico">📝</div><p>${emptyText}</p></div>`;
  }
  document.getElementById('notes-grid-pg').innerHTML = html;
}

function openLocalNoteFromList(postId, noteId) {
  const post = posts.find(p => p.id === postId);
  if (!post) return;
  const note = post.notes.find(n => n.id === noteId);
  if (!note) return;
  currentNote = { ...note, isGlobal: false, postId };
  noteFrom = 'notes';
  noteMode = 'view';
  navigate('note');
  renderNotePage();
}

function toggleAnyNoteAI(scope, idOrPostId, noteId) {
  if (scope === 'global') {
    const n = globalNotes.find(n => n.id === idOrPostId);
    if (n) n.ai = !n.ai;
  } else {
    const post = posts.find(p => p.id === idOrPostId);
    const n = post?.notes.find(x => x.id === noteId);
    if (n) n.ai = !n.ai;
  }
  renderNotesList();
}

function deleteAnyNote(scope, idOrPostId, noteId) {
  if (!confirm('Удалить заметку?')) return;
  if (scope === 'global') {
    const idx = globalNotes.findIndex(n => n.id === idOrPostId);
    if (idx !== -1) globalNotes.splice(idx, 1);
  } else {
    const post = posts.find(p => p.id === idOrPostId);
    if (post) post.notes = post.notes.filter(n => n.id !== noteId);
  }
  renderNotesList();
}

// ══════════════════════════════════════════════════
