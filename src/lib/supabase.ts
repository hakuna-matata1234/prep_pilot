import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { InterviewReport, QuestionItem, MentorProfile, BookingItem, UserProfile } from '../types';

// Read configuration from environment or localStorage override
const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
const envAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const storedUrl = typeof window !== 'undefined' ? localStorage.getItem('prep_pilot_supabase_url') || '' : '';
const storedAnonKey = typeof window !== 'undefined' ? localStorage.getItem('prep_pilot_supabase_anon_key') || '' : '';

export const SUPABASE_URL = (storedUrl || envUrl).trim();
export const SUPABASE_ANON_KEY = (storedAnonKey || envAnonKey).trim();

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    SUPABASE_URL && 
    SUPABASE_ANON_KEY && 
    !SUPABASE_URL.includes('your-supabase-url') &&
    !SUPABASE_ANON_KEY.includes('your-supabase-anon-key')
  );
};

// Create the Supabase client
export const supabase: SupabaseClient = createClient(
  SUPABASE_URL || 'https://placeholder-project.supabase.co',
  SUPABASE_ANON_KEY || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);

// Helper to update Supabase credentials on the fly from the UI
export const setRuntimeSupabaseConfig = (url: string, key: string) => {
  if (url) localStorage.setItem('prep_pilot_supabase_url', url.trim());
  if (key) localStorage.setItem('prep_pilot_supabase_anon_key', key.trim());
  window.location.reload();
};

export const clearRuntimeSupabaseConfig = () => {
  localStorage.removeItem('prep_pilot_supabase_url');
  localStorage.removeItem('prep_pilot_supabase_anon_key');
  window.location.reload();
};

// ============================================================================
// PROFILE & USER DATA
// ============================================================================
export const fetchProfileFromSupabase = async (userId: string): Promise<UserProfile | null> => {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role || 'student',
      avatar: data.avatar,
      targetStream: data.target_stream,
      targetExamRole: data.target_exam_role,
      experienceLevel: data.experience_level,
      preferredLanguage: data.preferred_language,
      dailyPracticeGoal: data.daily_practice_goal,
      dailyStreak: data.daily_streak || 1,
      xp: data.xp || 100,
      level: data.level || 1,
      completedSessions: data.completed_sessions || 0,
      totalSpeakingMinutes: data.total_speaking_minutes || 0,
      badges: data.badges || [],
      isOnboarded: data.is_onboarded ?? true
    };
  } catch (err) {
    console.warn('Error fetching Supabase profile:', err);
    return null;
  }
};

export const updateProfileInSupabase = async (userId: string, updates: Partial<UserProfile>): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;
  try {
    const payload: Record<string, any> = { updated_at: new Date().toISOString() };
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.avatar !== undefined) payload.avatar = updates.avatar;
    if (updates.targetStream !== undefined) payload.target_stream = updates.targetStream;
    if (updates.targetExamRole !== undefined) payload.target_exam_role = updates.targetExamRole;
    if (updates.experienceLevel !== undefined) payload.experience_level = updates.experienceLevel;
    if (updates.dailyStreak !== undefined) payload.daily_streak = updates.dailyStreak;
    if (updates.xp !== undefined) payload.xp = updates.xp;
    if (updates.level !== undefined) payload.level = updates.level;
    if (updates.completedSessions !== undefined) payload.completed_sessions = updates.completedSessions;
    if (updates.totalSpeakingMinutes !== undefined) payload.total_speaking_minutes = updates.totalSpeakingMinutes;
    if (updates.badges !== undefined) payload.badges = updates.badges;
    if (updates.isOnboarded !== undefined) payload.is_onboarded = updates.isOnboarded;

    const { error } = await supabase
      .from('profiles')
      .update(payload)
      .eq('id', userId);

    return !error;
  } catch (err) {
    console.warn('Error updating profile in Supabase:', err);
    return false;
  }
};

