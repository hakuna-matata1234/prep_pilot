import React from 'react';
import { useAuth } from '../context/AuthContext';
import { TRANSLATIONS } from '../utils/translations';
import { STREAMS_DATA } from '../data/streamsData';
import { 
  Mic, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Video, 
  BrainCircuit, 
  Award, 
  Users, 
  CheckCircle2, 
  Flame, 
  Star, 
  FileText, 
  Zap,
  Clock,
  Volume2,
  ChevronRight
} from 'lucide-react';
import { StreamId } from '../types';

interface LandingPageProps {
  onStartInterview: (streamId?: StreamId) => void;
  onNavigate: (view: string, param?: any) => void;
  onOpenResumeModal: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartInterview,
  onNavigate,
  onOpenResumeModal
}) => {
  const { language } = useAuth();
  const t = TRANSLATIONS[language];

  return (
    <div className="relative overflow-hidden">
      {/* Background Glow Orbs */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-brand-600/20 via-indigo-500/15 to-amber-500/10 blur-[130px] pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Top Announcement Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-600 dark:text-brand-400 text-xs font-semibold mb-6 animate-pulse-slow">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>India’s 1st Proctored Voice AI Interview Platform</span>
          <span className="text-slate-400 dark:text-slate-500">•</span>
          <span className="text-amber-500 font-bold">Hackathon 2026 Edition</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-[1.12]">
          Speak. Practice.{' '}
          <span className="gradient-text">
            Succeed.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
          {t.heroSubtitle}
        </p>

        {/* Dynamic Animated Mic Waveform Visual */}
        <div className="my-10 max-w-md mx-auto">
          <div className="relative p-6 rounded-3xl glass-panel bg-gradient-to-b from-slate-900/90 to-slate-950 border border-indigo-500/30 shadow-2xl shadow-indigo-500/10 flex flex-col items-center">
            {/* Pulsing Mic Halo */}
            <div className="relative flex items-center justify-center">
              <div className="absolute w-28 h-28 rounded-full bg-brand-500/20 animate-ping opacity-75" />
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-brand-500/40">
                <Mic className="w-9 h-9 text-white animate-pulse" />
              </div>
            </div>

            {/* Waveform Bars */}
            <div className="flex items-center gap-1.5 h-10 mt-6 px-4">
              {[40, 75, 25, 95, 60, 85, 30, 90, 45, 100, 70, 50, 80, 35, 65].map((height, idx) => (
                <div
                  key={idx}
                  className="w-1.5 rounded-full bg-gradient-to-t from-brand-500 to-amber-400"
                  style={{
                    height: `${height}%`,
                    animation: `wave 1.2s ease-in-out infinite`,
                    animationDelay: `${idx * 0.08}s`
                  }}
                />
              ))}
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>AI Interviewer is listening & evaluating spoken cadence</span>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
          <button
            onClick={() => onStartInterview('cse')}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-base shadow-xl shadow-brand-600/30 flex items-center justify-center gap-2 group transition-all duration-200 transform hover:-translate-y-0.5"
          >
            <span>{t.startPracticing}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => onNavigate('mentors')}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl glass-panel hover:bg-slate-800 text-slate-900 dark:text-white font-semibold text-base border border-slate-300 dark:border-slate-700/80 flex items-center justify-center gap-2 transition-all"
          >
            <Video className="w-4 h-4 text-brand-400" />
            <span>{t.bookMentor}</span>
          </button>
        </div>

        {/* Quick Helper Links */}
        <div className="mt-6 flex items-center justify-center gap-4 text-xs text-slate-500 dark:text-slate-400">
          <button 
            onClick={onOpenResumeModal} 
            className="hover:text-brand-400 flex items-center gap-1 underline underline-offset-4"
          >
            <FileText className="w-3.5 h-3.5" />
            Upload Resume / DAF for personalized AI drill
          </button>
          <span>•</span>
          <span>No credit card required</span>
        </div>
      </section>

      {/* Stream Cards Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-200 dark:border-slate-800/80">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            Tailored For India’s Toughest Competitive Selections
          </h2>
          <p className="mt-3 text-slate-600 dark:text-slate-400">
            Dedicated question banks, domain-tuned AI personas, and vetted examiners for each track.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STREAMS_DATA.map((stream) => (
            <div
              key={stream.id}
              className="relative rounded-2xl glass-panel p-6 border border-slate-200 dark:border-slate-800 hover:border-brand-500/50 transition-all duration-300 flex flex-col justify-between group hover:shadow-xl hover:shadow-brand-500/5"
            >
              <div>
                {/* Banner Gradient Strip */}
                <div className={`h-2 w-16 rounded-full bg-gradient-to-r ${stream.bannerGradient} mb-5`} />

                <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-brand-400 transition-colors">
                  {stream.name}
                </h3>
                <p className="text-xs font-semibold text-amber-500 mt-1">
                  {stream.tagline}
                </p>

                <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {stream.description}
                </p>

                {/* Sub-topics Badges */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {stream.categories.slice(0, 4).map((cat, i) => (
                    <span 
                      key={i}
                      className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                    >
                      {cat}
                    </span>
                  ))}
                  <span className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-brand-500/10 text-brand-400">
                    +{stream.categories.length - 4} more
                  </span>
                </div>
              </div>

              {/* Action Footer */}
              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
                <button
                  onClick={() => onNavigate('stream', stream.id)}
                  className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-brand-400 flex items-center gap-1"
                >
                  <span>Explore Stream</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => onStartInterview(stream.id)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white shadow-md shadow-brand-500/20 flex items-center gap-1.5 transition-all"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>Practice AI</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works (3 Steps) */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-500">
            {t.howItWorks}
          </span>
          <h2 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">
            {t.howItWorksDesc}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Step 1 */}
          <div className="relative rounded-2xl glass-panel p-6 border border-slate-200 dark:border-slate-800 text-center">
            <div className="w-12 h-12 rounded-xl bg-brand-500/20 border border-brand-500/40 text-brand-400 font-extrabold text-lg flex items-center justify-center mx-auto mb-4">
              01
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              {t.step1Title}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {t.step1Desc}
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative rounded-2xl glass-panel p-6 border border-slate-200 dark:border-slate-800 text-center">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 font-extrabold text-lg flex items-center justify-center mx-auto mb-4">
              02
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              {t.step2Title}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {t.step2Desc}
            </p>
          </div>

          {/* Step 3 */}
          <div className="relative rounded-2xl glass-panel p-6 border border-slate-200 dark:border-slate-800 text-center">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 font-extrabold text-lg flex items-center justify-center mx-auto mb-4">
              03
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              {t.step3Title}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {t.step3Desc}
            </p>
          </div>
        </div>
      </section>

      {/* Feature Highlights: Proctored Mode & Live Mentors */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Proctored Anti-Cheating Highlight */}
          <div className="rounded-3xl glass-panel p-8 border border-emerald-500/30 bg-gradient-to-br from-slate-900/95 via-slate-900 to-emerald-950/20 relative overflow-hidden">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold mb-4">
              <ShieldCheck className="w-4 h-4" />
              <span>3-Warning Anti-Cheating Guardian</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">
              On-Device Integrity Enforcement
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              Simulate actual proctored exam conditions. Our client-side vision engine monitors gaze direction, iris landmarks, tab-switching, and unauthorized persons without uploading raw video.
            </p>

            <ul className="space-y-2.5 text-xs text-slate-300 mb-6">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>10-Second adaptive eye-tracking calibration</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>3-Warning threshold with audible chime and cooldown</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Page visibility and copy-paste clipboard lockdown</span>
              </li>
            </ul>

            <button
              onClick={() => onStartInterview('cse')}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 transition-all"
            >
              <span>Test Proctored Interview</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Live Mentor Meetings Highlight */}
          <div className="rounded-3xl glass-panel p-8 border border-brand-500/30 bg-gradient-to-br from-slate-900/95 via-slate-900 to-indigo-950/30 relative overflow-hidden">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/20 text-brand-400 text-xs font-bold mb-4">
              <Video className="w-4 h-4" />
              <span>Google Meet-Style 1:1 Video Rooms</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">
              Real-time Practice with Human Experts
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              Connect with retired SSB Interviewing Officers, ex-UPSC board members, and FAANG staff engineers. Features live question push, collaborative whiteboard, and private scoring rubrics.
            </p>

            <ul className="space-y-2.5 text-xs text-slate-300 mb-6">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" />
                <span>Low-latency WebRTC audio/video with screen sharing</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" />
                <span>Mentor question-bank drawer to inject questions instantly</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" />
                <span>Shared canvas for system diagrams and architectural sketches</span>
              </li>
            </ul>

            <button
              onClick={() => onNavigate('mentors')}
              className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-brand-600/30 transition-all"
            >
              <span>Browse Vetted Mentors</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials Placeholder */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-200 dark:border-slate-800/80">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">
            Proven Results
          </span>
          <h2 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">
            From Preparation to Selection
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl glass-panel p-6 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-1 text-amber-400 mb-3">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400" />)}
            </div>
            <p className="text-sm text-slate-300 italic mb-4">
              "The UPSC Board persona challenged me on my DAF hometown water policy just like the actual board in Dholpur House. The speech cadence and filler-word report cut my 'basically' count to zero."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs">
                RT
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Rohan Tiwari</h4>
                <p className="text-[11px] text-slate-400">AIR 42, UPSC CSE 2025</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl glass-panel p-6 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-1 text-amber-400 mb-3">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400" />)}
            </div>
            <p className="text-sm text-slate-300 italic mb-4">
              "Practicing with Col. Rajesh Verma in the Google Meet-style room gave me the exact psychological readiness for my SSB interview at 1 AFSB Dehradun. Recommended on my 1st attempt!"
            </p>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center text-xs">
                AK
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Capt. Ananya Kapoor</h4>
                <p className="text-[11px] text-slate-400">Recommended 1 AFSB / Flying Branch</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl glass-panel p-6 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-1 text-amber-400 mb-3">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400" />)}
            </div>
            <p className="text-sm text-slate-300 italic mb-4">
              "The TinyURL system design mock drill drilled down into Base62 and Key Generation Services with real-time follow-ups. Cleared my Google L4 interview with flying colors."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-purple-500/20 text-purple-400 font-bold flex items-center justify-center text-xs">
                SM
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Siddharth Menon</h4>
                <p className="text-[11px] text-slate-400">Software Engineer II, Google</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-200 dark:border-slate-800/80 bg-white/40 dark:bg-[#05080F] text-slate-500 text-xs text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="Prep Pilot" className="w-5 h-5" />
            <span className="font-bold text-slate-900 dark:text-white">Prep Pilot</span>
            <span>— Speak. Practice. Succeed.</span>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => onNavigate('questions')} className="hover:text-white">Question Bank</button>
            <button onClick={() => onNavigate('mentors')} className="hover:text-white">Mentors</button>
            <button onClick={() => onNavigate('dashboard')} className="hover:text-white">Dashboard</button>
          </div>

          <p>© 2026 Prep Pilot. Hackathon Edition. All detections run strictly on-device.</p>
        </div>
      </footer>
    </div>
  );
};
