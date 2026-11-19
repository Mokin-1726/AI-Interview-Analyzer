"""
AI Interview Performance Analyzer
===================================
HOW TO RUN:
  1. pip install -r requirements.txt
  2. python app.py
  3. Open browser: http://localhost:5000
"""

from flask import Flask, request, jsonify, send_from_directory, Response, redirect, session
from textblob import TextBlob
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import sqlite3
import datetime
import os
import re
import webbrowser
import threading
import time

# ── OpenCV for camera ─────────────────────────────
try:
    import cv2
    CV2_AVAILABLE = True
except ImportError:
    CV2_AVAILABLE = False

# ── Optional libraries ────────────────────────────
try:
    import speech_recognition as sr
    from pydub import AudioSegment
    SPEECH_AVAILABLE = True
except ImportError:
    SPEECH_AVAILABLE = False

try:
    from docx import Document
    import PyPDF2
    from PIL import Image
    import pytesseract
    pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
    RESUME_AVAILABLE = True
except ImportError:
    RESUME_AVAILABLE = False

# ══════════════════════════════════════════════════
#                FLASK SETUP
# ══════════════════════════════════════════════════
app = Flask(__name__)
app.secret_key = "interviewai-secret-2026"

os.makedirs("database", exist_ok=True)
os.makedirs("uploads",  exist_ok=True)
os.makedirs("temp",     exist_ok=True)
os.makedirs("videos",   exist_ok=True)

camera        = None
video_writer  = None
is_recording  = False
last_filename = ""

