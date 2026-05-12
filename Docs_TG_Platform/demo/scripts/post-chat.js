//  POST CHAT
// ══════════════════════════════════════════════════
function sendPost() {
  if (!currentPost) return;
  const inp = document.getElementById('post-input');
  const text = inp.value.trim();
  if (!text) return;
  if (!assertLlmReady('post')) return;
  inp.value = ''; autoResize(inp);
  currentPost.chatHistory.push({ role: 'user', text });
  renderPostBody();
  setTimeout(() => {
    const reply = getPostReply(text);
    currentPost.chatHistory.push(buildAiMessage(reply, 'post'));
    renderPostBody();
    const area = document.getElementById('post-chat');
    if (area) area.scrollTop = area.scrollHeight;
  }, 800);
}

function getPostReply(text) {
  const t = text.toLowerCase();
  if (t.includes('перепиш') || t.includes('rewrite'))
    return 'Вот переработанная версия вступления:\n\n«Есть вещь, которую я откладывал два года. Не из-за лени — из-за страха.»\n\nСтало короче и острее. Применить?';
  if (t.includes('заголов'))
    return 'Варианты заголовков:\n\n1. «Два года я боялся нажать одну кнопку»\n2. «Паралич анализа в личных финансах»\n3. «Открыл счёт с третьей попытки»';
  if (t.includes('почему') || t.includes('аналити'))
    return 'По паттернам канала: посты с личной историей преодоления страха дают на 35% больше охватов. Три фактора: конкретная ситуация, универсальная боль, практичное решение.';
  return 'Понял. Работаю с контекстом поста. Что именно хочешь улучшить — структуру, тон или конкретный абзац?';
}

// ══════════════════════════════════════════════════
