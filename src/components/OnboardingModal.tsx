import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { StreamId } from '../types';
import { STREAMS_DATA } from '../data/streamsData';
import { Sparkles, Check, ArrowRight, Target, Clock, Globe } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const { user, updateProfile } = useAuth();
  const [stream, setStream] = useState<StreamId>(user?.targetStream || 'cse');
  const [targetRole, setTargetRole] = useState(user?.targetExamRole || 'Software Engineer (SDE I/II)');
  const [experienceLevel, setExperienceLevel] = useState<'fresher' | '1-3yrs' | '3+yrs' | 'aspirant'>('fresher');
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [dailyGoal, setDailyGoal] = useState<number>(20);

  if (!isOpen) return null;

  const currentStreamData = STREAMS_DATA.find((s) => s.id === stream) || STREAMS_DATA[0];

  const handleFinish = () => {
    updateProfile({
      targetStream: stream,
      targetExamRole: targetRole,
      experienceLevel,
      preferredLanguage: language,
      dailyPracticeGoal: dailyGoal,
      isOnboarded: true,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl rounded-3xl glass-panel bg-slate-900 border border-brand-500/30 p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-amber-500 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-brand-500/25">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            Welcome to Prep Pilot, {user?.name || 'Aspirant'}!
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Let's personalize your AI interviewer, syllabus question banks, and daily practice goals.
          </p>
        </div>

        <div className="space-y-5">
          {/* 1. Target Stream */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              1. Choose Target Stream
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {STREAMS_DATA.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setStream(s.id);
                    setTargetRole(s.roles[0]);
                  }}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    stream === s.id
                      ? 'bg-brand-600/20 border-brand-500 text-white shadow-md shadow-brand-500/10'
                      : 'bg-slate-800/60 border-slate-700/80 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <p className="text-xs font-bold text-white">{s.name.split('&')[0]}</p>
                  <p className="text-[10px] text-amber-400/90 mt-1">{s.tagline.split(',')[0]}</p>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Target Exam or Role */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              2. Specific Target Exam or Specialization
            </label>
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-brand-500"
            >
              {currentStreamData.roles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Experience Level */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              3. Preparation Stage / Experience
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'fresher', label: 'Fresher / Student' },
                { id: '1-3yrs', label: '1 - 3 Years' },
                { id: '3+yrs', label: 'Senior / 3+ Yrs' }
              ].map((lvl) => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => setExperienceLevel(lvl.id as any)}
                  className={`py-2 px-2 text-xs font-semibold rounded-xl border transition-all text-center ${
                    experienceLevel === lvl.id
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {lvl.label}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Language & Daily Practice Goal */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-brand-400" />
                <span>Interview Language</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    language === 'en'
                      ? 'bg-brand-600 text-white border-brand-500'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('hi')}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    language === 'hi'
                      ? 'bg-brand-600 text-white border-brand-500'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  हिन्दी (Hindi)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Daily Practice Goal</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[10, 20, 30].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setDailyGoal(mins)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      dailyGoal === mins
                        ? 'bg-amber-500 text-slate-900 border-amber-400 shadow-md'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Finish Button */}
          <div className="pt-4 border-t border-slate-800">
            <button
              onClick={handleFinish}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-brand-500/25 flex items-center justify-center gap-2 transition-all"
            >
              <span>Complete Setup & Enter Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
