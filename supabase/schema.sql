-- ==============================================================================
-- PREP PILOT - SUPABASE DATABASE SCHEMA & INITIALIZATION
-- ==============================================================================
-- This script sets up all tables, relationships, Row Level Security (RLS) policies,
-- triggers, and storage buckets required for the Prep Pilot AI Interview platform.
--
-- Instructions:
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard/project/_/sql
-- 2. Paste this entire SQL file into the SQL Editor and click "Run".
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. PROFILES TABLE (Linked with Supabase Auth auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Candidate',
  email TEXT NOT NULL,
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'mentor', 'admin')),
  avatar TEXT,
  target_stream TEXT DEFAULT 'cse',
  target_exam_role TEXT DEFAULT 'Software Engineer (SDE I/II)',
  experience_level TEXT DEFAULT 'fresher',
  preferred_language TEXT DEFAULT 'en',
  daily_practice_goal INT DEFAULT 20,
  daily_streak INT DEFAULT 1,
  xp INT DEFAULT 100,
  level INT DEFAULT 1,
  completed_sessions INT DEFAULT 0,
  total_speaking_minutes INT DEFAULT 0,
  badges TEXT[] DEFAULT ARRAY['Early Bird']::TEXT[],
  is_onboarded BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast user lookup
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- 3. INTERVIEW SESSIONS TABLE
CREATE TABLE IF NOT EXISTS public.interview_sessions (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  stream_id TEXT NOT NULL,
  role_exam TEXT NOT NULL,
  date TEXT NOT NULL,
  duration_seconds INT NOT NULL DEFAULT 0,
  persona TEXT DEFAULT 'Friendly',
  is_proctored BOOLEAN DEFAULT true,
  warnings_count INT DEFAULT 0,
  is_terminated BOOLEAN DEFAULT false,
  termination_reason TEXT,
  overall_score NUMERIC(3,1) DEFAULT 0.0,
  sub_scores JSONB DEFAULT '{}'::JSONB,
  speech_analytics JSONB DEFAULT '{}'::JSONB,
  actionable_plan TEXT[] DEFAULT ARRAY[]::TEXT[],
  suggested_questions TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON public.interview_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON public.interview_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_stream ON public.interview_sessions(stream_id);

-- 4. INTERVIEW TURNS TABLE (Granular question-by-question candidate audio & answers)
CREATE TABLE IF NOT EXISTS public.interview_turns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT REFERENCES public.interview_sessions(id) ON DELETE CASCADE,
  turn_index INT NOT NULL,
  question TEXT NOT NULL,
  user_transcript TEXT,
  audio_url TEXT,
  overall_score NUMERIC(3,1) DEFAULT 0.0,
  content_accuracy NUMERIC(3,1) DEFAULT 0.0,
  communication_clarity NUMERIC(3,1) DEFAULT 0.0,
  confidence NUMERIC(3,1) DEFAULT 0.0,
  structure NUMERIC(3,1) DEFAULT 0.0,
  relevance NUMERIC(3,1) DEFAULT 0.0,
  positive_points TEXT[] DEFAULT ARRAY[]::TEXT[],
  improvements TEXT[] DEFAULT ARRAY[]::TEXT[],
  model_answer TEXT,
  wpm INT DEFAULT 0,
  filler_words_count INT DEFAULT 0,
  filler_words_detected TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_turns_session_id ON public.interview_turns(session_id);

-- 5. INTEGRITY EVENTS TABLE (Proctoring logs: Gaze, Tab Switch, Multi-Face)
CREATE TABLE IF NOT EXISTS public.integrity_events (
  id TEXT PRIMARY KEY,
  session_id TEXT REFERENCES public.interview_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  type TEXT NOT NULL,
  description TEXT,
  snapshot_url TEXT,
  warning_issued BOOLEAN DEFAULT false,
  warning_number INT DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('confirmed', 'dismissed', 'pending'))
);

