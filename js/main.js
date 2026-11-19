// ═══════════════════════════════════════════════════
//         MAIN APP — Navigation + Overall Score
// ═══════════════════════════════════════════════════

// Overall score tracker
const overallScores = {
  audio:    null,
  aptitude: null,
  coding:   null,
  video:    null,
};

// Called from each module when a result is ready
function updateOverallScore(module, score) {
  overallScores[module] = Math.round(score);
  renderOverallPanel();
}

function renderOverallPanel() {
  const panel = document.getElementById('overall-panel');
  if (!panel) return;

  const modules = [
    { key:'audio',    label:'🎙️ Audio',    color:'#3b82f6' },
    { key:'aptitude', label:'🧠 Aptitude',  color:'#6366f1' },
    { key:'coding',   label:'💻 Coding',    color:'#10b981' },
    { key:'video',    label:'📹 Video',     color:'#f59e0b' },
  ];

  const filled  = modules.filter(m => overallScores[m.key] !== null);
  const average = filled.length > 0
    ? Math.round(filled.reduce((s, m) => s + overallScores[m.key], 0) / filled.length)
    : null;

  const [grade, color] = average !== null ? performanceGrade(average) : ['--', '#64748b'];

  panel.innerHTML = `
    <div class="overall-header">
      <div class="overall-title">📊 Overall Performance</div>
      <div class="overall-score" style="color:${color}">
        ${average !== null ? average + '%' : '--'}
      </div>
      <div class="overall-grade" style="color:${color}">${grade}</div>
    </div>
    <div class="overall-bars">
      ${modules.map(m => `
        <div class="overall-bar-item">
          <div class="overall-bar-label">${m.label}</div>
          <div class="overall-bar-track">
            <div class="overall-bar-fill" style="
              width:${overallScores[m.key] !== null ? overallScores[m.key] : 0}%;
              background:${m.color};
              transition: width 1s ease;
            "></div>
          </div>
          <div class="overall-bar-val" style="color:${overallScores[m.key] !== null ? m.color : '#64748b'}">
            ${overallScores[m.key] !== null ? overallScores[m.key] + '%' : 'Not taken'}
          </div>
        </div>
      `).join('')}
    </div>
    <div class="overall-footer">
      ${filled.length}/4 modules completed
      ${filled.length === 4
        ? ' · <strong style="color:#10b981">Full Assessment Done ✅</strong>'
        : ' · Complete all modules to see your full score'}
    </div>
  `;
}

// ── Navigation ─────────────────────────────────────
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  document.getElementById('page-' + id).classList.add('active');
  document.querySelectorAll('.nav-tab').forEach(t => {
    if (t.getAttribute('onclick')?.includes(`'${id}'`)) t.classList.add('active');
  });
  if (id === 'coding' && !currentCodingQ) { buildLangSelector(); loadCodingQuestion(); }
  if (id === 'home') renderOverallPanel();
  if (id === 'schedule') renderSchedulePage();
  if (id === 'multilingual') renderMultilingualPage();
  if (id === 'jobs') renderJobsPage();
}

function doLogout() {
  fetch('/api/auth/logout', { method: 'POST' })
    .then(() => window.location.href = '/login')
    .catch(() => window.location.href = '/login');
}

// ── App Init ────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  buildLangSelector();
  loadCodingQuestion();
  renderOverallPanel();
  console.log('✅ InterviewAI loaded.');
});