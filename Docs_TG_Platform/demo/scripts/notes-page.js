//  NOTE PAGE
// ══════════════════════════════════════════════════
function openGlobalNote(id) {
  const n = globalNotes.find(n => n.id === id);
  if (!n) return;
  currentNote = { ...n, isGlobal: true };
  if (!Array.isArray(currentNote.files)) currentNote.files = [];
  noteSavedSnapshot = buildNoteSnapshot(currentNote);
  noteFrom = 'notes';
  noteMode = 'view';
  navigate('note');
  renderNotePage();
}

function newGlobalNote() {
  const title = prompt('Название заметки:');
  if (!title) return;
  const nn = { id: 'gn' + Date.now(), title, ai: false, date: 'сейчас', body: '', files: [], isGlobal: true };
  globalNotes.unshift(nn);
  currentNote = { ...nn };
  noteSavedSnapshot = buildNoteSnapshot(currentNote);
  noteFrom = 'notes';
  noteMode = 'edit';
  navigate('note');
  renderNotePage();
}

function renderNotePage() {
  const n = currentNote;
  if (!n) return;
  if (!Array.isArray(n.files)) n.files = [];

  // Header row
  const backLabel = n.isGlobal ? 'Заметки' : 'Лента / Пост';
  const hdr = document.getElementById('note-hdr-row');
  hdr.innerHTML = `
    <div class="breadcrumb" style="flex:1">
      <span class="bc-link" onclick="backFromNote()">${backLabel}</span>
      <span>/</span>
      <b>${truncate(n.title, 30)}</b>
    </div>
    <button class="btn btn-ghost btn-sm" onclick="backFromNote()">← Назад</button>
    <div class="ctx-wrap">
      <button class="ctx-btn" onclick="ctxToggle('note-ctx')">•••</button>
      <div class="ctx-dropdown" id="note-ctx">
        <div class="ctx-item danger" onclick="ctxDeleteNote()">🗑 Удалить заметку</div>
      </div>
    </div>`;

  // Body
  const body = document.getElementById('note-page-body');
  const aiToggleHtml = n.isGlobal
    ? `<button class="ai-toggle ${n.ai?'on':''}" onclick="toggleNoteAI()">${n.ai ? '● Учитывать ИИ' : '○ Учитывать ИИ'}</button>`
    : '';

  if (noteMode === 'view') {
    body.innerHTML = `
      <div class="note-layout">
        <div class="note-shell">
          <div class="note-shell-header">
            <div class="note-title-block">
              <div class="note-title-row">
                <div class="note-title-static" id="note-title-static-el">${n.title}</div>
              </div>
            </div>
            <div class="note-ctrl">
              ${aiToggleHtml}
              <button class="btn btn-ghost btn-sm" onclick="setNoteMode('edit')">Ред.</button>
              <button class="btn btn-primary btn-sm" id="note-save-btn" onclick="saveNote()">Сохранить</button>
            </div>
          </div>
          <div class="note-shell-content">
            ${!n.isGlobal ? `<div class="note-local-info">📌 Локальная &nbsp;•&nbsp; <a onclick="openPost(${n.postId})">→ пост</a></div>` : ''}
            <div class="note-body-view">${n.body || '<span style="color:var(--text3)">Заметка пустая</span>'}</div>
            ${renderNoteFilesHTML(n.files)}
          </div>
        </div>
        <div class="note-timestamps">Создана: ${n.date} &nbsp;•&nbsp; Изменена: ${n.date}</div>
      </div>
      `;
  } else {
    body.innerHTML = `
      <div class="note-layout">
        <div class="note-shell">
          <div class="note-shell-header">
            <div class="note-title-block">
              <div class="note-title-row">
                <textarea class="note-title-edit" id="note-title-inp" rows="1" placeholder="Без названия">${n.title || ''}</textarea>
              </div>
            </div>
            <div class="note-ctrl">
              ${aiToggleHtml}
              <button class="btn btn-ghost btn-sm" onclick="triggerNoteFilePicker()">📎 Файл</button>
              <button class="btn btn-ghost btn-sm" onclick="setNoteMode('view')">Просмотр</button>
              <button class="btn btn-primary btn-sm" id="note-save-btn" onclick="saveNote()">Сохранить</button>
            </div>
          </div>
          <div class="note-shell-content">
            ${!n.isGlobal ? `<div class="note-local-info">📌 Локальная &nbsp;•&nbsp; <a onclick="openPost(${n.postId})">→ пост</a></div>` : ''}
            <textarea class="note-body-edit" id="note-body-inp">${n.body}</textarea>
            ${renderNoteFilesHTML(n.files)}
          </div>
        </div>
        <div class="note-timestamps">Создана: ${n.date} &nbsp;•&nbsp; Изменена: сейчас</div>
      </div>
      `;
    const titleInp = document.getElementById('note-title-inp');
    const bodyInp = document.getElementById('note-body-inp');
    if (titleInp) {
      titleInp.addEventListener('input', () => {
        autoGrowNoteTitle(titleInp);
        fitNoteTitleSize();
        syncNoteSaveButtonState();
      });
      autoGrowNoteTitle(titleInp);
      fitNoteTitleSize();
    }
    if (bodyInp) {
      autoGrowNoteBody(bodyInp);
      bodyInp.addEventListener('input', () => {
        autoGrowNoteBody(bodyInp);
        syncNoteSaveButtonState();
      });
    }
  }
  if (noteMode !== 'edit') {
    fitNoteTitleSize();
  }
  requestAnimationFrame(() => fitNoteTitleSize());
  syncNoteSaveButtonState();
}

