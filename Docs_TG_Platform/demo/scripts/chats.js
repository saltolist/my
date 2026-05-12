//  CHATS LIST
// ══════════════════════════════════════════════════
function renderChats() {
  // global
  let gHtml = '';
  if (globalChats.length === 0) gHtml = `<div class="empty"><div class="eico">💬</div><p>Нет глобальных чатов</p></div>`;
  globalChats.forEach(c => {
    gHtml += `<div class="chat-card" onclick="openGChat('${c.id}')">
      <div class="chat-card-icon">✦</div>
      <div class="chat-card-body">
        <div class="chat-card-title">${c.title}</div>
        <div class="chat-card-preview">"${c.preview}"</div>
      </div>
      <div class="chat-card-right">
        <div class="chat-card-date">${c.date}</div>
        <button class="chat-del-btn" onclick="event.stopPropagation();deleteGChat('${c.id}')">🗑</button>
      </div>
    </div>`;
  });
  document.getElementById('chats-global').innerHTML = gHtml;

  // local
  const localPosts = posts.filter(p => p.chatHistory.length > 0);
  let lHtml = '';
  if (localPosts.length === 0) lHtml = `<div class="empty"><div class="eico">📄</div><p>Нет локальных чатов</p></div>`;
  localPosts.forEach(p => {
    const last = p.chatHistory[p.chatHistory.length - 1];
    lHtml += `<div class="chat-card" onclick="openLocalChat(${p.id})">
      <div class="chat-card-icon">📄</div>
      <div class="chat-card-body">
        <div class="chat-card-title">${postTitle(p)}</div>
        <div class="chat-card-preview">"${truncate(last.text, 55)}"</div>
      </div>
      <div class="chat-card-right">
        <div class="chat-card-date">${p.date || p.created || ''}</div>
        <button class="to-post-btn" onclick="event.stopPropagation();openPost(${p.id})">→ пост</button>
      </div>
    </div>`;
  });
  document.getElementById('chats-local').innerHTML = lHtml;
}

function switchChatsTab(tab) {
  chatsTab = tab;
  document.getElementById('tab-global').classList.toggle('active', tab === 'global');
  document.getElementById('tab-local').classList.toggle('active', tab === 'local');
  document.getElementById('chats-global').style.display = tab === 'global' ? '' : 'none';
  document.getElementById('chats-local').style.display  = tab === 'local'  ? '' : 'none';
}

function openGChat(id) {
  currentGChat = globalChats.find(c => c.id === id);
  if (!currentGChat) return;
  document.getElementById('gchat-title').textContent = currentGChat.title;
  renderCurrentGChatMessages();
  navigate('gchat');
}

function openLocalChat(postId) { openPost(postId); }

function deleteGChat(id) {
  if (!confirm('Удалить чат?')) return;
  const idx = globalChats.findIndex(c => c.id === id);
  if (idx !== -1) globalChats.splice(idx, 1);
  renderChats();
}

// ══════════════════════════════════════════════════
