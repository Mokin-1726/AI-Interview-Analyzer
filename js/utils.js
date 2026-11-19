// ═══════════════════════════════════════════════════
//         SHARED UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function performanceGrade(score) {
  if (score >= 85) return ['Excellent 🏆', 'var(--accent3)'];
  if (score >= 70) return ['Good 👍',      'var(--accent)'];
  if (score >= 50) return ['Average ⚠️',   'var(--warn)'];
  return             ['Needs Improvement ❌', 'var(--danger)'];
}

function setStatus(id, msg, type = '') {
  const el = document.getElementById(id);
  el.style.display = 'flex';
  el.className = 'status-bar ' + type;
  el.innerHTML = type === 'processing'
    ? `<div class="spinner"></div> ${msg}`
    : `<span>${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span> ${msg}`;
}

function setRing(ringId, valId, pct) {
  const circumference = 283;
  const offset = circumference - (pct / 100) * circumference;
  document.getElementById(ringId).style.strokeDashoffset = offset;
  document.getElementById(valId).textContent = Math.round(pct) + '%';
}

// ─── Scoring Algorithms ────────────────────────────
function scoreConfidence(text) {
  if (!text.trim()) return 0;
  const positiveWords = [
    'excellent','good','great','strong','confident','experienced','skilled',
    'professional','successfully','achieved','led','built','developed',
    'implemented','designed','managed','improved','optimized','delivered'
  ];
  const words  = text.toLowerCase().split(/\s+/);
  const unique = new Set(words).size / (words.length + 1);
  const pos    = positiveWords.filter(w => text.toLowerCase().includes(w)).length / positiveWords.length;
  return Math.min(Math.round((pos * 0.6 + unique * 0.4) * 120), 100);
}

function scoreCommunication(text) {
  if (!text.trim()) return 0;
  const sentences = text.split('.').filter(s => s.trim());
  const avgLen = sentences.reduce((a, s) => a + s.trim().split(' ').length, 0) / (sentences.length || 1);
  const variety = new Set(text.toLowerCase().split(/\s+/)).size / (text.split(/\s+/).length + 1) * 100;
  return Math.min(Math.round(avgLen * 3 * 0.6 + variety * 0.4), 100);
}

function scoreTechnical(answer, expected) {
  if (!answer.trim() || !expected.trim()) return 0;
  const aWords = new Set(answer.toLowerCase().match(/\b[a-z]{3,}\b/g) || []);
  const eWords = new Set(expected.toLowerCase().match(/\b[a-z]{3,}\b/g) || []);
  const intersection = [...aWords].filter(w => eWords.has(w)).length;
  return Math.min(Math.round((intersection / (eWords.size + 1)) * 200), 100);
}