import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { X, Eye, EyeOff, Lock, Mail, User, Shield, Sparkles, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenOnboarding: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onOpenOnboarding }) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [role, setRole] = useState<UserRole>('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mentorBio, setMentorBio] = useState('');
  const [mentorExp, setMentorExp] = useState(5);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (mode === 'forgot') {
      if (!email) {
        setError('Please enter your registered email address.');
        return;
      }
      setSuccessMsg('Password reset link sent to ' + email + ' (Demo simulation)');
      return;
    }

    if (mode === 'register') {
      if (!name.trim()) {
        setError('Please provide your full name.');
        return;
      }
      if (!email.trim() || !password) {
        setError('Email and password are required.');
        return;
      }
      const res = await register(name, email, role, password);
      if (res && !res.success && res.error) {
        setError(res.error);
        return;
      }
      onClose();
      if (role === 'student') {
        onOpenOnboarding();
      }
      return;
    }

    if (mode === 'login') {
      if (!email.trim() || !password) {
        setError('Please enter your email and password.');
        return;
      }
      const res = await login(email, role, password);
      if (res && !res.success && res.error) {
        setError(res.error);
        return;
      }
      onClose();
    }
  };

  const handleQuickDemoFill = (selectedRole: UserRole) => {
    setRole(selectedRole);
    if (selectedRole === 'student') {
      setEmail('aarav.sharma@example.com');
      setPassword('password123');
      setName('Aarav Sharma');
    } else if (selectedRole === 'mentor') {
      setEmail('rajesh.verma@ssbmentor.in');
      setPassword('password123');
      setName('Col. Rajesh Verma');
    } else if (selectedRole === 'admin') {
      setEmail('admin@preppilot.ai');
      setPassword('adminPass123');
      setName('Devraj Kapoor');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md rounded-2xl glass-panel bg-slate-900 border border-slate-700/80 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-brand-500/20 text-brand-400 mx-auto flex items-center justify-center mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white">
            {mode === 'login' && 'Welcome Back to Prep Pilot'}
            {mode === 'register' && 'Create Your Prep Pilot Account'}
            {mode === 'forgot' && 'Reset Your Password'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {mode === 'login' && 'Enter your credentials to continue interview training'}
            {mode === 'register' && 'Choose your role and start preparing today'}
            {mode === 'forgot' && 'We’ll send a secure password reset link to your email'}
          </p>
        </div>

        {/* Quick Demo Autofill Bar for Hackathon Judges */}
        <div className="mb-5 p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
          <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400 mb-1.5 flex items-center gap-1">
            <span>⚡ Fast Demo Login (1-Click)</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickDemoFill('student')}
              className={`py-1 px-1.5 text-[11px] font-semibold rounded-lg border transition-all ${
                role === 'student'
                  ? 'bg-brand-500/20 border-brand-500 text-brand-300'
                  : 'bg-slate-900/60 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              🎓 Student
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoFill('mentor')}
              className={`py-1 px-1.5 text-[11px] font-semibold rounded-lg border transition-all ${
                role === 'mentor'
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                  : 'bg-slate-900/60 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              🎖️ Mentor
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoFill('admin')}
              className={`py-1 px-1.5 text-[11px] font-semibold rounded-lg border transition-all ${
                role === 'admin'
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                  : 'bg-slate-900/60 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              ⚡ Admin
            </button>
          </div>
        </div>

        {/* Role Picker for Register */}
        {mode === 'register' && (
          <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              I want to join as:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                  role === 'student'
                    ? 'bg-brand-600 text-white border-brand-500 shadow-md shadow-brand-500/20'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                }`}
              >
                <span>🎓 I'm a Student</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('mentor')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                  role === 'mentor'
                    ? 'bg-amber-600 text-white border-amber-500 shadow-md shadow-amber-500/20'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                }`}
              >
                <span>🎖️ I'm a Mentor</span>
              </button>
            </div>
            {role === 'mentor' && (
              <p className="text-[10px] text-amber-400/90 mt-1.5 italic">
                * Note: Mentor accounts require admin vetting and approval before public listing.
              </p>
            )}
          </div>
        )}

        {/* Feedback / Error alerts */}
        {error && (
          <div className="mb-4 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                required
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">
                  Password
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-[11px] text-brand-400 hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-9 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {mode === 'register' && role === 'mentor' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Expertise & Bio Overview
              </label>
              <textarea
                value={mentorBio}
                onChange={(e) => setMentorBio(e.target.value)}
                rows={2}
                placeholder="Briefly describe your military, architectural, or engineering experience..."
                className="w-full p-2.5 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-brand-500/25 transition-all mt-2"
          >
            {mode === 'login' && 'Sign In'}
            {mode === 'register' && 'Create Account'}
            {mode === 'forgot' && 'Send Reset Link'}
          </button>
        </form>

        {/* Bottom Mode Switcher */}
        <div className="mt-5 text-center text-xs text-slate-400">
          {mode === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button
                onClick={() => { setMode('register'); setError(''); }}
                className="text-brand-400 font-bold hover:underline"
              >
                Sign up free
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                onClick={() => { setMode('login'); setError(''); }}
                className="text-brand-400 font-bold hover:underline"
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
