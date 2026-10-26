# 🎙️ Prep Pilot
> **Tagline:** *"Speak. Practice. Succeed."*  
> **Hackathon Edition:** Complete AI-Powered Interview Preparation Platform for Indian Competitive and Career Interviews.

---

## 🚀 Overview

**Prep Pilot** is an end-to-end interview preparation and simulation platform designed specifically for high-consequence Indian examinations and career tracks:
1. **Computer Science & Software Engineering (CSE)**: DSA, System Design (HLD/LLD), OS, DBMS, Networks, Frontend, Backend, AI/ML, Cloud/DevOps, and HR fit.
2. **Architecture & Spatial Design**: B.Arch admissions (NATA / JEE Paper 2A), portfolio defense, building materials, sustainable bioclimatic architecture, structures, and urban planning.
3. **UPSC Civil Services & NDA (SSB)**: DAF (Detailed Application Form) defense, Ethics (GS-IV) case dilemmas, geopolitical policy, SSB Screening (OIR/PPDT), Psychological tests (TAT/WAT/SRT), and the 15 Officer-Like Qualities (OLQ) Personal Interview.

---

## ✨ Core Features Built

### 1. 🎤 Real-Time Spoken AI Mock Interview
- **Voice In & Voice Out**: Native Web Speech API integration with live animated AI interviewer orb (Speaking, Listening, Thinking states with audio waveform).
- **Stream-Tailored Board Personas**:
  - **UPSC Board Persona**: Dignified, probing on policy nuances, challenging administrative ethics without confrontation.
  - **SSB Interviewing Officer Persona**: Crisp, assessing 15 Officer-Like Qualities (effective intelligence, initiative, social adaptability, courage).
  - **FAANG Senior Staff Engineer Persona**: Drill-downs into scalability trade-offs, concurrency edge cases, and algorithmic complexity.
- **Interactive Code & Diagram Scratchpad**: Embedded real-time whiteboard for software schema, math, or architectural concept notes.
- **Adaptive Follow-ups**: Follow-up questions generated dynamically based on candidate confidence and answer depth.
- **Typed Fallback Mode**: Automatic input fallback for noisy environments or devices without microphones.

### 2. 🛡️ Client-Side Proctored Mode (Anti-Cheating Guardian)
- **10-Second Eye & Gaze Calibration**: Adapts to user screen dimensions, webcam angle, and prescription glasses (Center, Left, Right, Up, Down).
- **On-Device Vision & Landmark Detection**:
  - **Gaze Deviation**: Flags off-screen gaze or head turns lasting $>3$ seconds.
  - **Missing Face / Camera Obstruction**: Flags when candidate leaves frame for $>4$ seconds.
  - **Multi-Face Detection**: Flags presence of unauthorized secondary persons.
  - **Tab & Window Blur Enforcement**: Detects tab switches, application minimization, and clipboard copy/paste attempts.
- **3-Warning Policy**: Prominent warning banners, audible Web Audio synthesizer chimes, a 5-second cooldown, and automatic session termination on the 3rd infraction with audit logs.
- **Privacy First**: All gaze and face tracking runs strictly client-side on-device; no raw video is stored or transmitted without consent.

### 3. 📹 Google Meet-Style 1:1 Live Mentor Meetings
- **Pre-Join Lobby**: Camera/mic check, device selection, and proctoring consent.
- **Live Video & Screen Sharing**: Low-latency video room with Picture-in-Picture (PiP) self-view and connection stability meters.
- **Collaborative Workspace**: In-meeting text chat and synchronized whiteboard/scratchpad for architecture sketches and code schemas.
- **Mentor Control Center**:
  - **Push Question**: Push any question from the question bank directly to the candidate's screen during the live call.
  - **Private Scoring Rubric**: Score candidate in real-time across Knowledge, Communication, Poise, and Problem Solving with private examiner notes.
  - **Live Proctor Alerts**: Monitor candidate integrity alerts in real-time with ability to confirm or dismiss false positives.

### 4. 📊 Granular Feedback & Speech Analytics
- **Multi-dimensional Rubric**: Overall score (0-10) plus sub-scores for Content Accuracy, Verbal Clarity, Poise/Confidence, Structured Reasoning, and Attention/Gaze Stability.
- **Speech Analytics**: Words Per Minute (WPM) gauge, hesitation token detection (*"um", "actually", "basically", "like"*), and speaking duration.
- **Question-by-Question Diagnostics**: What went well, areas for improvement, and benchmark model answers.
- **Actionable 7-Day Roadmap**: Tailored study recommendations based on diagnosed weaknesses.
- **1-Click PDF Export**: Clean, printable PDF performance certificates powered by `jsPDF`.

