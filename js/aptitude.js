// ═══════════════════════════════════════════════════
//         APTITUDE TEST MODULE
// ═══════════════════════════════════════════════════

let aptQuestions    = [];
let aptUserAnswers  = [];
let aptTimerInterval= null;
let aptSeconds      = 0;
let aptStarted      = false;

function startAptitude() {
  const name = document.getElementById('apt-name').value.trim();
  if (!name) { alert('Please enter the candidate name.'); return; }
  newAptitudeTest();
}

function newAptitudeTest() {
  aptQuestions   = shuffle(APT_BANK).slice(0, 5);
  aptUserAnswers = new Array(5).fill(null);
  aptStarted     = true;
  aptSeconds     = 0;

  clearInterval(aptTimerInterval);
  aptTimerInterval = setInterval(() => {
    aptSeconds++;
    const m = String(Math.floor(aptSeconds / 60)).padStart(2, '0');
    const s = String(aptSeconds % 60).padStart(2, '0');
    document.getElementById('apt-timer').textContent = m + ':' + s;
  }, 1000);

  document.getElementById('apt-status-text').textContent = 'In progress';
  document.getElementById('apt-result-card').style.display = 'none';
  document.getElementById('apt-answered').textContent = '0';
  renderAptitudeQuestions();
}

function renderAptitudeQuestions() {
  const container = document.getElementById('apt-questions-container');
  container.innerHTML = aptQuestions.map((q, i) => `
    <div class="question-card" id="qcard-${i}">
      <span class="q-number">Q${i + 1}</span>
      <span class="badge badge-blue" style="margin-left:6px;font-size:11px;">${q.category}</span>
      <div class="q-text" style="margin-top:12px;">${q.q}</div>
      <div class="options">
        ${q.opts.map(opt => `
          <div class="option" id="opt-${i}-${safeId(opt)}" onclick="selectOption(${i}, '${escQ(opt)}')">
            <div style="width:18px;height:18px;border-radius:50%;border:2px solid currentColor;flex-shrink:0;"></div>
            ${opt}
          </div>
        `).join('')}
      </div>
    </div>
  `).join('') + `
    <button class="btn btn-primary btn-lg" style="width:100%;justify-content:center;margin-top:8px;" onclick="submitAptitude()">
      ✅ Submit Test
    </button>
  `;
}

function safeId(str) { return str.replace(/[^a-z0-9]/gi, '_'); }
function escQ(str)   { return str.replace(/'/g, "\\'"); }

function selectOption(qIdx, opt) {
  if (!aptStarted) return;
  aptUserAnswers[qIdx] = opt;
  document.getElementById(`qcard-${qIdx}`).classList.add('answered');
  document.querySelectorAll(`[id^="opt-${qIdx}-"]`).forEach(el => el.classList.remove('selected'));
  const el = document.getElementById(`opt-${qIdx}-${safeId(opt)}`);
  if (el) el.classList.add('selected');
  document.getElementById('apt-answered').textContent =
    aptUserAnswers.filter(a => a !== null).length;
}

function submitAptitude() {
  if (!aptStarted) { alert('Please start the test first.'); return; }
  clearInterval(aptTimerInterval);
  aptStarted = false;
  document.getElementById('apt-status-text').textContent = 'Completed';

  let score = 0;
  aptQuestions.forEach((q, i) => {
    const correct = aptUserAnswers[i] === q.ans;
    if (correct) score++;
    q.opts.forEach(opt => {
      const el = document.getElementById(`opt-${i}-${safeId(opt)}`);
      if (!el) return;
      el.classList.remove('selected');
      if (opt === q.ans)                              el.classList.add('correct');
      else if (opt === aptUserAnswers[i] && !correct) el.classList.add('wrong');
    });
  });

  const pct     = Math.round(score / aptQuestions.length * 100);
  const [grade, color] = performanceGrade(pct);
  const m = String(Math.floor(aptSeconds / 60)).padStart(2, '0');
  const s = String(aptSeconds % 60).padStart(2, '0');

  document.getElementById('apt-result-card').style.display = 'block';
  document.getElementById('apt-score-big').innerHTML =
    `<span style="color:${color}">${score}/${aptQuestions.length}</span>`;
  document.getElementById('apt-grade-text').innerHTML =
    `${grade} &nbsp;|&nbsp; ${pct}% &nbsp;|&nbsp; Time: ${m}:${s}`;
  document.getElementById('apt-result-details').innerHTML = `
    <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
      <span class="badge badge-green">✅ Correct: ${score}</span>
      <span class="badge badge-red">❌ Wrong: ${aptQuestions.length - score}</span>
      <span class="badge badge-blue">⏱️ ${m}:${s}</span>
    </div>
  `;

  // ✅ UPDATE OVERALL SCORE
  updateOverallScore('aptitude', pct);

  // Save to server
  try {
    fetch('/api/save-aptitude', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: document.getElementById('apt-name').value.trim(),
        score, total: aptQuestions.length, pct, time_sec: aptSeconds
      })
    });
  } catch(e) { /* offline */ }
}