//  CONTEXT MENUS
// ══════════════════════════════════════════════════
function ctxToggle(id) {
  const menu = document.getElementById(id);
  if (!menu) return;
  const isOpen = menu.classList.contains('open');
  document.querySelectorAll('.ctx-dropdown').forEach(d => d.classList.remove('open'));
  if (!isOpen) menu.classList.add('open');
}
document.addEventListener('click', e => {
  if (!e.target.closest('.ctx-wrap')) document.querySelectorAll('.ctx-dropdown').forEach(d => d.classList.remove('open'));
});

function ctxPostEdit() {
  document.querySelectorAll('.ctx-dropdown').forEach(d => d.classList.remove('open'));
  if (!currentPost) return;
  postMode  = 'chat';
  isEditing = true;
  renderPostHeader();
  renderPostBody();
  setTimeout(() => {
    const card = document.getElementById('post-msg-card');
    if (card) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const ta = document.getElementById('post-text-edit');
    if (ta) { ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length); }
  }, 50);
}
function ctxPostDelete() {
  document.querySelectorAll('.ctx-dropdown').forEach(d => d.classList.remove('open'));
  if (!currentPost) return;
  if (!confirm(`Удалить пост «${postTitle(currentPost)}»?`)) return;
  const idx = posts.findIndex(p => p.id === currentPost.id);
  if (idx !== -1) posts.splice(idx, 1);
  currentPost = null;
  navigate('feed');
}
function ctxDeleteChat() {
  document.querySelectorAll('.ctx-dropdown').forEach(d => d.classList.remove('open'));
  if (!currentGChat) return;
  if (!confirm(`Удалить чат «${currentGChat.title}»?`)) return;
  const idx = globalChats.findIndex(c => c.id === currentGChat.id);
  if (idx !== -1) globalChats.splice(idx, 1);
  currentGChat = null;
  navigate('chats');
}
function ctxDeleteNote() {
  document.querySelectorAll('.ctx-dropdown').forEach(d => d.classList.remove('open'));
  if (!currentNote) return;
  if (!confirm(`Удалить заметку «${currentNote.title}»?`)) return;
  if (currentNote.isGlobal) {
    const idx = globalNotes.findIndex(n => n.id === currentNote.id);
    if (idx !== -1) globalNotes.splice(idx, 1);
    navigate('notes');
  } else {
    const post = posts.find(p => p.id === currentNote.postId);
    if (post) post.notes = post.notes.filter(n => n.id !== currentNote.id);
    navigate('post');
    renderPostBody();
  }
}

// ══════════════════════════════════════════════════
