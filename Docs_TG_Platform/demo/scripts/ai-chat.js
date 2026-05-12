//  HOME → sends into global chat
// ══════════════════════════════════════════════════
const globalReplies = {
  'контент-план': 'Вот контент-план на следующую неделю:\n\n📅 Пн, 4 мая — «Психология денег»: продолжение серии про барьеры\n📅 Ср, 6 мая — «Разбор»: ошибки начинающих инвесторов\n📅 Пт, 8 мая — «Личный опыт»: что купил в апреле\n\nОптимальное время: 19:00 в будни.',
  'рубрик': 'По метрикам за 3 месяца:\n\n🟠 Личный опыт — 5 800 средний охват\n🔵 Психология денег — 5 100\n🟣 Разбор — 4 200\n🟢 Инструменты — 3 600 (хуже всего)',
  'тем': '5 идей по профилю канала:\n\n1. «Как я выбрал брокера: 3 ошибки» — личный опыт\n2. «Инфляция съедает депозит: сколько именно» — конкретика\n3. «Первый год: честная статистика» — итоги\n4. «Почему я не доверяю советникам» — мнение\n5. «ОФЗ без страха» — разбор',
  'охват': 'Охваты снизились в конце апреля — совпало с уменьшением частоты постов: три недели по 2 поста вместо 4–5. Рекомендую вернуться к ритму.',
};

function composeVariantText(baseReply, label, idx) {
  const tails = [
    'Фокус: структурно и практично.',
    'Фокус: более разговорный тон.',
    'Фокус: кратко, без потери сути.',
    'Фокус: акцент на метриках и выводах.',
  ];
  return `${baseReply}\n\n— ${label}\n${tails[idx % tails.length]}`;
}

function buildAiMessage(baseReply, scope) {
  if (aiProfileConfig.multiResponseEnabled) {
    const pairs = getMultiResponsePairs();
    if (pairs.length > 0) {
      const variants = pairs.map((pair, idx) => ({
        key: pair.id,
        label: pair.label,
        text: composeVariantText(baseReply, pair.label, idx),
      }));
      return { role: 'ai', variants, selectedVariant: 0, mode: 'multi' };
    }
  }
  const target = composerTargets[scope] || {};
  const llmLabel = getLlmModelLabel(target.llmId);
  const webLabel = getWebSearchModelLabel(target.webId);
  const label = target.webId ? `${llmLabel} + ${webLabel}` : llmLabel;
  return {
    role: 'ai',
    text: composeVariantText(baseReply, label, 0),
    mode: 'single',
    targetLabel: label,
    llmLabel,
    webLabel,
  };
}

function hasLlmForSend(scope) {
  if (aiProfileConfig.multiResponseEnabled) {
    return aiProfileConfig.llmModels.some(item => item.provider && item.model && item.active && item.includeInMulti);
  }
  const target = composerTargets[scope] || {};
  if (!target.llmId) return false;
  return aiProfileConfig.llmModels.some(item => item.id === target.llmId && item.provider && item.model && item.active);
}

function assertLlmReady(scope) {
  if (hasLlmForSend(scope)) return true;
  alert('Активируйте LLM модель.');
  return false;
}

function renderCurrentGChatMessages() {
  const msgs = document.getElementById('gchat-messages');
  if (!msgs || !currentGChat) return;
  msgs.innerHTML = '';
  currentGChat.history.forEach((message, idx) => {
    msgs.innerHTML += chatMsgHTML(message, { scope: 'gchat', entityId: currentGChat.id, index: idx });
  });
  msgs.scrollTop = msgs.scrollHeight;
}

function sendHome() {
  const inp = document.getElementById('home-input');
  const text = inp.value.trim();
  if (!text) return;
  if (!assertLlmReady('home')) return;
  inp.value = ''; autoResize(inp);
  // create new chat and open it
  const nc = { id: 'gc' + Date.now(), title: truncate(text, 40), preview: text, date: 'сейчас', history: [] };
  globalChats.unshift(nc);
  currentGChat = nc;
  document.getElementById('gchat-title').textContent = nc.title;
  navigate('gchat');
  currentGChat.history.push({ role: 'user', text });
  renderCurrentGChatMessages();
  setTimeout(() => {
    currentGChat.history.push(buildAiMessage(getGlobalReply(text), 'home'));
    renderCurrentGChatMessages();
  }, 900);
}

function homeSuggest(el) {
  document.getElementById('home-input').value = el.textContent;
  sendHome();
}

function sendGChat() {
  if (!currentGChat) return;
  const inp = document.getElementById('gchat-input');
  const text = inp.value.trim();
  if (!text) return;
  if (!assertLlmReady('gchat')) return;
  inp.value = ''; autoResize(inp);
  currentGChat.history.push({ role: 'user', text });
  renderCurrentGChatMessages();
  setTimeout(() => {
    currentGChat.history.push(buildAiMessage(getGlobalReply(text), 'gchat'));
    renderCurrentGChatMessages();
  }, 900);
}

function getGlobalReply(text) {
  const t = text.toLowerCase();
  for (const k in globalReplies) { if (t.includes(k)) return globalReplies[k]; }
  return 'Анализирую контекст канала... Дай чуть больше деталей: это про конкретный пост или про канал в целом?';
}

// ══════════════════════════════════════════════════