// ============================================================================
// INTERVIEWS & EVALUATIONS
// ============================================================================
export const saveInterviewSessionToSupabase = async (
  report: InterviewReport,
  userId?: string
): Promise<{ success: boolean; error?: string }> => {
  if (!isSupabaseConfigured()) {
    return { success: true }; // Graceful local fallback for offline demo
  }

  try {
    // 1. Insert session record
    const { error: sessionError } = await supabase
      .from('interview_sessions')
      .insert({
        id: report.sessionId,
        user_id: userId || null,
        stream_id: report.streamId,
        role_exam: report.roleExam,
        date: report.date,
        duration_seconds: report.durationSeconds,
        persona: report.persona,
        is_proctored: report.isProctored,
        warnings_count: report.warningsCount,
        is_terminated: report.isTerminated,
        termination_reason: report.terminationReason,
        overall_score: report.overallScore,
        sub_scores: report.subScores,
        speech_analytics: report.speechAnalytics,
        actionable_plan: report.actionablePlan,
        suggested_questions: report.suggestedQuestions
      });

    if (sessionError) {
      console.warn('Supabase session insert error:', sessionError);
    }

    // 2. Insert turns
    if (report.turns && report.turns.length > 0) {
      const turnsData = report.turns.map((turn) => ({
        session_id: report.sessionId,
        turn_index: turn.turnIndex,
        question: turn.question,
        user_transcript: turn.userTranscript,
        overall_score: turn.overallScore,
        content_accuracy: turn.contentAccuracy,
        communication_clarity: turn.communicationClarity,
        confidence: turn.confidence,
        structure: turn.structure,
        relevance: turn.relevance,
        positive_points: turn.positivePoints,
        improvements: turn.improvements,
        model_answer: turn.modelAnswer,
        wpm: turn.wpm,
        filler_words_count: turn.fillerWordsCount,
        filler_words_detected: turn.fillerWordsDetected
      }));

      await supabase.from('interview_turns').insert(turnsData);
    }

    // 3. Insert integrity events if any
    if (report.integrityEvents && report.integrityEvents.length > 0) {
      const eventsData = report.integrityEvents.map((evt) => ({
        id: evt.id,
        session_id: report.sessionId,
        user_id: userId || null,
        timestamp: evt.timestamp,
        type: evt.type,
        description: evt.description,
        snapshot_url: evt.snapshotUrl,
        warning_issued: evt.warningIssued,
        warning_number: evt.warningNumber,
        status: evt.status
      }));

      await supabase.from('integrity_events').insert(eventsData);
    }

    return { success: true };
  } catch (err: any) {
    console.error('Failed to save interview to Supabase:', err);
    return { success: false, error: err.message };
  }
};

