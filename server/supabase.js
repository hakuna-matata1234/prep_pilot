import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseKey && 
  !supabaseUrl.includes('your_supabase') &&
  !supabaseKey.includes('your_supabase')
);

export const supabaseServer = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

/**
 * Fetch bookings from Supabase, or return fallback
 */
export async function getBookingsFromDb(fallbackBookings) {
  if (!supabaseServer) return fallbackBookings;
  try {
    const { data, error } = await supabaseServer
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return fallbackBookings;
    }

    return data.map(b => ({
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
    console.warn('Supabase getBookings error:', err.message);
    return fallbackBookings;
  }
}

/**
 * Insert new booking into Supabase
 */
export async function insertBookingToDb(booking) {
  if (!supabaseServer) return null;
  try {
    const { data, error } = await supabaseServer.from('bookings').insert({
      id: booking.id,
      mentor_id: booking.mentorId || 'mentor-1',
      mentor_name: booking.mentorName,
      mentor_title: booking.mentorTitle,
      mentor_avatar: booking.mentorAvatar,
      student_id: booking.studentId && booking.studentId.startsWith('usr_') ? null : booking.studentId,
      student_name: booking.studentName,
      stream_id: booking.streamId,
      date: booking.date,
      time_slot: booking.timeSlot,
      status: booking.status || 'upcoming',
      meeting_room_id: booking.meetingRoomId,
      is_proctored: booking.isProctored ?? true,
      notes: booking.notes
    }).select().single();

    if (error) {
      console.warn('Supabase booking insert error:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.warn('Supabase insertBooking exception:', err.message);
    return null;
  }
}

/**
 * Log Proctoring Integrity Event into Supabase
 */
export async function logProctorEventToDb(event) {
  if (!supabaseServer) return null;
  try {
    const { data, error } = await supabaseServer.from('integrity_events').insert({
      id: event.id,
      session_id: event.sessionId || 'sess_demo_live',
      type: event.type || 'gaze_away',
      description: event.description || '',
      snapshot_url: event.snapshotUrl || null,
      warning_issued: event.warningIssued || false,
      warning_number: event.warningNumber || 0,
      status: 'pending'
    });
    if (error) console.warn('Supabase proctor log error:', error.message);
    return data;
  } catch (e) {
    return null;
  }
}

/**
 * Save complete interview session & turns from server side
 */
export async function saveInterviewSessionToDb(sessionPayload) {
  if (!supabaseServer) return null;
  try {
    const { session, turns } = sessionPayload;
    const sessionId = session.id || session.sessionId;
    const userId = session.userId || session.user_id || null;
    const { data: insertedSession, error: sErr } = await supabaseServer
      .from('interview_sessions')
      .insert({
        id: sessionId,
        user_id: userId && String(userId).startsWith('usr_') ? null : userId,
        stream_id: session.streamId,
        role_exam: session.roleExam,
        date: session.date,
        duration_seconds: session.durationSeconds,
        persona: session.persona,
        is_proctored: session.isProctored,
        warnings_count: session.warningsCount,
        is_terminated: session.isTerminated,
        termination_reason: session.terminationReason,
        overall_score: session.overallScore,
        sub_scores: session.subScores,
        speech_analytics: session.speechAnalytics,
        actionable_plan: session.actionablePlan,
        suggested_questions: session.suggestedQuestions
      })
      .select()
      .single();

    if (sErr) throw sErr;

    if (turns && turns.length > 0) {
      const turnsData = turns.map(t => ({
        session_id: sessionId,
        turn_index: t.turnIndex,
        question: t.question,
        user_transcript: t.userTranscript,
        overall_score: t.overallScore,
        content_accuracy: t.contentAccuracy,
        communication_clarity: t.communicationClarity,
        confidence: t.confidence,
        structure: t.structure,
        relevance: t.relevance,
        positive_points: t.positivePoints,
        improvements: t.improvements,
        model_answer: t.modelAnswer,
        wpm: t.wpm,
        filler_words_count: t.fillerWordsCount,
        filler_words_detected: t.fillerWordsDetected
      }));
      await supabaseServer.from('interview_turns').insert(turnsData);
    }

    return insertedSession;
  } catch (err) {
    console.warn('Server Supabase session save error:', err.message);
    return null;
  }
}
