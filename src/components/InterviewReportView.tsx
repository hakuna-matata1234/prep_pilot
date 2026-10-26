import React from 'react';
import { InterviewReport } from '../types';
import { 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  Share2, 
  ArrowLeft, 
  ShieldCheck, 
  Sparkles, 
  BookOpen, 
  Clock, 
  Mic, 
  BarChart2, 
  TrendingUp,
  FileText
} from 'lucide-react';
import jsPDF from 'jspdf';
import confetti from 'canvas-confetti';

interface InterviewReportViewProps {
  report: InterviewReport;
  onBackToDashboard: () => void;
  onRetake: () => void;
}

export const InterviewReportView: React.FC<InterviewReportViewProps> = ({
  report,
  onBackToDashboard,
  onRetake
}) => {
  // Trigger celebration confetti on mount if passed cleanly
  React.useEffect(() => {
    if (!report.isTerminated && report.overallScore >= 7.0) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}
    }
  }, [report]);

  // Export to PDF function using jsPDF
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Prep Pilot - Performance Evaluation Report', 15, 20);

    doc.setFontSize(12);
    doc.text(`Role / Specialization: ${report.roleExam}`, 15, 30);
    doc.text(`Date: ${report.date} | Duration: ${Math.round(report.durationSeconds / 60)} minutes`, 15, 38);
    doc.text(`Overall Score: ${report.overallScore} / 10`, 15, 46);
    doc.text(`Integrity Attention Score: ${report.subScores.attentionGazeScore}% (${report.warningsCount} Warnings)`, 15, 54);

    doc.setFontSize(14);
    doc.text('Speech & Rubric Metrics:', 15, 66);
    doc.setFontSize(11);
    doc.text(`- Content Accuracy: ${report.subScores.contentAccuracy} / 10`, 20, 74);
    doc.text(`- Communication Clarity: ${report.subScores.communicationClarity} / 10`, 20, 82);
    doc.text(`- Confidence & Demeanor: ${report.subScores.confidence} / 10`, 20, 90);
    doc.text(`- Structured Reasoning: ${report.subScores.structure} / 10`, 20, 98);
    doc.text(`- Speaking Rate (WPM): ${report.speechAnalytics.averageWpm} WPM`, 20, 106);
    doc.text(`- Filler Words Detected: ${report.speechAnalytics.fillerWordsTotal} total`, 20, 114);

    doc.setFontSize(14);
    doc.text('Actionable 7-Day Improvement Plan:', 15, 126);
    doc.setFontSize(10);
    report.actionablePlan.forEach((plan, i) => {
      doc.text(`${i + 1}. ${plan}`, 20, 134 + i * 8);
    });

    doc.save(`PrepPilot_Report_${report.sessionId}.pdf`);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Prep Pilot Interview Report',
        text: `I just completed an AI Mock Interview for ${report.roleExam} on Prep Pilot with an overall score of ${report.overallScore}/10!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Report link copied to clipboard!');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Navigation & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBackToDashboard}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleShare}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-all"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>

          <button
            onClick={exportPDF}
            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-lg shadow-brand-500/20 flex items-center gap-1.5 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF Report</span>
          </button>

          <button
            onClick={onRetake}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 transition-all"
          >
            Retake Interview
          </button>
        </div>
      </div>

      {/* Hero Scorecard Banner */}
      <div className={`rounded-3xl p-6 sm:p-8 border relative overflow-hidden shadow-2xl ${
        report.isTerminated
          ? 'bg-rose-950/40 border-rose-500/40'
          : 'bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border-brand-500/30'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                report.isTerminated 
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' 
                  : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
              }`}>
                {report.isTerminated ? 'Terminated: Integrity Breach' : 'Session Completed'}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {report.date} • {report.persona} Interviewer Persona
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
              {report.roleExam} Performance Evaluation
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-xl">
              Comprehensive speech cadence, factual accuracy, and body language analysis compiled from your live voice session.
            </p>
          </div>

          {/* Large Overall Score Badge */}
          <div className="flex items-center gap-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800 shrink-0">
            <div className="text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Overall Index
              </span>
              <div className="text-4xl sm:text-5xl font-black text-amber-400 font-mono mt-0.5">
                {report.overallScore}
                <span className="text-xl text-slate-500 font-normal">/10</span>
              </div>
            </div>

            <div className="w-[1px] h-12 bg-slate-800" />

            <div className="text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Gaze / Attention
              </span>
              <div className="text-3xl font-extrabold text-emerald-400 font-mono mt-1">
                {report.subScores.attentionGazeScore}%
              </div>
            </div>
          </div>
        </div>

        {/* Warning notification banner if any */}
        {report.warningsCount > 0 && (
          <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Integrity note: {report.warningsCount} proctoring warning(s) were flagged during the session (gaze deflection or tab switches).
            </span>
          </div>
        )}
      </div>

      {/* Sub-Scores & Speech Analytics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Radar / Sub-Scores Card */}
        <div className="rounded-2xl glass-panel p-6 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-brand-400" />
            <span>Core Competency Rubric Scores</span>
          </h3>

          <div className="space-y-3 pt-2">
            {[
              { label: 'Domain Content Accuracy', val: report.subScores.contentAccuracy, color: 'bg-emerald-500' },
              { label: 'Communication & Verbal Clarity', val: report.subScores.communicationClarity, color: 'bg-indigo-500' },
              { label: 'Poise & Confidence Under Pressure', val: report.subScores.confidence, color: 'bg-blue-500' },
              { label: 'Structured Thought & Reasoning', val: report.subScores.structure, color: 'bg-amber-500' },
              { label: 'Answer Relevance & Conciseness', val: report.subScores.relevance, color: 'bg-purple-500' },
            ].map((metric, i) => (
              <div key={i}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">{metric.label}</span>
                  <span className="font-bold text-white">{metric.val} / 10</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${metric.color}`}
                    style={{ width: `${metric.val * 10}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Speech Analytics Card */}
        <div className="rounded-2xl glass-panel p-6 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Mic className="w-4 h-4 text-amber-400" />
            <span>Speech Cadence & Filler-Word Analytics</span>
          </h3>

          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-center">
              <span className="text-[10px] font-bold uppercase text-slate-400">Words / Min</span>
              <div className="text-2xl font-bold text-white font-mono mt-1">
                {report.speechAnalytics.averageWpm}
              </div>
              <span className="text-[9px] text-emerald-400 font-semibold">Optimal (120-150)</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-center">
              <span className="text-[10px] font-bold uppercase text-slate-400">Filler Words</span>
              <div className="text-2xl font-bold text-amber-400 font-mono mt-1">
                {report.speechAnalytics.fillerWordsTotal}
              </div>
              <span className="text-[9px] text-slate-400">Total detected</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-center">
              <span className="text-[10px] font-bold uppercase text-slate-400">Speaking Time</span>
              <div className="text-2xl font-bold text-indigo-400 font-mono mt-1">
                {Math.round(report.speechAnalytics.totalSpeakingSeconds / 60)}m
              </div>
              <span className="text-[9px] text-slate-400">Active voice</span>
            </div>
          </div>

          {/* Filler Word Breakdown */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Detected Hesitation Tokens:
            </span>
            <div className="flex flex-wrap gap-2">
              {Object.entries(report.speechAnalytics.fillerWordsBreakdown).map(([word, count]) => (
                <span
                  key={word}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 font-mono text-xs flex items-center gap-1.5"
                >
                  <span>"{word}"</span>
                  <span className="text-amber-400 font-bold">×{count}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Per-Question Detailed Feedback Cards */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Question-by-Question Diagnostic & Model Answers
        </h3>

        <div className="space-y-4">
          {report.turns.map((turn) => (
            <div
              key={turn.turnIndex}
              className="rounded-2xl glass-panel p-6 border border-slate-200 dark:border-slate-800 space-y-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-400 uppercase tracking-wider">
                    Question {turn.turnIndex}
                  </span>
                  <h4 className="text-base font-bold text-white mt-1.5">
                    {turn.question}
                  </h4>
                </div>

                <div className="px-3 py-1 rounded-xl bg-slate-800 border border-slate-700 text-right shrink-0">
                  <span className="text-[10px] text-slate-400 block">Score</span>
                  <span className="text-base font-bold text-emerald-400 font-mono">
                    {turn.overallScore}/10
                  </span>
                </div>
              </div>

              {/* User transcript */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Your Answer Transcript:
                </span>
                <p className="italic font-sans text-slate-300 leading-relaxed">
                  "{turn.userTranscript}"
                </p>
              </div>

              {/* Strengths & Improvements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 space-y-2">
                  <h5 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> What Went Well
                  </h5>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {turn.positivePoints.map((pt, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-400">•</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/20 space-y-2">
                  <h5 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" /> Areas for Polishing
                  </h5>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {turn.improvements.map((imp, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-amber-400">•</span>
                        <span>{imp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Model Answer */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block mb-1">
                  Model Spoken Response (Benchmark):
                </span>
                <p className="text-slate-300 leading-relaxed">
                  {turn.modelAnswer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actionable Improvement Plan & Next Practice */}
      <div className="rounded-3xl glass-panel p-6 sm:p-8 border border-slate-800 space-y-4 bg-slate-900/80">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <h3 className="text-base font-bold text-white">
            Actionable 7-Day Improvement Plan
          </h3>
        </div>

        <div className="space-y-2.5">
          {report.actionablePlan.map((action, i) => (
            <div key={i} className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-brand-500/20 text-brand-400 font-bold text-xs flex items-center justify-center shrink-0">
                {i + 1}
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {action}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
