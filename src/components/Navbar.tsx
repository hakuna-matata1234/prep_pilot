import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { TRANSLATIONS } from '../utils/translations';
import { 
  Sparkles, 
  Flame, 
  Zap, 
  Sun, 
  Moon, 
  Globe, 
  User, 
  ShieldCheck, 
  GraduationCap, 
  Compass, 
  Code2, 
  LogOut, 
  Menu, 
  X,
  Video,
  Award,
  Database
} from 'lucide-react';
import { StreamId } from '../types';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, param?: any) => void;
  onOpenAuth: () => void;
  onOpenWarmup: () => void;
  onOpenSupabaseConfig?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenAuth,
  onOpenWarmup,
  onOpenSupabaseConfig
}) => {
  const { user, isAuthenticated, isSupabase, logout, switchDemoRole, language, setLanguage, theme, toggleTheme } = useAuth();
  const t = TRANSLATIONS[language];
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-[#070B14]/85 border-b border-slate-200 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div 
            className="flex items-center gap-3 cursor-pointer select-none group"
            onClick={() => onNavigate('landing')}
          >
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-amber-500 p-[2px] shadow-lg shadow-brand-500/25 group-hover:shadow-brand-500/40 transition-all duration-300">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center overflow-hidden">
                <img src="/logo.svg" alt="Prep Pilot" className="w-7 h-7 transform group-hover:scale-110 transition-transform duration-300" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                  Prep<span className="text-brand-500">Pilot</span>
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/30">
                  DEMO
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wide">
                {t.tagline}
              </p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            <button
              onClick={() => onNavigate('dashboard')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                currentView === 'dashboard'
                  ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              Dashboard
            </button>

            {/* Stream Links */}
            <div className="flex items-center gap-0.5 ml-1 pl-1 border-l border-slate-200 dark:border-slate-800">
              <button
                onClick={() => onNavigate('stream', 'cse')}
                className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${
                  currentView === 'stream_cse'
                    ? 'text-blue-500 bg-blue-500/10'
                    : 'text-slate-600 dark:text-slate-400 hover:text-blue-400'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                CSE Tech
              </button>
              <button
                onClick={() => onNavigate('stream', 'architecture')}
                className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${
                  currentView === 'stream_architecture'
                    ? 'text-amber-500 bg-amber-500/10'
                    : 'text-slate-600 dark:text-slate-400 hover:text-amber-400'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                Architecture
              </button>
              <button
                onClick={() => onNavigate('stream', 'upsc_nda')}
                className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${
                  currentView === 'stream_upsc_nda'
                    ? 'text-emerald-500 bg-emerald-500/10'
                    : 'text-slate-600 dark:text-slate-400 hover:text-emerald-400'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                UPSC & SSB
              </button>
            </div>

            <button
              onClick={() => onNavigate('questions')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                currentView === 'questions'
                  ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              Question Bank
            </button>

            <button
              onClick={() => onNavigate('mentors')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg flex items-center gap-1.5 transition-colors ${
                currentView === 'mentors'
                  ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Video className="w-3.5 h-3.5 text-brand-500" />
              1:1 Mentors
            </button>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2">
            {/* Supabase Status Pill */}
            <button
              onClick={onOpenSupabaseConfig}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full border transition-all ${
                isSupabase
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-700 hover:border-slate-500'
              }`}
              title={isSupabase ? 'Supabase Database Connected' : 'Click to configure Supabase Cloud Database'}
            >
              <Database className={`w-3.5 h-3.5 ${isSupabase ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span className="hidden sm:inline">{isSupabase ? 'Supabase' : 'Connect DB'}</span>
              <span className={`w-1.5 h-1.5 rounded-full ${isSupabase ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            </button>

            {/* Quick 2-Min Warmup Pill */}
            <button
              onClick={onOpenWarmup}
              title="2-Minute Confidence Warmup"
              className="hidden lg:flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition-all"
            >
              <Sparkles className="w-3 h-3 text-amber-500 animate-spin-slow" />
              <span>2-Min Warmup</span>
            </button>

            {/* Streak & XP Display for Logged-in User */}
            {user && (
              <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60">
                <div className="flex items-center gap-1 text-xs font-bold text-amber-500" title="Daily Streak">
                  <Flame className="w-3.5 h-3.5 fill-amber-500" />
                  <span>{user.dailyStreak}d</span>
                </div>
                <div className="w-[1px] h-3 bg-slate-300 dark:bg-slate-700"></div>
                <div className="flex items-center gap-1 text-xs font-bold text-indigo-400" title="Experience Points">
                  <Zap className="w-3.5 h-3.5 fill-indigo-400" />
                  <span>Lv.{user.level}</span>
                </div>
              </div>
            )}

            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs font-semibold"
              title="Switch Language / भाषा बदलें"
            >
              <Globe className="w-4 h-4" />
              <span className="uppercase">{language}</span>
            </button>

            {/* Theme Switcher */}
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Toggle Light/Dark Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* Demo Role Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="px-2.5 py-1.2 rounded-lg text-xs font-semibold bg-gradient-to-r from-brand-600/10 to-indigo-600/10 dark:from-brand-500/20 dark:to-indigo-500/20 border border-brand-500/30 text-brand-600 dark:text-brand-300 flex items-center gap-1 hover:border-brand-500/60 transition-colors"
                title="Switch Role for Judging"
              >
                <span className="capitalize">{user?.role || 'Guest'}</span>
                <span className="text-[10px] text-slate-400">▾</span>
              </button>

              {roleDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-48 rounded-xl shadow-xl glass-panel p-2 z-50 animate-in fade-in zoom-in-95"
                  onClick={() => setRoleDropdownOpen(false)}
                >
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Switch Demo Persona
                  </div>
                  <button
                    onClick={() => switchDemoRole('student')}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium hover:bg-brand-500/20 text-slate-200 flex items-center justify-between"
                  >
                    <span>🎓 Student (Aarav)</span>
                    {user?.role === 'student' && <span className="text-brand-400 font-bold">✓</span>}
                  </button>
                  <button
                    onClick={() => switchDemoRole('mentor')}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium hover:bg-brand-500/20 text-slate-200 flex items-center justify-between"
                  >
                    <span>🎖️ Mentor (Col. Verma)</span>
                    {user?.role === 'mentor' && <span className="text-brand-400 font-bold">✓</span>}
                  </button>
                  <button
                    onClick={() => {
                      switchDemoRole('admin');
                      onNavigate('admin');
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium hover:bg-brand-500/20 text-slate-200 flex items-center justify-between"
                  >
                    <span>⚡ Admin (Superuser)</span>
                    {user?.role === 'admin' && <span className="text-brand-400 font-bold">✓</span>}
                  </button>
                </div>
              )}
            </div>

            {/* Profile Avatar / Login CTA */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <img
                  src={user?.avatar}
                  alt={user?.name}
                  onClick={() => onNavigate('dashboard')}
                  className="w-8 h-8 rounded-full ring-2 ring-brand-500/50 cursor-pointer object-cover hover:ring-brand-500 transition-all"
                />
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-brand-600 hover:bg-brand-500 text-white shadow-md shadow-brand-500/25 transition-all"
              >
                Sign In
              </button>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-[#0B0F19] p-4 space-y-2 animate-in slide-in-from-top-4">
          <button
            onClick={() => { onNavigate('dashboard'); setMobileMenuOpen(false); }}
            className="w-full text-left px-3 py-2 text-sm font-medium rounded-lg text-slate-300 hover:bg-slate-800"
          >
            Dashboard
          </button>
          <button
            onClick={() => { onNavigate('stream', 'cse'); setMobileMenuOpen(false); }}
            className="w-full text-left px-3 py-2 text-sm font-medium rounded-lg text-blue-400 hover:bg-slate-800 flex items-center gap-2"
          >
            <Code2 className="w-4 h-4" /> CSE Tech Stream
          </button>
          <button
            onClick={() => { onNavigate('stream', 'architecture'); setMobileMenuOpen(false); }}
            className="w-full text-left px-3 py-2 text-sm font-medium rounded-lg text-amber-400 hover:bg-slate-800 flex items-center gap-2"
          >
            <Compass className="w-4 h-4" /> Architecture & Design
          </button>
          <button
            onClick={() => { onNavigate('stream', 'upsc_nda'); setMobileMenuOpen(false); }}
            className="w-full text-left px-3 py-2 text-sm font-medium rounded-lg text-emerald-400 hover:bg-slate-800 flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" /> UPSC & NDA (SSB)
          </button>
          <button
            onClick={() => { onNavigate('questions'); setMobileMenuOpen(false); }}
            className="w-full text-left px-3 py-2 text-sm font-medium rounded-lg text-slate-300 hover:bg-slate-800"
          >
            Question Bank
          </button>
          <button
            onClick={() => { onNavigate('mentors'); setMobileMenuOpen(false); }}
            className="w-full text-left px-3 py-2 text-sm font-medium rounded-lg text-slate-300 hover:bg-slate-800 flex items-center gap-2"
          >
            <Video className="w-4 h-4 text-brand-400" /> Book 1:1 Mentor
          </button>
        </div>
      )}
    </nav>
  );
};