### 5. 📚 Comprehensive Syllabus Question Bank
- **100+ Seed Questions**: Categorized with difficulty levels (Easy/Medium/Hard) and frequency tags (*"Very common", "Common", "Occasionally asked"*).
- **Deep Content**: Ideal outline (STAR method), key architectural/constitutional anchors, common traps, and spoken sample answers.
- **AI Question Generator**: Generate custom questions on any topic in real-time.
- **Timed MCQ Concept Check**: Objective multiple-choice question challenge with instant deterministic scoring and explanations.

### 6. 🏆 Gamification & Extra Polish
- **Daily Streak & XP Progression**: Streak flames, leveling system, and earned badges (*"Gaze Master"*, *"DSA Guru"*, *"7-Day Streak"*).
- **Resume & DAF Uploader**: Paste or upload engineering resumes or UPSC DAF forms to customize AI mock questions.
- **2-Minute Confidence Warm-Up**: Interactive box-breathing exercise (Inhale 4s, Hold 4s, Exhale 4s) to lower sympathetic anxiety.
- **Bilingual Support**: Instant toggle between English and हिन्दी (Hindi).
- **Admin Governance Console**: Review and approve mentor profiles, audit proctoring termination appeals, and configure accessibility exemptions.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Framer Motion, Lucide Icons, Canvas Confetti, jsPDF.
- **Backend**: Node.js, Express, Socket.IO (WebSockets for real-time signaling, chat, and proctoring alerts).
- **AI Evaluation**: Smart stream-tailored heuristic & LLM evaluation engine (compatible with Claude API, Gemini, and Ollama).
- **Audio & Vision**: Web Speech API (`SpeechSynthesis` & `webkitSpeechRecognition`), Web Audio API chime generator, HTML5 Canvas face/gaze estimation, Page Visibility API, and Clipboard lockdown.

---

## ⚡ Quickstart & Running the App

### 1. Prerequisites
- Node.js v18+ (tested on Node v24)
- npm or pnpm

### 2. Launching Full-Stack Prep Pilot
In your terminal:
```bash
# Navigate to the project directory
cd D:\prep-pilot

# Install dependencies (already completed)
npm install

# Start the hot-reloading Vite client (port 3000) and API server (port 5000)
npm run dev
```

Open your browser at **`http://localhost:3000`**. If the API port is already in use,
choose another server port and point Vite's API proxy at it before starting:

```powershell
$env:PORT = "5001"
$env:VITE_API_TARGET = "http://localhost:5001"
npm run dev
```

---

## 🎭 2-Minute Demo Script for Hackathon Judges

### Step 1: Landing Page & Fast Persona Switch (0:00 - 0:25)
1. Open `http://localhost:5000`.
2. Notice the modern Dark Mode visual identity with glowing soundwave orb and tagline: *"Speak. Practice. Succeed."*.
3. Click the **Demo Persona** pill in the top-right navbar:
   - Select **🎓 Student (Aarav Sharma)**.
   - Or click **Sign In** and use the **1-Click Fast Demo Login buttons** (Student / Mentor / Admin).
4. Click **2-Min Warmup** in the navbar to showcase the pre-interview box-breathing and vocal exercise.

### Step 2: Live AI Voice Mock Interview (0:25 - 1:00)
1. Click **"Start Practicing Free"** or select **CSE Tech / UPSC & SSB** from the top bar.
2. In the setup modal:
   - Stream: `Computer Science & Software Engineering` (or `UPSC & NDA`).
   - Persona: `Friendly` or `Strict`.
   - Proctored Mode: `ON`.
3. Click **"Begin Live Spoken Interview"**.
4. The 10-Second Eye & Gaze Calibration appears. Click **"Start 10-Second Calibration"** (glance center, left, right, up, down).
5. The AI Interviewer Orb speaks the question aloud using voice synthesis.
6. Speak your answer or click the live microphone. Notice the speech-to-text live transcription and automatic silence detection.
7. Click **Code Scratchpad** (`</>`) to demonstrate the live code/system design whiteboard.

### Step 3: Anti-Cheating / Proctoring Demo (1:00 - 1:25)
1. On the top-right Proctor HUD, test the 3-Warning Integrity Guardian:
   - Click the judge simulation button **"👀 Look Away"** or look away from the webcam for $>3$ seconds.
   - Notice: Audible chime plays, and a prominent badge appears: *"Warning 1 of 3: Candidate looked away from screen continuously for >3s"*.
   - Click **"🚫 No Face"** to trigger Warning 2.
   - Click **"👥 Multi Face"** to trigger Warning 3.
2. Observe the automatic session termination modal:
   - *"Session Terminated: Maximum integrity warnings (3) exceeded."*
3. Click **"View Integrity Report & Audit Timeline"**.