# ══════════════════════════════════════════════════
#                DATABASE
# ══════════════════════════════════════════════════
def get_db():
    conn = sqlite3.connect("database/interviews.db")
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT,
            firstname TEXT,
            lastname TEXT,
            role TEXT DEFAULT 'candidate'
        );
        CREATE TABLE IF NOT EXISTS audio_results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT, transcript TEXT,
            confidence REAL, communication REAL,
            technical REAL, overall REAL
        );
        CREATE TABLE IF NOT EXISTS aptitude_results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT, name TEXT, score INTEGER,
            total INTEGER, pct REAL, time_sec INTEGER
        );
        CREATE TABLE IF NOT EXISTS coding_results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT, name TEXT, question TEXT,
            code TEXT, score INTEGER
        );
    """)
    conn.commit()
    conn.close()

init_db()

# ══════════════════════════════════════════════════
#                SCORING ENGINE
# ══════════════════════════════════════════════════
def score_confidence(text):
    if not text.strip(): return 0.0
    polarity = TextBlob(text).sentiment.polarity
    words    = text.split()
    richness = len(set(words)) / (len(words) + 1)
    return round((0.6 * ((polarity + 1) / 2) + 0.4 * richness) * 100, 2)

def score_communication(text):
    if not text.strip(): return 0.0
    sentences = [s for s in text.split(".") if s.strip()]
    lengths   = [len(s.split()) for s in sentences]
    avg       = np.mean(lengths) if lengths else 0
    variety   = len(set(text.lower().split())) / (len(text.split()) + 1) * 100
    return round(min(avg * 3 * 0.6 + variety * 0.4, 100), 2)

def score_technical(answer, expected):
    if not answer.strip() or not expected.strip(): return 0.0
    try:
        vect  = TfidfVectorizer()
        tfidf = vect.fit_transform([answer, expected])
        sim   = cosine_similarity(tfidf[0], tfidf[1])[0][0]
    except Exception:
        sim = 0.0
    kw_a = set(re.findall(r'\b[a-zA-Z]{3,}\b', answer.lower()))
    kw_e = set(re.findall(r'\b[a-zA-Z]{3,}\b', expected.lower()))
    match = len(kw_a & kw_e) / (len(kw_e) + 1)
    return round((0.6 * sim + 0.4 * match) * 100, 2)

def performance_grade(score):
    if score >= 85: return "Excellent 🏆"
    if score >= 70: return "Good 👍"
    if score >= 50: return "Average ⚠️"
    return "Needs Improvement ❌"

def generate_feedback(conf, comm, tech):
    return [
        {"label":"😊 Confidence", "score":conf,
         "type": "good" if conf>=70 else "warn" if conf>=50 else "bad",
         "text": "Strong, positive tone detected." if conf>=70
                 else "Answer lacked confidence. Use more assertive language."},
        {"label":"🗣️ Communication", "score":comm,
         "type": "good" if comm>=70 else "warn" if comm>=50 else "bad",
         "text": "Clear, structured and fluent responses." if comm>=70
                 else "Improve sentence structure and vocabulary variety."},
        {"label":"💡 Technical", "score":tech,
         "type": "good" if tech>=70 else "warn" if tech>=50 else "bad",
         "text": "Good technical depth and keyword alignment." if tech>=70
                 else "Increase technical depth. Use more domain-specific terms."},
    ]

# ══════════════════════════════════════════════════
#                AUTH ROUTES
# ══════════════════════════════════════════════════
@app.route("/login")
def login_page():
    if session.get("logged_in"):
        return redirect("/")
    return send_from_directory(".", "login.html")

@app.route("/api/auth/login", methods=["POST"])
def auth_login():
    data     = request.get_json()
    username = data.get("username","").strip()
    password = data.get("password","").strip()
    conn = get_db()
    user = conn.execute(
        "SELECT * FROM users WHERE username=? AND password=?", (username, password)
    ).fetchone()
    conn.close()
    if user:
        session["logged_in"] = True
        session["username"]  = username
        return jsonify({"success": True, "username": username})
    return jsonify({"success": False, "error": "Invalid username or password."})

@app.route("/api/auth/register", methods=["POST"])
def auth_register():
    data      = request.get_json()
    username  = data.get("username","").strip()
    password  = data.get("password","").strip()
    firstname = data.get("firstname","").strip()
    lastname  = data.get("lastname","").strip()
    role      = data.get("role","candidate")
    if not username or not password:
        return jsonify({"success": False, "error": "Username and password required."})
    conn = get_db()
    existing = conn.execute("SELECT id FROM users WHERE username=?", (username,)).fetchone()
    if existing:
        conn.close()
        return jsonify({"success": False, "error": "Username already taken."})
    conn.execute(
        "INSERT INTO users(username,password,firstname,lastname,role) VALUES(?,?,?,?,?)",
        (username, password, firstname, lastname, role)
    )
    conn.commit(); conn.close()
    session["logged_in"] = True
    session["username"]  = username
    return jsonify({"success": True})

@app.route("/api/auth/guest", methods=["POST"])
def auth_guest():
    session["logged_in"] = True
    session["username"]  = "guest"
    return jsonify({"success": True, "username": "guest"})

@app.route("/api/auth/logout", methods=["POST"])
def auth_logout():
    session.clear()
    return jsonify({"success": True})

# ══════════════════════════════════════════════════
#                FILE ROUTES
# ══════════════════════════════════════════════════
@app.route("/")
def home():
    if not session.get("logged_in"):
        return redirect("/login")
    return send_from_directory(".", "index.html")

@app.route("/css/<path:filename>")
def serve_css(filename):
    return send_from_directory("css", filename)

@app.route("/js/<path:filename>")
def serve_js(filename):
    return send_from_directory("js", filename)

# ══════════════════════════════════════════════════
#                CAMERA ROUTES
# ══════════════════════════════════════════════════
@app.route("/api/camera/start", methods=["POST"])
def camera_start():
    global camera
    if not CV2_AVAILABLE:
        return jsonify({"error": "opencv-python not installed."}), 500
    try:
        if camera is None or not camera.isOpened():
            camera = cv2.VideoCapture(0)
        if not camera.isOpened():
            return jsonify({"error": "No camera found."}), 500
        return jsonify({"status": "ok"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def generate_frames():
    global camera
    while True:
        if camera is None or not camera.isOpened():
            break
        success, frame = camera.read()
        if not success:
            break
        if is_recording and video_writer is not None:
            video_writer.write(frame)
        ret, buffer = cv2.imencode('.jpg', frame)
        if not ret:
            continue
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' +
               buffer.tobytes() + b'\r\n')
        time.sleep(0.033)

@app.route("/api/camera/stream")
def camera_stream():
    return Response(generate_frames(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route("/api/camera/record/start", methods=["POST"])
def record_start():
    global video_writer, is_recording, last_filename
    if not CV2_AVAILABLE:
        return jsonify({"error": "opencv not available"}), 500
    if camera is None or not camera.isOpened():
        return jsonify({"error": "Camera not started"}), 400
    try:
        data = request.get_json() or {}
        name = data.get("name", "candidate")
        ts   = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
        last_filename = f"videos/{name}_{ts}.avi"
        fourcc = cv2.VideoWriter_fourcc(*'XVID')
        video_writer = cv2.VideoWriter(last_filename, fourcc, 20.0, (640, 480))
        is_recording = True
        return jsonify({"status": "ok", "filename": last_filename})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/camera/record/stop", methods=["POST"])
def record_stop():
    global video_writer, is_recording
    is_recording = False
    if video_writer:
        video_writer.release()
        video_writer = None
    return jsonify({"status": "ok", "filename": last_filename})

@app.route("/api/camera/download")
def camera_download():
    if not last_filename or not os.path.exists(last_filename):
        return jsonify({"error": "No recording found"}), 404
    return send_from_directory(os.path.dirname(last_filename),
                               os.path.basename(last_filename), as_attachment=True)

@app.route("/api/camera/stop", methods=["POST"])
def camera_stop():
    global camera, is_recording, video_writer
    is_recording = False
    if video_writer:
        video_writer.release()
        video_writer = None
    if camera:
        camera.release()
        camera = None
    return jsonify({"status": "ok"})

# ══════════════════════════════════════════════════
#                ANALYSIS API
# ══════════════════════════════════════════════════
@app.route("/api/analyze", methods=["POST"])
def analyze():
    data       = request.get_json()
    transcript = data.get("transcript", "").strip()
    expected   = data.get("expected",   "").strip()
    if not transcript: return jsonify({"error": "Transcript required."}), 400
    if not expected:   return jsonify({"error": "Expected answer required."}), 400
    conf    = score_confidence(transcript)
    comm    = score_communication(transcript)
    tech    = score_technical(transcript, expected)
    overall = round((conf + comm + tech) / 3, 2)
    try:
        conn = get_db()
        conn.execute(
            "INSERT INTO audio_results(date,transcript,confidence,communication,technical,overall) VALUES(?,?,?,?,?,?)",
            (str(datetime.date.today()), transcript, conf, comm, tech, overall)
        )
        conn.commit(); conn.close()
    except Exception as e:
        print(f"DB error: {e}")
    return jsonify({"conf":conf, "comm":comm, "tech":tech,
                    "overall":overall, "grade":performance_grade(overall),
                    "feedback":generate_feedback(conf, comm, tech)})

@app.route("/api/transcribe", methods=["POST"])
def transcribe():
    if not SPEECH_AVAILABLE:
        return jsonify({"transcript": ""})
    if "audio" not in request.files:
        return jsonify({"error": "No audio file."}), 400
    file     = request.files["audio"]
    filename = f"uploads/audio_{datetime.datetime.now().strftime('%H%M%S')}_{file.filename}"
    file.save(filename)
    try:
        recognizer = sr.Recognizer()
        wav_path   = "temp/converted.wav"
        if not filename.endswith(".wav"):
            AudioSegment.from_file(filename).export(wav_path, format="wav")
        else:
            wav_path = filename
        with sr.AudioFile(wav_path) as source:
            recognizer.adjust_for_ambient_noise(source, duration=0.5)
            data = recognizer.record(source)
        return jsonify({"transcript": recognizer.recognize_google(data)})
    except Exception as e:
        return jsonify({"transcript": "", "message": str(e)})

@app.route("/api/save-aptitude", methods=["POST"])
def save_aptitude():
    data = request.get_json()
    try:
        conn = get_db()
        conn.execute(
            "INSERT INTO aptitude_results(date,name,score,total,pct,time_sec) VALUES(?,?,?,?,?,?)",
            (str(datetime.date.today()), data.get("name",""),
             data.get("score",0), data.get("total",5),
             data.get("pct",0), data.get("time_sec",0))
        )
        conn.commit(); conn.close()
        return jsonify({"status": "saved"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/save-coding", methods=["POST"])
def save_coding():
    data = request.get_json()
    try:
        conn = get_db()
        conn.execute(
            "INSERT INTO coding_results(date,name,question,code,score) VALUES(?,?,?,?,?)",
            (str(datetime.date.today()), data.get("name",""),
             data.get("question",""), data.get("code",""), data.get("score",0))
        )
        conn.commit(); conn.close()
        return jsonify({"status": "saved"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ══════════════════════════════════════════════════
#                START SERVER
# ══════════════════════════════════════════════════
def open_browser():
    time.sleep(1.5)
    webbrowser.open("http://localhost:5000")

if __name__ == "__main__":
    print("=" * 50)
    print("  AI Interview Performance Analyzer")
    print("=" * 50)
    print("  Open: http://localhost:5000")
    print("  Login page will show first!")
    print("  Press CTRL+C to stop")
    print("=" * 50)
    threading.Thread(target=open_browser, daemon=True).start()
    app.run(debug=False, port=5000)