export const fetchUserInterviewsFromSupabase = async (userId: string): Promise<InterviewReport[]> => {
  if (!isSupabaseConfigured()) return [];
  try {
    const { data, error } = await supabase
      .from('interview_sessions')
      .select(`
        *,
        interview_turns (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map((item: any) => ({
      sessionId: item.id,
      streamId: item.stream_id,
      roleExam: item.role_exam,
      date: item.date,
      durationSeconds: item.duration_seconds,
      persona: item.persona,
      isProctored: item.is_proctored,
      warningsCount: item.warnings_count,
      isTerminated: item.is_terminated,
      terminationReason: item.termination_reason,
      overallScore: Number(item.overall_score),
      subScores: item.sub_scores,
      speechAnalytics: item.speech_analytics,
      actionablePlan: item.actionable_plan || [],
      suggestedQuestions: item.suggested_questions || [],
      integrityEvents: [],
      turns: (item.interview_turns || []).map((t: any) => ({
        turnIndex: t.turn_index,
        question: t.question,
        userTranscript: t.user_transcript,
        overallScore: Number(t.overall_score),
        contentAccuracy: Number(t.content_accuracy),
        communicationClarity: Number(t.communication_clarity),
        confidence: Number(t.confidence),
        structure: Number(t.structure),
        relevance: Number(t.relevance),
        positivePoints: t.positive_points || [],
        improvements: t.improvements || [],
        modelAnswer: t.model_answer,
        wpm: t.wpm,
        fillerWordsCount: t.filler_words_count,
        fillerWordsDetected: t.filler_words_detected || []
      }))
    }));
  } catch (err) {
    console.warn('Error fetching interviews from Supabase:', err);
    return [];
  }
};

// ============================================================================
// QUESTIONS & BOOKMARKS
// ============================================================================
export const fetchQuestionsFromSupabase = async (streamId?: string): Promise<QuestionItem[]> => {
  if (!isSupabaseConfigured()) return [];
  try {
    let query = supabase.from('questions').select('*');
    if (streamId && streamId !== 'all') {
      query = query.eq('stream_id', streamId);
    }
    const { data, error } = await query;
    if (error || !data) return [];

    return data.map((q: any) => ({
      id: q.id,
      streamId: q.stream_id,
      category: q.category,
      roleLevel: q.role_level,
      difficulty: q.difficulty,
      frequency: q.frequency,
      question: q.question,
      idealOutline: q.ideal_outline || [],
      keyPoints: q.key_points || [],
      commonMistakes: q.common_mistakes || [],
      sampleAnswer: q.sample_answer,
      codeSnippet: q.code_snippet
    }));
  } catch (err) {
    console.warn('Error loading questions from Supabase:', err);
    return [];
  }
};

export const toggleQuestionBookmarkInSupabase = async (
  userId: string,
  questionId: string,
  isBookmarked: boolean
): Promise<boolean> => {
  if (!isSupabaseConfigured()) return true;
  try {
    if (isBookmarked) {
      await supabase.from('user_bookmarks').delete().match({ user_id: userId, question_id: questionId });
    } else {
      await supabase.from('user_bookmarks').insert({ user_id: userId, question_id: questionId });
    }
    return true;
  } catch (err) {
    console.warn('Error toggling bookmark in Supabase:', err);
    return false;
  }
};

export const fetchUserBookmarkedQuestionIds = async (userId: string): Promise<string[]> => {
  if (!isSupabaseConfigured()) return [];
  try {
    const { data } = await supabase
      .from('user_bookmarks')
      .select('question_id')
      .eq('user_id', userId);
    return data ? data.map(d => d.question_id) : [];
  } catch (e) {
    return [];
  }
};

// ============================================================================
// MENTORS & BOOKINGS
// ============================================================================
export const fetchMentorsFromSupabase = async (): Promise<MentorProfile[]> => {
  if (!isSupabaseConfigured()) return [];
  try {
    const { data, error } = await supabase
      .from('mentor_profiles')
      .select('*')
      .eq('is_approved', true);

    if (error || !data) return [];

    return data.map((m: any) => ({
      id: m.id,
      name: m.name,
      avatar: m.avatar,
      title: m.title,
      streamId: m.stream_id,
      experienceYears: m.experience_years,
      organization: m.organization,
      languages: m.languages || [],
      rating: Number(m.rating),
      reviewsCount: m.reviews_count,
      bio: m.bio,
      pricePerSession: m.price_per_session,
      isApproved: m.is_approved,
      availableDays: m.available_days || [],
      slots: m.slots || []
    }));
  } catch (err) {
    console.warn('Error fetching mentors from Supabase:', err);
    return [];
  }
};

export const saveBookingToSupabase = async (booking: BookingItem): Promise<boolean> => {
  if (!isSupabaseConfigured()) return true;
  try {
    const { error } = await supabase.from('bookings').insert({
      id: booking.id,
      mentor_id: booking.mentorId,
      mentor_name: booking.mentorName,
      mentor_title: booking.mentorTitle,
      mentor_avatar: booking.mentorAvatar,
      student_id: booking.studentId && booking.studentId.startsWith('usr_') ? null : booking.studentId,
      student_name: booking.studentName,
      stream_id: booking.streamId,
      date: booking.date,
      time_slot: booking.timeSlot,
      status: booking.status,
      meeting_room_id: booking.meetingRoomId,
      is_proctored: booking.isProctored,
      notes: booking.notes
    });
    return !error;
  } catch (err) {
    console.warn('Error saving booking to Supabase:', err);
    return false;
  }
};

export const fetchBookingsFromSupabase = async (): Promise<BookingItem[]> => {
  if (!isSupabaseConfigured()) return [];
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map((b: any) => ({
      id: b.id,
      mentorId: b.mentor_id,
      mentorName: b.mentor_name,
      mentorTitle: b.mentor_title,
      mentorAvatar: b.mentor_avatar,
      studentId: b.student_id,
      studentName: b.student_name,
      streamId: b.stream_id,
      date: b.date,
      timeSlot: b.time_slot,
      status: b.status,
      meetingRoomId: b.meeting_room_id,
      isProctored: b.is_proctored,
      notes: b.notes
    }));
  } catch (err) {
    console.warn('Error fetching bookings from Supabase:', err);
    return [];
  }
};

// ============================================================================
// STORAGE HELPERS (Resumes, Voice Audio, Proctor Snapshots)
// ============================================================================
export const uploadResumeFile = async (file: File, userId: string = 'demo_user'): Promise<string | null> => {
  if (!isSupabaseConfigured()) return null;
  try {
    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}/${Date.now()}_resume.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      console.warn('Supabase resume upload error:', uploadError);
      return null;
    }

    const { data } = supabase.storage.from('resumes').getPublicUrl(filePath);
    return data.publicUrl;
  } catch (err) {
    console.warn('Resume upload exception:', err);
    return null;
  }
};

export const uploadInterviewAudio = async (
  audioBlob: Blob,
  sessionId: string,
  turnIndex: number
): Promise<string | null> => {
  if (!isSupabaseConfigured()) return null;
  try {
    const filePath = `${sessionId}/turn_${turnIndex}.webm`;
    const { error } = await supabase.storage
      .from('interview-audio')
      .upload(filePath, audioBlob, { contentType: 'audio/webm', upsert: true });

    if (error) return null;
    const { data } = supabase.storage.from('interview-audio').getPublicUrl(filePath);
    return data.publicUrl;
  } catch (err) {
    return null;
  }
};