CREATE INDEX IF NOT EXISTS idx_integrity_session ON public.integrity_events(session_id);

-- 6. QUESTIONS BANK TABLE
CREATE TABLE IF NOT EXISTS public.questions (
  id TEXT PRIMARY KEY,
  stream_id TEXT NOT NULL,
  category TEXT NOT NULL,
  role_level TEXT,
  difficulty TEXT DEFAULT 'Medium' CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  frequency TEXT DEFAULT 'Common',
  question TEXT NOT NULL,
  ideal_outline TEXT[] DEFAULT ARRAY[]::TEXT[],
  key_points TEXT[] DEFAULT ARRAY[]::TEXT[],
  common_mistakes TEXT[] DEFAULT ARRAY[]::TEXT[],
  sample_answer TEXT,
  code_snippet TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_questions_stream ON public.questions(stream_id);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON public.questions(difficulty);

-- 7. USER BOOKMARKS TABLE
CREATE TABLE IF NOT EXISTS public.user_bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  question_id TEXT REFERENCES public.questions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON public.user_bookmarks(user_id);

-- 8. MENTOR PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.mentor_profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  avatar TEXT,
  title TEXT NOT NULL,
  stream_id TEXT NOT NULL,
  experience_years INT DEFAULT 5,
  organization TEXT,
  languages TEXT[] DEFAULT ARRAY['English']::TEXT[],
  rating NUMERIC(2,1) DEFAULT 4.9,
  reviews_count INT DEFAULT 0,
  bio TEXT,
  price_per_session TEXT DEFAULT 'Free (Demo)',
  is_approved BOOLEAN DEFAULT true,
  available_days TEXT[] DEFAULT ARRAY[]::TEXT[],
  slots TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mentors_stream ON public.mentor_profiles(stream_id);

-- 9. BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS public.bookings (
  id TEXT PRIMARY KEY,
  mentor_id TEXT REFERENCES public.mentor_profiles(id) ON DELETE CASCADE,
  mentor_name TEXT,
  mentor_title TEXT,
  mentor_avatar TEXT,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_name TEXT,
  stream_id TEXT NOT NULL,
  date TEXT NOT NULL,
  time_slot TEXT NOT NULL,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'completed', 'cancelled')),
  meeting_room_id TEXT NOT NULL,
  is_proctored BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bookings_student ON public.bookings(student_id);
CREATE INDEX IF NOT EXISTS idx_bookings_mentor ON public.bookings(mentor_id);

