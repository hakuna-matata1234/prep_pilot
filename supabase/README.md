# Prep Pilot - Supabase Backend & Database Guide

This guide covers everything you need to connect and operate Supabase for the **Prep Pilot** AI Interview Platform.

---

## 🏗️ Architecture Overview

Prep Pilot uses Supabase for:
1. **Authentication**: Email/password authentication linked to user profiles and roles (`student`, `mentor`, `admin`).
2. **PostgreSQL Database**:
   - `profiles`: User stats, XP, level, speaking minutes, streaks, badges.
   - `interview_sessions`: High-level session metrics, scores, speech analytics, actionable feedback.
   - `interview_turns`: Turn-by-turn question inquiries, candidate transcripts, audio URLs, and rubric sub-scores.
   - `integrity_events`: Proctoring logs (gaze deviation, tab switches, multi-face alerts).
   - `questions`: Multi-stream question bank (CSE, Architecture, UPSC/NDA).
   - `user_bookmarks`: User bookmarked questions.
   - `mentor_profiles`: Vetted mentor details, ratings, availability slots.
   - `bookings`: 1:1 Live video interview reservations.
   - `appeals`: Admin governance for proctoring disputes.
3. **Storage Buckets**:
   - `resumes`: PDF/DOCX resumes and DAF forms uploaded by candidates.
   - `interview-audio`: Audio `.webm` recordings of candidate spoken answers.
   - `snapshots`: Integrity webcam snapshots captured during proctored drills.
4. **Automated Triggers**:
   - `on_auth_user_created`: Automatically creates a candidate profile when a new user signs up.
   - `on_interview_session_added`: Auto-increments completed sessions, adds speaking minutes, and awards +150 XP.

---

## 🚀 Quick Manual Setup Instructions (What you need to do)

Follow these 4 simple steps in your browser:

### Step 1: Create a Free Supabase Project
1. Go to [https://supabase.com](https://supabase.com) and sign in.
2. Click **New Project**, choose an organization, name it (e.g., `prep-pilot`), set a secure database password, and select your preferred region.

### Step 2: Run the SQL Schema & Seed Scripts
1. In your Supabase Project Dashboard, click **SQL Editor** on the left menu (or visit `https://supabase.com/dashboard/project/_/sql`).
2. Open the file [`supabase/schema.sql`](file:///d:/prep-pilot/supabase/schema.sql) in this project.
3. Copy its entire content, paste it into the Supabase SQL Editor, and click **Run**.
4. (Optional but recommended) Next, open [`supabase/seed.sql`](file:///d:/prep-pilot/supabase/seed.sql), paste it into the SQL Editor, and click **Run** to pre-populate vetted mentors and initial questions.

### Step 3: Enable Storage Buckets
If not already created by `schema.sql`:
1. In the Supabase Dashboard, click **Storage** on the left menu.
2. Ensure the following 3 buckets exist (set **Public bucket** to `ON`):
   - `resumes`
   - `interview-audio`
   - `snapshots`

### Step 4: Configure Your Environment Variables
1. In your Supabase Dashboard, go to **Project Settings** (gear icon) -> **API**.
2. Copy:
   - **Project URL**
   - **Project API Keys** -> `anon` `public`
   - **Project API Keys** -> `service_role` (keep secret!)
3. Open your local [`.env`](file:///d:/prep-pilot/.env) file and add them:

```env
# Frontend Client (Vite)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Backend Server (Node/Express)
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

> **Tip**: You can also click the **"Connect DB"** pill directly inside the Prep Pilot navigation bar in your browser to paste your credentials and test connectivity on the fly!

---

## 🛡️ Hackathon Offline / Demo Mode Resilience
If Supabase credentials are not provided or your internet disconnects during a presentation, Prep Pilot **automatically falls back to its built-in memory simulator**. It will never crash or lock you out during judging!