function renderNoteFilesHTML(files = []) {
  if (!files.length) return '';
  return `<div class="note-files">
    <div class="note-files-label">Вложения</div>
    ${files.map(f => {
      if (f.url) {
        return `<a class="note-file-item" href="${f.url}" target="_blank" rel="noopener noreferrer">📎 <b>${f.name}</b> <span>(${f.type || 'file'})</span></a>`;
      }
      return `<div class="note-file-item">📎 <b>${f.name}</b> <span>(${f.type || 'file'})</span></div>`;
    }).join('')}
  </div>`;
}

function setNoteMode(m) {
  if (noteMode === 'edit' && m === 'view') {
    applyLiveNoteDraftToCurrentNote();
  }
  noteMode = m;
  renderNotePage();
}

function applyLiveNoteDraftToCurrentNote() {
  if (!currentNote) return;
  const draft = getLiveNoteDraft();
  if (typeof draft.title === 'string') currentNote.title = draft.title;
  if (typeof draft.body === 'string') currentNote.body = draft.body;
  currentNote.ai = !!draft.ai;
}

function buildNoteSnapshot(note, draft = {}) {
  const title = draft.title ?? note.title ?? '';
  const body = draft.body ?? note.body ?? '';
  const ai = draft.ai ?? !!note.ai;
  const files = (draft.files ?? note.files ?? []).map(f => ({ name: f.name || '', type: f.type || '', url: f.url || '' }));
  return JSON.stringify({ title, body, ai, files });
}

function getLiveNoteDraft() {
  if (!currentNote) return {};
  const titleInp = document.getElementById('note-title-inp');
  const bodyInp = document.getElementById('note-body-inp');
  const titleRaw = titleInp
    ? (typeof titleInp.value === 'string' ? titleInp.value : (titleInp.textContent || ''))
    : currentNote.title;
  return {
    title: (titleRaw || '').trim(),
    body: bodyInp ? bodyInp.value : currentNote.body,
    ai: currentNote.ai,
    files: currentNote.files || [],
  };
}

function hasUnsavedNoteChanges() {
  if (!currentNote) return false;
  const snapshot = buildNoteSnapshot(currentNote, getLiveNoteDraft());
  return snapshot !== noteSavedSnapshot;
}

function canLeaveNotePage(nextScreenId) {
  const noteScreen = document.getElementById('screen-note');
  const isOnNoteScreen = !!noteScreen?.classList.contains('active');
  if (!isOnNoteScreen) return true;
  if (nextScreenId === 'note') return true;
  if (!hasUnsavedNoteChanges()) return true;
  return confirm('У вас есть несохранённые изменения в заметке. Покинуть страницу без сохранения?');
}

function syncNoteSaveButtonState() {
  const btn = document.getElementById('note-save-btn');
  if (!btn || !currentNote) return;
  const liveSnapshot = buildNoteSnapshot(currentNote, getLiveNoteDraft());
  btn.disabled = liveSnapshot === noteSavedSnapshot;
}

