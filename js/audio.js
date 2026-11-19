// ═══════════════════════════════════════════════════
//         AUDIO INTERVIEW MODULE
// ═══════════════════════════════════════════════════

let resumeFile = null;
let audioFile  = null;

function handleResumeUpload(input) {
  resumeFile = input.files[0];
  if (!resumeFile) return;
  const zone = document.getElementById('resume-zone');
  zone.classList.add('uploaded');
  zone.querySelector('h4').textContent = '✅ ' + resumeFile.name;
  zone.querySelector('p').textContent  = (resumeFile.size / 1024).toFixed(1) + ' KB';
}

function handleAudioUpload(input) {
  audioFile = input.files[0];
  if (!audioFile) return;
  const zone = document.getElementById('audio-zone');
  zone.classList.add('uploaded');
  zone.querySelector('h4').textContent = '✅ ' + audioFile.name;
  zone.querySelector('p').textContent  = (audioFile.size / 1024).toFixed(1) + ' KB';
  transcribeAudio();
}

async function transcribeAudio() {
  if (!audioFile) return;
  setStatus('audio-status', 'Transcribing audio via Python speech engine...', 'processing');
  const formData = new FormData();
  formData.append('audio', audioFile);
  try {
    const res  = await fetch('/api/transcribe', { method: 'POST', body: formData });
    const data = await res.json();
    if (data.transcript) {
      document.getElementById('manual-transcript').value = data.transcript;
      setStatus('audio-status', '✅ Audio transcribed! Click Analyze.', 'success');
    } else {
      setStatus('audio-status', '⚠️ Could not auto-transcribe. Type transcript manually.', 'error');
    }
  } catch (e) {
    setStatus('audio-status', 'ℹ️ Type transcript manually in the box below.', '');
  }
}

async function analyzeAudio() {
  const transcript = document.getElementById('manual-transcript').value.trim();
  const expected   = document.getElementById('expected-answer').value.trim();

  if (!transcript) { alert('Please enter the candidate transcript first.'); return; }
  if (!expected)   { alert('Please enter the expected / ideal answer.'); return; }

  document.getElementById('analyze-btn').disabled = true;
  setStatus('audio-status', 'Analyzing with Python AI engine...', 'processing');

  try {
    const res  = await fetch('/api/analyze', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ transcript, expected })
    });
    const data = await res.json();

    if (data.error) {
      alert('Error: ' + data.error);
      setStatus('audio-status', data.error, 'error');
      document.getElementById('analyze-btn').disabled = false;
      return;
    }

    await delay(300);
    setRing('ring-conf', 'val-conf', data.conf);
    setRing('ring-comm', 'val-comm', data.comm);
    setRing('ring-tech', 'val-tech', data.tech);

    const [, color] = performanceGrade(data.overall);
    document.getElementById('result-banner').classList.add('show');
    document.getElementById('result-grade').innerHTML    = `<span style="color:${color}">${data.grade}</span>`;
    document.getElementById('result-overall').textContent = `Overall Performance: ${data.overall}%`;

    document.getElementById('feedback-section').style.display = 'block';
    document.getElementById('feedback-items').innerHTML = data.feedback.map(f => `
      <div class="feedback-item ${f.type}">
        <strong>${f.label} — ${f.score}%</strong><br/>${f.text}
      </div>`).join('');

    document.getElementById('transcript-section').style.display = 'block';
    document.getElementById('transcript-display').textContent   = transcript;

    ['astep-1','astep-2','astep-3'].forEach(id => {
      const el = document.getElementById(id);
      el.classList.remove('active'); el.classList.add('done');
      el.querySelector('.step-circle').textContent = '✓';
    });
    document.getElementById('astep-4').classList.add('active');

    // ✅ UPDATE OVERALL SCORE
    updateOverallScore('audio', data.overall);

    setStatus('audio-status', `✅ Analysis complete! Overall: ${data.overall}% — ${data.grade}`, 'success');

  } catch (e) {
    // Fallback: browser-side scoring
    setStatus('audio-status', 'Running browser scoring...', 'processing');
    await delay(400);
    runLocalScoring(transcript, expected);
  }
  document.getElementById('analyze-btn').disabled = false;
}

function runLocalScoring(transcript, expected) {
  const conf    = scoreConfidence(transcript);
  const comm    = scoreCommunication(transcript);
  const tech    = scoreTechnical(transcript, expected);
  const overall = Math.round((conf + comm + tech) / 3);
  const [grade, color] = performanceGrade(overall);

  setRing('ring-conf', 'val-conf', conf);
  setRing('ring-comm', 'val-comm', comm);
  setRing('ring-tech', 'val-tech', tech);

  document.getElementById('result-banner').classList.add('show');
  document.getElementById('result-grade').innerHTML    = `<span style="color:${color}">${grade}</span>`;
  document.getElementById('result-overall').textContent = `Overall Performance: ${overall}%`;

  document.getElementById('feedback-section').style.display = 'block';
  const items = [
    { label:'😊 Confidence',    score:conf, good:'Strong positive tone.', bad:'Needs more confidence.' },
    { label:'🗣️ Communication', score:comm, good:'Clear, fluent responses.', bad:'Improve structure and vocabulary.' },
    { label:'💡 Technical',     score:tech, good:'Good keyword alignment.', bad:'Use more technical terms.' },
  ];
  document.getElementById('feedback-items').innerHTML = items.map(i => `
    <div class="feedback-item ${i.score>=70?'good':i.score>=50?'warn':'bad'}">
      <strong>${i.label} — ${i.score}%</strong><br/>${i.score>=70?i.good:i.bad}
    </div>`).join('');

  document.getElementById('transcript-section').style.display = 'block';
  document.getElementById('transcript-display').textContent   = transcript;

  // ✅ UPDATE OVERALL SCORE
  updateOverallScore('audio', overall);

  setStatus('audio-status', `✅ Done! Overall: ${overall}% — ${grade}`, 'success');
}