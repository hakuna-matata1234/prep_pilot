import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { TRANSLATIONS } from '../utils/translations';
import { STREAMS_DATA } from '../data/streamsData';
import { 
  Flame, 
  Zap, 
  Award, 
  Clock, 
  TrendingUp, 
  Play, 
  Video, 
  CheckCircle, 
  AlertCircle, 
  Calendar, 
  Sparkles, 
  BookOpen, 
  ArrowRight, 
  BarChart3, 
  Mic, 
  ShieldCheck, 
  Compass, 
  Code2, 
  Database,
  CheckCircle2
} from 'lucide-react';
import { StreamId, InterviewReport, BookingItem } from '../types';
import { 
  fetchUserInterviewsFromSupabase, 
  fetchBookingsFromSupabase, 
  isSupabaseConfigured 
} from '../lib/supabase';

interface DashboardProps {
  onStartInterview: (streamId: StreamId) => void;
  onNavigate: (view: string, param?: any) => void;
  onJoinMeetingRoom: (roomId: string) => void;
  onOpenResumeModal: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onStartInterview,
  onNavigate,
  onJoinMeetingRoom,
  onOpenResumeModal
}) => {
  const { user, language, isSupabase } = useAuth();
  const t = TRANSLATIONS[language];

  const [realSessions, setRealSessions] = useState<InterviewReport[]>([]);
  const [dbBookings, setDbBookings] = useState<any[]>([]);
  const [loadingDb, setLoadingDb] = useState(false);

  // Load real interview sessions & bookings from Supabase
  useEffect(() => {
    async function loadData() {
      if (!user?.id) return;
      setLoadingDb(true);
      try {
        const sessions = await fetchUserInterviewsFromSupabase(user.id);
        if (sessions && sessions.length > 0) {
          setRealSessions(sessions);
        }

        const bList = await fetchBookingsFromSupabase();
        if (bList && bList.length > 0) {
          setDbBookings(bList);
        }
      } catch (e) {
        console.warn('Dashboard data fetch note:', e);
      } finally {
        setLoadingDb(false);
      }
    }
    loadData();
  }, [user?.id]);

  // Analytics & performance data (dynamically calculated from real Supabase sessions if available)
  const scoreHistory = realSessions.length > 0 
    ? realSessions.slice(-6).map((s, idx) => ({ session: `Sess ${idx + 1}`, score: s.overallScore }))
    : [
        { session: 'Sess 1', score: 6.2 },
        { session: 'Sess 2', score: 6.8 },
        { session: 'Sess 3', score: 7.4 },
        { session: 'Sess 4', score: 7.1 },
        { session: 'Sess 5', score: 8.3 },
        { session: 'Sess 6', score: 8.7 },
      ];

  const skillBreakdown = [
    { skill: 'Subject Depth & Tech Accuracy', score: 8.8, color: 'bg-emerald-500' },
    { skill: 'Structured Reasoning (STAR/Outline)', score: 8.4, color: 'bg-indigo-500' },
    { skill: 'Communication Cadence & WPM', score: 7.9, color: 'bg-blue-500' },
    { skill: 'Gaze / Eye-Contact Stability', score: 8.2, color: 'bg-amber-500' },
    { skill: 'Filler-Word Reduction', score: 6.5, color: 'bg-rose-500', isWeak: true },
  ];

  const fillerTrend = [
    { date: 'Mon', count: 14 },
    { date: 'Tue', count: 11 },
    { date: 'Wed', count: 9 },
    { date: 'Thu', count: 8 },
    { date: 'Fri', count: 4 },
    { date: 'Today', count: 2 },
  ];

  const upcomingBookings = dbBookings.length > 0
    ? dbBookings.map(b => ({
        id: b.id,
        mentorName: b.mentorName || 'Col. Rajesh Verma (Retd.)',
        title: b.mentorTitle || 'Ex-Senior Interviewing Officer',
        avatar: b.mentorAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
        timeSlot: b.timeSlot || 'Ready Now (Demo Call)',
        stream: b.streamId === 'cse' ? 'CSE Tech' : b.streamId === 'architecture' ? 'Architecture' : 'UPSC & NDA (SSB)',
        roomId: b.meetingRoomId || 'room_ssb_verma_99',
        isLive: true
      }))
    : [
        {
          id: 'book_demo_live',
          mentorName: 'Col. Rajesh Verma (Retd.)',
          title: 'Ex-Senior Interviewing Officer (19 SSB Allahabad)',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
          timeSlot: 'Ready Now (Demo Call)',
          stream: 'UPSC & NDA (SSB)',
          roomId: 'room_ssb_verma_99',
          isLive: true
        }
      ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Welcome & Streak Banner */}
      <div className="rounded-3xl glass-panel p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-brand-950/40 to-slate-900 border border-brand-500/20 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-brand-500/20 text-brand-400 border border-brand-500/30">
                {user?.role === 'mentor' ? '🎖️ Expert Mentor' : user?.role === 'admin' ? '⚡ System Admin' : '🎓 Aspirant Dashboard'}
              </span>
              <span className="text-xs text-slate-400">
                Target: <strong className="text-white">{user?.targetExamRole || 'SDE & Civil Services'}</strong>
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
              Namaste, {user?.name || 'Aspirant'}! 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1.5 max-w-xl">
              You are on a <strong className="text-amber-400">{user?.dailyStreak}-day practice streak</strong>. Your next mock interview will boost your readiness index by +12%.
            </p>
          </div>

          {/* Gamification Stats */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Streak Card */}
            <div className="px-4 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center">
              <div className="flex items-center justify-center gap-1 text-amber-400 font-extrabold text-xl">
                <Flame className="w-5 h-5 fill-amber-500" />
                <span>{user?.dailyStreak}</span>
              </div>
              <p className="text-[10px] font-bold text-amber-500/90 uppercase tracking-wider mt-0.5">
                Day Streak
              </p>
            </div>

            {/* XP Card */}
            <div className="px-4 py-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-center">
              <div className="flex items-center justify-center gap-1 text-indigo-400 font-extrabold text-xl">
                <Zap className="w-5 h-5 fill-indigo-400" />
                <span>{user?.xp}</span>
              </div>
              <p className="text-[10px] font-bold text-indigo-400/90 uppercase tracking-wider mt-0.5">
                XP (Lv.{user?.level})
              </p>
            </div>

            {/* Goal Card */}
            <div className="px-4 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center">
              <div className="flex items-center justify-center gap-1 text-emerald-400 font-extrabold text-xl">
                <Clock className="w-5 h-5" />
                <span>15/{user?.dailyPracticeGoal || 20}m</span>
              </div>
              <p className="text-[10px] font-bold text-emerald-400/90 uppercase tracking-wider mt-0.5">
                Daily Goal
              </p>
            </div>
          </div>
        </div>

        {/* Level Progress Bar */}
        <div className="mt-6 pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span>Level {user?.level} Progress (Next: Level {user?.level ? user.level + 1 : 5})</span>
            <span className="font-bold text-indigo-400">72%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-indigo-500 w-[72%]" />
          </div>
        </div>
      </div>

      {/* Main Grid: Stream Quick Start & Upcoming Live Session */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Quick Stream Launch & Resume */}
        <div className="lg:col-span-2 space-y-6">
          {/* Resume Last Session Banner */}
          <div className="rounded-2xl glass-panel p-5 border border-amber-500/30 bg-gradient-to-r from-amber-950/20 via-slate-900 to-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <Play className="w-5 h-5 fill-amber-400" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  {t.resumeSession}
                </span>
                <h4 className="text-sm font-bold text-white">
                  Computer Networks & Distributed Cache Drill
                </h4>
                <p className="text-xs text-slate-400">
                  Last stopped at Question 4 of 6 • Score so far: 8.2/10
                </p>
              </div>
            </div>

            <button
              onClick={() => onStartInterview(user?.targetStream || 'cse')}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shrink-0 flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all"
            >
              <span>Continue Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Start Stream Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Launch AI Mock Interview by Stream
              </h3>
              <button
                onClick={() => onNavigate('questions')}
                className="text-xs font-semibold text-brand-400 hover:underline flex items-center gap-1"
              >
                <span>Browse Questions</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {STREAMS_DATA.map((stream) => (
                <div
                  key={stream.id}
                  className="rounded-2xl glass-panel p-4 border border-slate-200 dark:border-slate-800 hover:border-brand-500/50 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-400 flex items-center justify-center">
                        {stream.id === 'cse' && <Code2 className="w-4 h-4" />}
                        {stream.id === 'architecture' && <Compass className="w-4 h-4" />}
                        {stream.id === 'upsc_nda' && <ShieldCheck className="w-4 h-4" />}
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase">
                        AI Voice
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-brand-400 transition-colors">
                      {stream.name.split('&')[0]}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {stream.tagline}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <button
                      onClick={() => onNavigate('stream', stream.id)}
                      className="text-[11px] text-slate-400 hover:text-white font-medium"
                    >
                      View Syllabus
                    </button>
                    <button
                      onClick={() => onStartInterview(stream.id)}
                      className="px-2.5 py-1 text-xs font-bold rounded-lg bg-brand-600 hover:bg-brand-500 text-white flex items-center gap-1"
                    >
                      <Mic className="w-3 h-3" />
                      <span>Start</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Weakness Alert & Recommended Practice */}
          <div className="rounded-2xl glass-panel p-5 border border-slate-200 dark:border-slate-800 bg-slate-900/60">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">
                AI Recommendation: Focus on Weak Spots
              </h3>
            </div>
            <p className="text-xs text-slate-300 mb-3">
              Your speech analytics show a higher frequency of filler words (e.g. <em>"actually"</em>, <em>"basically"</em>) during spontaneous follow-ups. Here are 2 recommended questions to drill cadence:
            </p>

            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between gap-3">
                <div className="text-xs text-slate-200 font-medium">
                  "Explain the CAP theorem and justify your database choice for high-availability reads."
                </div>
                <button
                  onClick={() => onStartInterview('cse')}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white shrink-0"
                >
                  Practice Voice
                </button>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between gap-3">
                <div className="text-xs text-slate-200 font-medium">
                  "As an administrator, how do you handle intense public scrutiny during a communal incident?"
                </div>
                <button
                  onClick={() => onStartInterview('upsc_nda')}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shrink-0"
                >
                  Practice Voice
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Upcoming Mentor Session & Live Video Join */}
        <div className="space-y-6">
          <div className="rounded-2xl glass-panel p-5 border border-brand-500/30 bg-gradient-to-b from-brand-950/30 via-slate-900 to-slate-900">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Video className="w-4 h-4 text-brand-400" />
                <span>Upcoming Mentor Meeting</span>
              </h3>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>

            {upcomingBookings.map((b) => (
              <div key={b.id} className="space-y-4">
                <div className="flex items-center gap-3">
                  <img
                    src={b.avatar}
                    alt={b.mentorName}
                    className="w-12 h-12 rounded-xl object-cover ring-2 ring-brand-500/40"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-white">{b.mentorName}</h4>
                    <p className="text-[11px] text-slate-400">{b.title}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-brand-500/10 text-brand-400">
                      {b.stream}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/90 border border-slate-700 text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400">Schedule:</span>
                    <strong className="text-emerald-400">{b.timeSlot}</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400">Proctored Mode:</span>
                    <span className="text-emerald-400 font-semibold">Enabled (3-Warning)</span>
                  </div>
                </div>

                <button
                  onClick={() => onJoinMeetingRoom(b.roomId)}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02]"
                >
                  <Video className="w-4 h-4" />
                  <span>Join Live Meeting Room Now</span>
                </button>
              </div>
            ))}

            <div className="mt-4 pt-3 border-t border-slate-800 text-center">
              <button
                onClick={() => onNavigate('mentors')}
                className="text-xs text-brand-400 hover:underline font-semibold"
              >
                + Book Another Expert Mentor
              </button>
            </div>
          </div>

          {/* Quick Resume Upload Card */}
          <div className="rounded-2xl glass-panel p-5 border border-slate-800 text-center">
            <h4 className="text-xs font-bold text-white mb-1">
              Personalize Questions with DAF / Resume
            </h4>
            <p className="text-[11px] text-slate-400 mb-3">
              Upload your engineering resume or UPSC DAF to let the AI drill your hometown & projects.
            </p>
            <button
              onClick={onOpenResumeModal}
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
            >
              Upload Document
            </button>
          </div>
        </div>
      </div>

      {/* Analytics Section: Scores Over Time & Skills */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-brand-500" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Performance Analytics & Speech Radar
            </h3>
          </div>
          <span className="text-xs text-slate-400">Last 6 Completed Sessions</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Trend Chart */}
          <div className="rounded-2xl glass-panel p-5 border border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              Overall Score Progression
            </h4>
            <div className="h-40 flex items-end gap-3 justify-between pt-4">
              {scoreHistory.map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <span className="text-[10px] font-bold text-slate-300">{item.score}</span>
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-brand-600 to-indigo-400 transition-all duration-500"
                    style={{ height: `${(item.score / 10) * 100}%` }}
                  />
                  <span className="text-[9px] text-slate-400">{item.session}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Skill Breakdown */}
          <div className="rounded-2xl glass-panel p-5 border border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              Rubric Skill Breakdown
            </h4>
            <div className="space-y-3">
              {skillBreakdown.map((s, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-300 font-medium truncate pr-2">{s.skill}</span>
                    <span className="font-bold text-white shrink-0">{s.score}/10</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${s.color}`}
                      style={{ width: `${s.score * 10}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Filler Word Reduction Trend */}
          <div className="rounded-2xl glass-panel p-5 border border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              Filler Word Trend (Down is better)
            </h4>
            <div className="h-40 flex items-end gap-3 justify-between pt-4">
              {fillerTrend.map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <span className="text-[10px] font-bold text-amber-400">{item.count}</span>
                  <div
                    className="w-full rounded-t-lg bg-amber-500/80 transition-all duration-500"
                    style={{ height: `${Math.max(12, (item.count / 15) * 100)}%` }}
                  />
                  <span className="text-[9px] text-slate-400">{item.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