### Step 4: Diagnostic Feedback & PDF Export (1:25 - 1:40)
1. View the **Overall Index (e.g. 8.2/10)**, Gaze Attention Score (81%), and rubric radar.
2. Inspect the **Speech Analytics**: Words Per Minute (WPM) and exact counts of verbal fillers (*"um", "actually", "like"*).
3. Expand Question-by-Question diagnostic to compare your transcript against the **Benchmark Model Answer**.
4. Click **"Download PDF Report"** to generate a clean, instant PDF certificate.

### Step 5: Google Meet-Style 1:1 Live Mentor Meeting (1:40 - 2:00)
1. Click **"1:1 Mentors"** in the top navbar.
2. Browse vetted mentors (e.g., *Col. Rajesh Verma, Ex-SSB Allahabad*, or *Vikramaditya Roy, Staff SDE @ Google*).
3. Click **"Book 1:1 Video Slot"** -> Confirm booking -> Click **"Enter Live Meeting Now"**.
4. Experience the pre-join lobby with camera/mic check, then enter the room:
   - Real-time in-meeting chat.
   - Shared collaborative whiteboard.
   - **Mentor Control Center**: Click "Push Question" to push any question from the question bank directly onto the candidate's screen in real time!
   - Live proctor alerts side-drawer.

---

## 📂 File Architecture

```
prep-pilot/
├── public/
│   └── logo.svg                 # Brand icon with audio waveform wings
├── src/
│   ├── types/
│   │   └── index.ts             # Strict TypeScript models & data interfaces
│   ├── context/
│   │   └── AuthContext.tsx      # Auth, profiles, 1-click role switcher & theme
│   ├── data/
│   │   ├── streamsData.ts       # CSE, Architecture & UPSC/NDA syllabus configs
│   │   ├── questionsData.ts     # 100+ curated questions, outlines & sample answers
│   │   └── mentorsData.ts       # Verified mentor profiles & booking slots
│   ├── components/
│   │   ├── Navbar.tsx           # Global nav, language/theme toggles, XP badges
│   │   ├── LandingPage.tsx      # Hero, stream cards, how-it-works, testimonials
│   │   ├── Dashboard.tsx        # Streaks, analytics radar, quick-start & bookings
│   │   ├── StreamView.tsx       # Dedicated stream landing pages & role filters
│   │   ├── QuestionBank.tsx     # Subjective repository, AI generator & MCQ challenge
│   │   ├── AIMockInterview.tsx  # Core Voice AI interview engine with animated orb
│   │   ├── ProctoredEngine.tsx  # MediaPipe/Canvas gaze tracking & 3-warning guardian
│   │   ├── InterviewReportView.tsx # Comprehensive feedback report & jsPDF export
│   │   ├── LiveMentorMeeting.tsx# Google Meet-style 1:1 video call with whiteboard
│   │   ├── MentorBrowseAndBook.tsx # Mentor directory, slot booking & .ics export
│   │   ├── AdminPanel.tsx       # Mentor verification, proctoring appeals & metrics
│   │   ├── AuthModal.tsx        # Sign-in/Sign-up with fast demo autofill
│   │   ├── OnboardingModal.tsx  # Target stream, role, language & daily goal setup
│   │   ├── ResumeUploadModal.tsx# DAF & resume parser for customized questions
│   │   └── WarmupModal.tsx      # 2-minute neuro-calm box-breathing exercise
│   ├── utils/
│   │   └── translations.ts      # English & Hindi bilingual dictionary
│   ├── App.tsx                  # Main router & modal controller
│   ├── main.tsx                 # App mount & providers
│   └── index.css                # Tailwind styling, custom scrollbars & glassmorphism
├── server/
│   └── index.js                 # Express + Socket.IO WebRTC signaling & AI evaluator
├── package.json
├── tailwind.config.js
├── vite.config.ts
└── README.md
```

---

## 🏆 Hackathon Submission Highlights

1. **Complete MVP Built**: Every single required feature (Landing page, Auth & Onboarding, 3 Stream Portals, Question Bank with AI generator, Spoken AI Mock Interview with live waveform orb, Client-side Proctoring 3-warning system, Google Meet-style mentor rooms, PDF report export, and Admin console) is fully operational.
2. **Offline-Resilient**: Runs locally without mandatory cloud API tokens; uses built-in smart AI speech evaluation and fallback heuristics so judges can test instantly.
3. **Privacy by Design**: Proctoring analysis runs strictly on the client device without sending video frames to any remote server.
4. **Culturally Grounded**: Tailored specifically for Indian aspirants preparing for UPSC Civil Services, SSB Armed Forces selection, B.Arch admissions, and FAANG tech interviews.
