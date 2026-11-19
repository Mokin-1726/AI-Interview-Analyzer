// ═══════════════════════════════════════════════════
//         VIDEO INTERVIEW MODULE
//         Camera handled by Python backend (OpenCV)
// ═══════════════════════════════════════════════════

let recTimerInterval = null;
let recSeconds       = 0;
let isRecording      = false;

async function startCamera() {
  setVideoStatus('⏳ Starting camera via Python...', 'processing');
  try {
    const res  = await fetch('/api/camera/start', { method: 'POST' });
    const data = await res.json();
    if (data.status === 'ok') {
      document.getElementById('video-overlay').style.display = 'none';
      document.getElementById('btn-start-cam').disabled = true;
      document.getElementById('btn-start-rec').disabled = false;
      setVideoStatus('✅ Camera active! Click Start Recording when ready.', 'success');
      // Start streaming frames
      streamFrames();
    } else {
      setVideoStatus('❌ ' + (data.error || 'Could not open camera.'), 'error');
    }
  } catch (e) {
    setVideoStatus('❌ Server error. Make sure python app.py is running.', 'error');
  }
}

function streamFrames() {
  const img = document.getElementById('camera-stream');
  if (img) {
    img.style.display = 'block';
    img.src = '/api/camera/stream?' + Date.now();
  }
}

function startRecording() {
  const name = document.getElementById('video-name').value.trim() || 'candidate';
  fetch('/api/camera/record/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  }).then(r => r.json()).then(data => {
    if (data.status === 'ok') {
      isRecording = true;
      recSeconds  = 0;
      document.getElementById('rec-badge').classList.add('show');
      document.getElementById('btn-start-rec').disabled = true;
      document.getElementById('btn-stop-rec').disabled  = false;
      setVideoStatus('🔴 Recording in progress...', 'processing');
      recTimerInterval = setInterval(() => {
        recSeconds++;
        const m = String(Math.floor(recSeconds / 60)).padStart(2, '0');
        const s = String(recSeconds % 60).padStart(2, '0');
        document.getElementById('rec-timer').textContent = m + ':' + s;
      }, 1000);
    } else {
      setVideoStatus('❌ Could not start recording: ' + (data.error || ''), 'error');
    }
  });
}

function stopRecording() {
  clearInterval(recTimerInterval);
  isRecording = false;
  fetch('/api/camera/record/stop', { method: 'POST' })
    .then(r => r.json())
    .then(data => {
      document.getElementById('rec-badge').classList.remove('show');
      document.getElementById('btn-stop-rec').disabled  = true;
      document.getElementById('btn-start-rec').disabled = false;
      document.getElementById('btn-download').disabled  = false;

      const name  = document.getElementById('video-name').value.trim()  || 'candidate';
      const topic = document.getElementById('video-topic').value.trim() || 'Not specified';
      const m = String(Math.floor(recSeconds / 60)).padStart(2, '0');
      const s = String(recSeconds % 60).padStart(2, '0');

      document.getElementById('video-saved-card').style.display = 'block';
      document.getElementById('video-saved-info').innerHTML = `
        <strong>Candidate:</strong> ${name}<br/>
        <strong>Topic:</strong> ${topic}<br/>
        <strong>Duration:</strong> ${m}:${s}<br/>
        <strong>Date:</strong> ${new Date().toLocaleDateString()}<br/>
        <strong>File:</strong> ${data.filename || 'video saved'}<br/><br/>
        Click <strong>Download</strong> to save the video file.
      `;
      setVideoStatus('✅ Recording saved! Click Download.', 'success');
      // ✅ UPDATE OVERALL SCORE — video recorded = 100
      updateOverallScore('video', 100);
    });
}

function downloadRecording() {
  const name = document.getElementById('video-name').value.trim() || 'candidate';
  window.location.href = '/api/camera/download?name=' + encodeURIComponent(name);
}

function stopCamera() {
  fetch('/api/camera/stop', { method: 'POST' });
  document.getElementById('btn-start-cam').disabled = false;
  document.getElementById('btn-start-rec').disabled = true;
  const img = document.getElementById('camera-stream');
  if (img) img.style.display = 'none';
  document.getElementById('video-overlay').style.display = 'flex';
  setVideoStatus('Camera stopped.', '');
}

function saveNotes() {
  const notes = document.getElementById('video-notes').value.trim();
  if (!notes) { alert('Please add notes first.'); return; }
  const blob = new Blob([notes], { type: 'text/plain' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  const name = document.getElementById('video-name').value.trim() || 'candidate';
  a.href     = url;
  a.download = `notes_${name}_${Date.now()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

function setVideoStatus(msg, type = '') {
  const el = document.getElementById('video-status');
  el.className = 'status-bar ' + type;
  el.innerHTML = type === 'processing'
    ? `<div class="rec-dot" style="flex-shrink:0;margin-right:4px;"></div> ${msg}`
    : msg;
}