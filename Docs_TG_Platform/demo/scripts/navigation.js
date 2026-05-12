//  NAVIGATION
// ══════════════════════════════════════════════════
const SCREENS = ['home','gchat','feed','post','note','chats','notes','analytics','profile'];

function navigate(id) {
  if (!canLeaveNotePage(id)) return;
  if (!canLeaveProfileSettings(id)) return;
  closeMobileSidebar();
  SCREENS.forEach(s => {
    const el = document.getElementById('screen-' + s);
    if (el) el.classList.toggle('active', s === id);
  });
  // nav highlight — map screen id → nav id
  const map = { feed:'feed', post:'feed', note:'notes', chats:'chats', notes:'notes', analytics:'analytics', profile:'profile' };
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const navId = map[id];
  if (navId) { const n = document.getElementById('nav-' + navId); if (n) n.classList.add('active'); }
  // screen-specific renders
  if (id === 'feed')      renderFeed();
  if (id === 'chats')     renderChats();
  if (id === 'notes')     renderNotesList();
}

function goHome() {
  document.getElementById('home-input').value = '';
  navigate('home');
}

function openMobileSidebar() {
  document.body.classList.add('mobile-sidebar-open');
}

function closeMobileSidebar() {
  document.body.classList.remove('mobile-sidebar-open');
}

function toggleMobileSidebar() {
  document.body.classList.toggle('mobile-sidebar-open');
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeMobileSidebar();
});
