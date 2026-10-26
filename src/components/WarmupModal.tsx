import React, { useState, useEffect } from 'react';
import { Sparkles, Heart, Activity, CheckCircle2, X, Play, RotateCcw } from 'lucide-react';

interface WarmupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WarmupModal: React.FC<WarmupModalProps> = ({ isOpen, onClose }) => {
  const [secondsLeft, setSecondsLeft] = useState(120); // 2 minutes
  const [isActive, setIsActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'Inhale (4s)' | 'Hold (4s)' | 'Exhale (4s)' | 'Rest (4s)'>('Inhale (4s)');

  useEffect(() => {
    if (!isOpen) return;
    let timer: any;
    if (isActive && secondsLeft > 0) {
      timer = setInterval(() => {
        setSecondsLeft(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, isActive, secondsLeft]);

  // Box breathing phase cycle
  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      setBreathPhase(prev => {
        if (prev === 'Inhale (4s)') return 'Hold (4s)';
        if (prev === 'Hold (4s)') return 'Exhale (4s)';
        if (prev === 'Exhale (4s)') return 'Rest (4s)';
        return 'Inhale (4s)';
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [isActive]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-md rounded-3xl glass-panel bg-slate-900 border border-amber-500/40 p-6 sm:p-8 space-y-6 shadow-2xl relative text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/30">
            Neuro-Calm Protocol
          </span>
          <h3 className="text-xl font-bold text-white mt-2">
            2-Minute Pre-Interview Warm-Up
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Reduces sympathetic nervous cortisol and lowers speech filler words by up to 35%.
          </p>
        </div>

        {/* Pulsing Breathing Circle */}
        <div className="relative flex items-center justify-center py-4">
          <div className={`w-36 h-36 rounded-full flex items-center justify-center border-4 border-amber-400/40 bg-amber-500/10 transition-all duration-1000 ${
            breathPhase.includes('Inhale') ? 'scale-110 bg-amber-500/25 border-amber-400' :
            breathPhase.includes('Exhale') ? 'scale-90 bg-amber-500/5' : 'scale-100'
          }`}>
            <div className="text-center">
              <span className="text-3xl font-extrabold text-amber-400 font-mono">
                {Math.floor(secondsLeft / 60)}:{(secondsLeft % 60).toString().padStart(2, '0')}
              </span>
              <p className="text-xs font-bold text-slate-200 mt-1">{breathPhase}</p>
            </div>
          </div>
        </div>

        {/* 3 Quick Micro-Checks */}
        <div className="text-left space-y-2 p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
          <p className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Roll shoulders back & relax jaw muscles</span>
          </p>
          <p className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Hum gently for 5 seconds to warm vocal cords</span>
          </p>
          <p className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Remember: Pauses sound thoughtful, not weak</span>
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3 pt-2">
          {!isActive ? (
            <button
              onClick={() => setIsActive(true)}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center gap-1.5"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start 2-Minute Warmup</span>
            </button>
          ) : (
            <button
              onClick={() => setIsActive(false)}
              className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700"
            >
              Pause
            </button>
          )}

          <button
            onClick={() => {
              setSecondsLeft(120);
              setIsActive(false);
            }}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
            title="Reset timer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
