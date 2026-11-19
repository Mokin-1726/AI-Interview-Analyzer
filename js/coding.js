// ═══════════════════════════════════════════════════
//         CODING TEST MODULE — Multi Language
// ═══════════════════════════════════════════════════

let currentCodingQ = null;
let currentLang    = 'python';

function buildLangSelector() {
  const container = document.getElementById('lang-selector');
  if (!container) return;
  container.innerHTML = LANGUAGES.map(l => `
    <button class="lang-btn ${l.id === currentLang ? 'active' : ''}"
            id="lang-${l.id}"
            onclick="selectLanguage('${l.id}')">
      ${l.icon} ${l.label}
    </button>
  `).join('');
}

function selectLanguage(langId) {
  currentLang = langId;
  LANGUAGES.forEach(l => {
    const btn = document.getElementById('lang-' + l.id);
    if (btn) btn.className = 'lang-btn' + (l.id === langId ? ' active' : '');
  });
  const editor = document.getElementById('code-editor-box');
  if (editor) editor.value = STARTERS[langId] || '';
  const lang  = LANGUAGES.find(l => l.id === langId);
  const badge = document.getElementById('lang-badge');
  if (badge && lang) badge.textContent = lang.icon + ' ' + lang.label;
  const editorLabel = document.getElementById('editor-lang-label');
  if (editorLabel && lang) editorLabel.textContent = lang.label + ' 3';
  const resultCard = document.getElementById('code-result-card');
  if (resultCard) resultCard.style.display = 'none';
}

function loadCodingQuestion() {
  currentCodingQ = CODE_BANK[Math.floor(Math.random() * CODE_BANK.length)];
  document.getElementById('code-q-title').textContent = '📌 ' + currentCodingQ.title;
  document.getElementById('code-q-desc').textContent  = currentCodingQ.desc;
  document.getElementById('code-q-hint').textContent  = currentCodingQ.hint;

  const diffColors = { Easy:'badge-green', Medium:'badge-orange', Hard:'badge-red' };
  const badge = document.getElementById('code-difficulty-badge');
  if (badge) {
    badge.textContent = currentCodingQ.difficulty;
    badge.className   = 'badge ' + (diffColors[currentCodingQ.difficulty] || 'badge-blue');
  }
  const resultCard = document.getElementById('code-result-card');
  if (resultCard) resultCard.style.display = 'none';
}

function newCodingQuestion() {
  loadCodingQuestion();
  clearCode();
}

function clearCode() {
  const editor = document.getElementById('code-editor-box');
  if (editor) editor.value = STARTERS[currentLang] || '';
  const resultCard = document.getElementById('code-result-card');
  if (resultCard) resultCard.style.display = 'none';
}

function submitCode() {
  const name   = document.getElementById('code-name').value.trim();
  const answer = document.getElementById('code-editor-box').value.trim();

  if (!name)   { alert('Please enter candidate name.'); return; }
  if (!answer) { alert('Please write your solution first.'); return; }
  if (!currentCodingQ) { alert('No question loaded.'); return; }

  const langKeywords = currentCodingQ.keywords[currentLang] || [];
  const kwFound = langKeywords.filter(k => answer.includes(k));
  const score   = langKeywords.length > 0
    ? Math.min(Math.round((kwFound.length / langKeywords.length) * 100), 100)
    : 50;

  const [grade, color] = performanceGrade(score);
  const lang = LANGUAGES.find(l => l.id === currentLang);

  const feedbackItems = [];
  feedbackItems.push({
    type: score >= 70 ? 'good' : score >= 40 ? 'warn' : 'bad',
    text: score >= 80
      ? `✅ Excellent ${lang?.label || ''} solution! Great structure and logic.`
      : score >= 60
      ? `👍 Good attempt in ${lang?.label || ''}. Review logic and edge cases.`
      : `❌ Incomplete. Key elements missing: ${langKeywords.filter(k => !answer.includes(k)).join(', ')}`
  });

  const resultCard = document.getElementById('code-result-card');
  resultCard.style.display = 'block';
  document.getElementById('code-score-big').innerHTML =
    `<span style="color:${color}">${score}/100</span>`;
  document.getElementById('code-grade-text').textContent =
    `${grade} · ${lang?.icon || ''} ${lang?.label || ''}`;
  document.getElementById('code-feedback-items').innerHTML =
    feedbackItems.map(f => `<div class="feedback-item ${f.type}">${f.text}</div>`).join('');

  const solution = currentCodingQ.solutions[currentLang] || 'No solution available for this language.';
  document.getElementById('code-sample-solution').textContent = solution;

  // ✅ UPDATE OVERALL SCORE
  updateOverallScore('coding', score);

  // Save to server
  try {
    fetch('/api/save-coding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        question: currentCodingQ.title + ' (' + currentLang + ')',
        code: answer,
        score
      })
    });
  } catch(e) { /* offline */ }
}