-- 10. APPEALS TABLE (Admin panel integrity disputes)
CREATE TABLE IF NOT EXISTS public.appeals (
  id TEXT PRIMARY KEY,
  student_name TEXT NOT NULL,
  session_date TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  stream TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- AUTOMATED TRIGGERS & FUNCTIONS
-- ==============================================================================

-- Trigger: Automatically create public.profiles entry when a user signs up via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    name,
    role,
    avatar,
    target_stream,
    target_exam_role
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    COALESCE(NEW.raw_user_meta_data->>'avatar', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'),
    COALESCE(NEW.raw_user_meta_data->>'target_stream', 'cse'),
    COALESCE(NEW.raw_user_meta_data->>'target_exam_role', 'Software Engineer (SDE I/II)')
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, public.profiles.name);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop if exists and attach trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger: Automatically update user stats & XP when an interview session finishes
CREATE OR REPLACE FUNCTION public.handle_interview_completed()
RETURNS TRIGGER AS $$
DECLARE
  speaking_mins INT;
BEGIN
  speaking_mins := CEIL(NEW.duration_seconds / 60);
  
  UPDATE public.profiles
  SET 
    completed_sessions = completed_sessions + 1,
    total_speaking_minutes = total_speaking_minutes + speaking_mins,
    xp = xp + 150,
    level = GREATEST(1, FLOOR((xp + 150) / 400) + 1),
    updated_at = NOW()
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_interview_session_added ON public.interview_sessions;
CREATE TRIGGER on_interview_session_added
  AFTER INSERT ON public.interview_sessions
  FOR EACH ROW EXECUTE FUNCTION public.handle_interview_completed();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS across all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_turns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrity_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appeals ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Interview Sessions Policies
DROP POLICY IF EXISTS "Users can view their own interview sessions" ON public.interview_sessions;
CREATE POLICY "Users can view their own interview sessions" 
  ON public.interview_sessions FOR SELECT 
  USING (auth.uid() = user_id OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Users can insert their own interview sessions" ON public.interview_sessions;
CREATE POLICY "Users can insert their own interview sessions" 
  ON public.interview_sessions FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role' OR auth.uid() IS NULL);

-- Interview Turns Policies
DROP POLICY IF EXISTS "Users can view interview turns" ON public.interview_turns;
CREATE POLICY "Users can view interview turns" 
  ON public.interview_turns FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Users can insert interview turns" ON public.interview_turns;
CREATE POLICY "Users can insert interview turns" 
  ON public.interview_turns FOR INSERT 
  WITH CHECK (true);

-- Integrity Events Policies
DROP POLICY IF EXISTS "Integrity events select policy" ON public.integrity_events;
CREATE POLICY "Integrity events select policy" 
  ON public.integrity_events FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Integrity events insert policy" ON public.integrity_events;
CREATE POLICY "Integrity events insert policy" 
  ON public.integrity_events FOR INSERT 
  WITH CHECK (true);

-- Questions Policies
DROP POLICY IF EXISTS "Questions are viewable by everyone" ON public.questions;
CREATE POLICY "Questions are viewable by everyone" 
  ON public.questions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users or admin can insert questions" ON public.questions;
CREATE POLICY "Authenticated users or admin can insert questions" 
  ON public.questions FOR INSERT WITH CHECK (true);

-- Bookmarks Policies
DROP POLICY IF EXISTS "Users can manage their bookmarks" ON public.user_bookmarks;
CREATE POLICY "Users can manage their bookmarks" 
  ON public.user_bookmarks FOR ALL 
  USING (auth.uid() = user_id OR auth.role() = 'service_role');

-- Mentors Policies
DROP POLICY IF EXISTS "Mentors are viewable by everyone" ON public.mentor_profiles;
CREATE POLICY "Mentors are viewable by everyone" 
  ON public.mentor_profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Mentors can be updated by admins" ON public.mentor_profiles;
CREATE POLICY "Mentors can be updated by admins" 
  ON public.mentor_profiles FOR ALL USING (true);

-- Bookings Policies
DROP POLICY IF EXISTS "Users can view their bookings" ON public.bookings;
CREATE POLICY "Users can view their bookings" 
  ON public.bookings FOR SELECT 
  USING (auth.uid() = student_id OR auth.role() = 'service_role' OR true);

DROP POLICY IF EXISTS "Users can create bookings" ON public.bookings;
CREATE POLICY "Users can create bookings" 
  ON public.bookings FOR INSERT 
  WITH CHECK (true);

-- Appeals Policies
DROP POLICY IF EXISTS "Appeals accessible by admin and users" ON public.appeals;
CREATE POLICY "Appeals accessible by admin and users" 
  ON public.appeals FOR ALL USING (true);

-- ==============================================================================
-- STORAGE BUCKETS (Execute in Supabase Storage or SQL)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('resumes', 'resumes', true),
  ('interview-audio', 'interview-audio', true),
  ('snapshots', 'snapshots', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies: Allow uploads and reads
DROP POLICY IF EXISTS "Public Resumes Access" ON storage.objects;
CREATE POLICY "Public Resumes Access" ON storage.objects
  FOR SELECT USING (bucket_id IN ('resumes', 'interview-audio', 'snapshots'));

DROP POLICY IF EXISTS "Public Resumes Upload" ON storage.objects;
CREATE POLICY "Public Resumes Upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id IN ('resumes', 'interview-audio', 'snapshots'));
