import React, { useState } from 'react';
import { MENTORS_SEED } from '../data/mentorsData';
import { 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Users, 
  Award, 
  AlertTriangle, 
  BarChart3, 
  Search, 
  RefreshCw,
  FileCheck,
  Scale
} from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const [mentors, setMentors] = useState(MENTORS_SEED);
  const [appeals, setAppeals] = useState([
    {
      id: 'apl_1',
      studentName: 'Aarav Sharma',
      sessionDate: 'Oct 26, 2026',
      reason: 'Technical glitch: Dual monitor caused false gaze deflection warning #2',
      status: 'pending',
      stream: 'CSE Tech'
    },
    {
      id: 'apl_2',
      studentName: 'Pooja Verma',
      sessionDate: 'Oct 25, 2026',
      reason: 'Involuntary eye twitching medical condition during UPSC board mock',
      status: 'approved',
      stream: 'UPSC Civil Services'
    }
  ]);

  const [activeTab, setActiveTab] = useState<'mentors' | 'appeals' | 'platformMetrics'>('mentors');

  const handleApproveMentor = (id: string) => {
    setMentors(prev => prev.map(m => m.id === id ? { ...m, isApproved: true } : m));
  };

  const handleResolveAppeal = (id: string, outcome: 'approved' | 'rejected') => {
    setAppeals(prev => prev.map(a => a.id === id ? { ...a, status: outcome } : a));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="rounded-3xl glass-panel p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-emerald-950/30 to-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Admin Governance Console
            </span>
            <span className="text-xs text-slate-400">Integrity & Platform Superuser Access</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
            Administration & Integrity Appeals
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Vet mentor credentials, audit 3-warning proctoring termination appeals, and configure accessibility exemptions.
          </p>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('mentors')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'mentors' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          Mentor Approvals ({mentors.length})
        </button>
        <button
          onClick={() => setActiveTab('appeals')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'appeals' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          Proctoring Appeals ({appeals.filter(a => a.status === 'pending').length} Pending)
        </button>
        <button
          onClick={() => setActiveTab('platformMetrics')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'platformMetrics' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          Platform Health & Analytics
        </button>
      </div>

      {/* Tab 1: Mentor Vetting */}
      {activeTab === 'mentors' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mentors.map((m) => (
              <div key={m.id} className="rounded-2xl glass-panel p-5 border border-slate-800 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <img src={m.avatar} alt={m.name} className="w-12 h-12 rounded-xl object-cover ring-2 ring-brand-500/30" />
                  <div>
                    <h4 className="text-sm font-bold text-white">{m.name}</h4>
                    <p className="text-xs text-slate-400">{m.title}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-brand-500/10 text-brand-400">
                      {m.organization} • {m.experienceYears} yrs
                    </span>
                  </div>
                </div>

                <div className="shrink-0 text-right space-y-2">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    m.isApproved ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {m.isApproved ? 'Vetted & Active' : 'Pending Review'}
                  </span>
                  <div>
                    {!m.isApproved && (
                      <button
                        onClick={() => handleApproveMentor(m.id)}
                        className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                      >
                        Approve
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Proctoring Integrity Appeals */}
      {activeTab === 'appeals' && (
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
            <Scale className="w-4 h-4 shrink-0 text-amber-400" />
            <span>
              Fairness Policy: Candidates with documented medical conditions or technical multi-monitor anomalies can have warnings expunged.
            </span>
          </div>

          <div className="space-y-3">
            {appeals.map((apl) => (
              <div key={apl.id} className="rounded-2xl glass-panel p-5 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{apl.studentName}</span>
                    <span className="text-xs text-slate-400">({apl.stream})</span>
                    <span className={`px-2 py-0.2 rounded text-[10px] font-bold uppercase ${
                      apl.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                      apl.status === 'rejected' ? 'bg-rose-500/20 text-rose-400' :
                      'bg-amber-500/20 text-amber-400'
                    }`}>
                      {apl.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Appeal Reason: <em>"{apl.reason}"</em>
                  </p>
                  <span className="text-[10px] text-slate-500">Session Date: {apl.sessionDate}</span>
                </div>

                {apl.status === 'pending' && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleResolveAppeal(apl.id, 'approved')}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                    >
                      Grant Appeal (Expunge)
                    </button>
                    <button
                      onClick={() => handleResolveAppeal(apl.id, 'rejected')}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Platform Metrics */}
      {activeTab === 'platformMetrics' && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="rounded-2xl glass-panel p-5 border border-slate-800 text-center">
            <span className="text-[10px] font-bold uppercase text-slate-400">Total Mock Sessions</span>
            <div className="text-3xl font-extrabold text-white mt-1">1,482</div>
            <span className="text-[10px] text-emerald-400 font-semibold">+24% this week</span>
          </div>
          <div className="rounded-2xl glass-panel p-5 border border-slate-800 text-center">
            <span className="text-[10px] font-bold uppercase text-slate-400">Proctoring Accuracy</span>
            <div className="text-3xl font-extrabold text-emerald-400 mt-1">98.4%</div>
            <span className="text-[10px] text-slate-400">Based on audit appeals</span>
          </div>
          <div className="rounded-2xl glass-panel p-5 border border-slate-800 text-center">
            <span className="text-[10px] font-bold uppercase text-slate-400">Active Mentors</span>
            <div className="text-3xl font-extrabold text-brand-400 mt-1">42</div>
            <span className="text-[10px] text-slate-400">100% verified</span>
          </div>
          <div className="rounded-2xl glass-panel p-5 border border-slate-800 text-center">
            <span className="text-[10px] font-bold uppercase text-slate-400">Total Speaking Hours</span>
            <div className="text-3xl font-extrabold text-amber-400 mt-1">568h</div>
            <span className="text-[10px] text-slate-400">Voice AI runtime</span>
          </div>
        </div>
      )}
    </div>
  );
};
