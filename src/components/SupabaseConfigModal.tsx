import React, { useState, useEffect } from 'react';
import { 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Copy, 
  Check, 
  X, 
  Save, 
  RefreshCw,
  Terminal,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { 
  isSupabaseConfigured, 
  SUPABASE_URL, 
  SUPABASE_ANON_KEY, 
  setRuntimeSupabaseConfig, 
  clearRuntimeSupabaseConfig,
  supabase
} from '../lib/supabase';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({ isOpen, onClose }) => {
  const isConfigured = isSupabaseConfigured();
  const [url, setUrl] = useState(SUPABASE_URL);
  const [anonKey, setAnonKey] = useState(SUPABASE_ANON_KEY);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [testMessage, setTestMessage] = useState('');
  const [copiedScript, setCopiedScript] = useState(false);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTestStatus('testing');
    setTestMessage('Testing connectivity to Supabase project...');
    try {
      const response = await fetch('/api/health');
      const healthData = await response.json();
      
      // Ping public questions or profiles
      const { data, error } = await supabase.from('mentor_profiles').select('count', { count: 'exact', head: true });
      
      if (error && error.code !== 'PGRST116') {
        // Table might not exist yet
        setTestStatus('failed');
        setTestMessage(`Connected to URL, but tables not yet initialized. Please run supabase/schema.sql in Supabase SQL Editor. (${error.message})`);
      } else {
        setTestStatus('success');
        setTestMessage('Successfully connected to Supabase PostgreSQL database & Auth service!');
      }
    } catch (err: any) {
      setTestStatus('failed');
      setTestMessage(`Connection error: ${err.message || 'Check project URL and anon key'}`);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setRuntimeSupabaseConfig(url, anonKey);
  };

  const handleClear = () => {
    clearRuntimeSupabaseConfig();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div 
        className="w-full max-w-2xl rounded-3xl glass-panel bg-slate-900 border border-emerald-500/30 p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-extrabold text-white">
                Supabase Backend & Database
              </h3>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                isConfigured
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
              }`}>
                {isConfigured ? 'CONNECTED' : 'OFFLINE / DEMO SIMULATOR'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Connect your Supabase project to persist interview sessions, audio recordings, candidate profiles, and live 1:1 mentor bookings.
            </p>
          </div>
        </div>

        {/* Status Alert Banner */}
        <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs ${
          isConfigured 
            ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' 
            : 'bg-amber-950/40 border-amber-500/30 text-amber-300'
        }`}>
          <div className="flex items-center gap-2">
            {isConfigured ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" /> : <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />}
            <span>
              {isConfigured 
                ? 'Supabase client is configured and ready for live database queries.' 
                : 'App is running in intelligent offline demo simulation mode. To connect your live cloud database, enter credentials below.'}
            </span>
          </div>
          {isConfigured && (
            <button
              onClick={handleTestConnection}
              disabled={testStatus === 'testing'}
              className="px-3 py-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-white font-bold text-[11px] shrink-0 border border-emerald-500/40"
            >
              {testStatus === 'testing' ? 'Testing...' : 'Test Connection'}
            </button>
          )}
        </div>

        {testStatus !== 'idle' && (
          <div className={`p-3 rounded-xl text-xs font-mono border ${
            testStatus === 'success' ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300' :
            testStatus === 'failed' ? 'bg-rose-950/60 border-rose-500/40 text-rose-300' :
            'bg-slate-800 border-slate-700 text-slate-300'
          }`}>
            {testMessage}
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Project URL (VITE_SUPABASE_URL)
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://xyzprojectid.supabase.co"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Public Anon Key (VITE_SUPABASE_ANON_KEY)
            </label>
            <input
              type="password"
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            {isConfigured && (
              <button
                type="button"
                onClick={handleClear}
                className="text-xs text-rose-400 hover:text-rose-300 hover:underline"
              >
                Clear Saved Credentials
              </button>
            )}
            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Close
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-500/25 flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Credentials & Reload</span>
              </button>
            </div>
          </div>
        </form>

        {/* Database Migration Instructions Box */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>SQL Schema File Ready: `supabase/schema.sql`</span>
            </span>
            <a
              href="https://supabase.com/dashboard/project/_/sql"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>Open Supabase SQL Editor</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            We have already pre-generated the complete production SQL schema in <code className="text-white bg-slate-800 px-1.5 py-0.5 rounded">supabase/schema.sql</code> and seed data in <code className="text-white bg-slate-800 px-1.5 py-0.5 rounded">supabase/seed.sql</code>. Copy & paste it into Supabase SQL Editor to initialize all tables, RLS security policies, and triggers in one click.
          </p>
        </div>
      </div>
    </div>
  );
};