function autoGrowNoteBody(el) {
  if (!el) return;
  el.style.height = 'auto';
  el.style.height = Math.max(el.scrollHeight, 500) + 'px';
}

function autoGrowNoteTitle(el) {
  if (!el) return;
  el.style.height = 'auto';
  el.style.height = `${Math.max(el.scrollHeight, 35)}px`;
}

function fitNoteTitleSize() {
  const editEl = document.getElementById('note-title-inp');
  const viewEl = document.getElementById('note-title-static-el');
  const titleEl = editEl || viewEl;
  if (!titleEl) return;
  const maxSize = 28;
  const minSize = 13;
  const availableWidth = titleEl.clientWidth;
  if (availableWidth <= 0) return;
  let size = maxSize;
  titleEl.style.fontSize = `${size}px`;
  titleEl.style.whiteSpace = 'nowrap';
  if (editEl) editEl.setAttribute('wrap', 'off');
  while (size > minSize && titleEl.scrollWidth > availableWidth) {
    size -= 1;
    titleEl.style.fontSize = `${size}px`;
  }
  const fitsSingleLine = titleEl.scrollWidth <= availableWidth;
  titleEl.classList.remove('title-single-line', 'title-multi-line');
  titleEl.classList.add(fitsSingleLine ? 'title-single-line' : 'title-multi-line');

  if (editEl) {
    editEl.setAttribute('wrap', fitsSingleLine ? 'off' : 'soft');
    editEl.style.whiteSpace = fitsSingleLine ? 'nowrap' : 'pre-wrap';
    editEl.style.overflowX = 'hidden';
    if (fitsSingleLine) {
      editEl.style.height = '34px';
    } else {
      editEl.style.height = 'auto';
      autoGrowNoteTitle(editEl);
    }
  } else {
    titleEl.style.whiteSpace = fitsSingleLine ? 'nowrap' : 'normal';
  }
}

function saveNote() {
  const draftSnapshot = buildNoteSnapshot(currentNote, getLiveNoteDraft());
  if (draftSnapshot === noteSavedSnapshot) return;
  const titleInp = document.getElementById('note-title-inp');
  const bodyInp  = document.getElementById('note-body-inp');
  if (titleInp) {
    const titleRaw = typeof titleInp.value === 'string' ? titleInp.value : (titleInp.textContent || '');
    currentNote.title = titleRaw.trim() || currentNote.title;
  }
  if (bodyInp)  currentNote.body  = bodyInp.value;
  if (!Array.isArray(currentNote.files)) currentNote.files = [];

  if (currentNote.isGlobal) {
    const idx = globalNotes.findIndex(n => n.id === currentNote.id);
    if (idx !== -1) Object.assign(globalNotes[idx], { title: currentNote.title, body: currentNote.body, files: currentNote.files });
  } else {
    const post = posts.find(p => p.id === currentNote.postId);
    if (post) {
      const idx = post.notes.findIndex(n => n.id === currentNote.id);
      if (idx !== -1) Object.assign(post.notes[idx], { title: currentNote.title, body: currentNote.body, files: currentNote.files });
    }
  }
  noteSavedSnapshot = buildNoteSnapshot(currentNote);
  renderNotePage();
}

function triggerNoteFilePicker() {
  const inp = document.getElementById('note-file-input');
  if (inp) inp.click();
}

function onNoteFilePicked(event) {
  const file = event?.target?.files?.[0];
  if (!file || !currentNote) return;
  if (!Array.isArray(currentNote.files)) currentNote.files = [];
  currentNote.files.push({
    id: 'nf' + Date.now(),
    name: file.name,
    type: file.type || 'file',
    url: URL.createObjectURL(file),
  });
  const bodyInp = document.getElementById('note-body-inp');
  const fileBlock = `\n[Файл: ${file.name}]`;
  if (bodyInp) {
    bodyInp.value = bodyInp.value.trimEnd() + fileBlock;
    currentNote.body = bodyInp.value;
    autoGrowNoteBody(bodyInp);
  } else {
    currentNote.body = (currentNote.body || '').trimEnd() + fileBlock;
  }
  renderNotePage();
  event.target.value = '';
}

function toggleNoteAI() {
  currentNote.ai = !currentNote.ai;
  renderNotePage();
}

function backFromNote() {
  if (noteFrom === 'post') { navigate('post'); }
  else { navigate('notes'); }
}

// ══════════════════════════════════════════════════
