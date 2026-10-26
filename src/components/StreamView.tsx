import React, { useState } from 'react';
import { STREAMS_DATA } from '../data/streamsData';
import { QUESTIONS_SEED } from '../data/questionsData';
import { StreamId } from '../types';
import { 
  Code2, 
  Compass, 
  ShieldCheck, 
  Mic, 
  Video, 
  CheckCircle2, 
  Filter, 
  Search, 
  BookOpen, 
  Lightbulb, 
  ChevronRight,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface StreamViewProps {
  streamId: StreamId;
  onStartInterview: (streamId: StreamId, role?: string) => void;
  onNavigate: (view: string, param?: any) => void;
}

export const StreamView: React.FC<StreamViewProps> = ({
  streamId,
  onStartInterview,
  onNavigate
}) => {
  const stream = STREAMS_DATA.find((s) => s.id === streamId) || STREAMS_DATA[0];
  const [selectedRole, setSelectedRole] = useState(stream.roles[0]);
  const [selectedLevel, setSelectedLevel] = useState(stream.levels[0]);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const streamQuestions = QUESTIONS_SEED.filter((q) => q.streamId === stream.id);
  const filteredQuestions = activeCategory === 'All' 
    ? streamQuestions 
    : streamQuestions.filter(q => q.category === activeCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Stream Header Banner */}
      <div className={`rounded-3xl p-8 bg-gradient-to-r ${stream.bannerGradient} text-white shadow-2xl relative overflow-hidden`}>
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md border border-white/30 uppercase tracking-wider">
              Specialized Interview Stream
            </span>
            <span className="text-xs text-white/80 font-medium">
              Data-Driven Syllabus 2026
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            {stream.name}
          </h1>
          <p className="mt-2 text-base sm:text-lg text-white/90 font-medium">
            {stream.tagline}
          </p>

          <p className="mt-4 text-sm text-white/80 leading-relaxed max-w-2xl">
            {stream.description}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              onClick={() => onStartInterview(stream.id, selectedRole)}
              className="px-6 py-3 rounded-xl bg-white text-slate-900 font-extrabold text-sm shadow-xl hover:bg-slate-100 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
              <Mic className="w-4 h-4 text-brand-600" />
              <span>Start Voice AI Mock for {selectedRole.split('(')[0]}</span>
            </button>

            <button
              onClick={() => onNavigate('mentors')}
              className="px-5 py-3 rounded-xl bg-black/25 hover:bg-black/35 backdrop-blur-md text-white font-bold text-sm border border-white/20 flex items-center gap-2 transition-all"
            >
              <Video className="w-4 h-4" />
              <span>Book Human Mentor</span>
            </button>
          </div>
        </div>
      </div>

      {/* Role and Level Filters */}
      <div className="rounded-2xl glass-panel p-6 border border-slate-200 dark:border-slate-800 space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Select Targeted Specialization / Role
          </label>
          <div className="flex flex-wrap gap-2">
            {stream.roles.map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRole(r)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedRole === r
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-500/25 border border-brand-500'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Experience / Attempt Level
          </label>
          <div className="flex flex-wrap gap-2">
            {stream.levels.map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedLevel(lvl)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  selectedLevel === lvl
                    ? 'bg-indigo-600/30 text-indigo-400 border border-indigo-500/50'
                    : 'bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 hover:text-white'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Overview & Format Tips */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl glass-panel p-6 border border-slate-200 dark:border-slate-800 md:col-span-2 space-y-4">
          <div className="flex items-center gap-2 text-brand-500">
            <Lightbulb className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Examiner & Interview Board Recommendations
            </h3>
          </div>

          <div className="space-y-3">
            {stream.overviewTips.map((tip, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {tip}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl glass-panel p-6 border border-slate-200 dark:border-slate-800 space-y-4 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Primary Scoring Focus
            </span>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
              {stream.primaryMetric}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Our AI evaluates your verbal responses using this exact weighting rubric, providing granular feedback on filler words, accuracy, and poise.
            </p>
          </div>

          <button
            onClick={() => onStartInterview(stream.id, selectedRole)}
            className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md shadow-brand-500/25 flex items-center justify-center gap-1.5 transition-all"
          >
            <Mic className="w-4 h-4" />
            <span>Launch Mock Interview</span>
          </button>
        </div>
      </div>

      {/* Stream Question Bank Filter & List */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-brand-500" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Curated {stream.name.split('&')[0]} Question Bank
            </h3>
          </div>
          <button
            onClick={() => onNavigate('questions')}
            className="text-xs font-semibold text-brand-400 hover:underline flex items-center gap-1"
          >
            <span>Open Global Question Bank</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveCategory('All')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold shrink-0 transition-all ${
              activeCategory === 'All'
                ? 'bg-brand-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            All Categories ({streamQuestions.length})
          </button>
          {stream.categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold shrink-0 transition-all ${
                activeCategory === cat
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Question Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredQuestions.map((q) => (
            <div
              key={q.id}
              className="rounded-2xl glass-panel p-5 border border-slate-200 dark:border-slate-800 hover:border-brand-500/40 transition-all space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400">
                    {q.category}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      q.difficulty === 'Easy' ? 'bg-emerald-500/20 text-emerald-400' :
                      q.difficulty === 'Medium' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-rose-500/20 text-rose-400'
                    }`}>
                      {q.difficulty}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {q.frequency}
                    </span>
                  </div>
                </div>

                <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                  {q.question}
                </h4>

                <div className="mt-3 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-1">
                    Key Answer Anchor
                  </span>
                  <p className="line-clamp-2 text-slate-400 text-[11px]">
                    {q.idealOutline[0]}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => onNavigate('questions')}
                  className="text-xs text-slate-400 hover:text-white font-medium"
                >
                  View Outline & Mistakes
                </button>
                <button
                  onClick={() => onStartInterview(stream.id, selectedRole)}
                  className="px-3 py-1 text-xs font-bold rounded-lg bg-brand-600 hover:bg-brand-500 text-white flex items-center gap-1.5 shadow-md shadow-brand-500/20"
                >
                  <Mic className="w-3 h-3" />
                  <span>Practice Voice</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
