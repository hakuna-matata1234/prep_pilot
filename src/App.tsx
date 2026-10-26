import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { StreamView } from './components/StreamView';
import { QuestionBank } from './components/QuestionBank';
import { AIMockInterview } from './components/AIMockInterview';
import { InterviewReportView } from './components/InterviewReportView';
import { MentorBrowseAndBook } from './components/MentorBrowseAndBook';
import { LiveMentorMeeting } from './components/LiveMentorMeeting';
import { AdminPanel } from './components/AdminPanel';
import { AuthModal } from './components/AuthModal';
import { OnboardingModal } from './components/OnboardingModal';
import { ResumeUploadModal } from './components/ResumeUploadModal';
import { WarmupModal } from './components/WarmupModal';
import { SupabaseConfigModal } from './components/SupabaseConfigModal';
import { StreamId, InterviewReport, QuestionItem } from './types';

export const App: React.FC = () => {
  const { user } = useAuth();

  // Navigation view state
  const [currentView, setCurrentView] = useState<string>('landing');
  const [selectedStreamId, setSelectedStreamId] = useState<StreamId>('cse');
  const [selectedRole, setSelectedRole] = useState<string | undefined>(undefined);
  const [targetQuestion, setTargetQuestion] = useState<QuestionItem | undefined>(undefined);
  const [activeReport, setActiveReport] = useState<InterviewReport | null>(null);
  const [activeMeetingRoomId, setActiveMeetingRoomId] = useState<string>('room_demo_99');

  // Modals state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const [warmupModalOpen, setWarmupModalOpen] = useState(false);
  const [supabaseModalOpen, setSupabaseModalOpen] = useState(false);

  // Router dispatcher
  const handleNavigate = (view: string, param?: any) => {
    if (view === 'stream' && param) {
      setSelectedStreamId(param as StreamId);
      setCurrentView(`stream_${param}`);
    } else {
      setCurrentView(view);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartInterview = (streamId: StreamId = 'cse', role?: string) => {
    setSelectedStreamId(streamId);
    setSelectedRole(role);
    setTargetQuestion(undefined);
    setCurrentView('interview');
  };

  const handlePracticeQuestionByVoice = (q: QuestionItem) => {
    setSelectedStreamId(q.streamId);
    setTargetQuestion(q);
    setCurrentView('interview');
  };

  const handleInterviewFinish = (report: InterviewReport) => {
    setActiveReport(report);
    setCurrentView('report');
  };

  const handleJoinMeeting = (roomId: string) => {
    setActiveMeetingRoomId(roomId);
    setCurrentView('meeting');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-[#070B14] dark:text-slate-100 transition-colors">
      {/* Header Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenWarmup={() => setWarmupModalOpen(true)}
        onOpenSupabaseConfig={() => setSupabaseModalOpen(true)}
      />

      {/* Main View Container */}
      <main className="flex-1">
        {currentView === 'landing' && (
          <LandingPage
            onStartInterview={handleStartInterview}
            onNavigate={handleNavigate}
            onOpenResumeModal={() => setResumeModalOpen(true)}
          />
        )}

        {currentView === 'dashboard' && (
          <Dashboard
            onStartInterview={handleStartInterview}
            onNavigate={handleNavigate}
            onJoinMeetingRoom={handleJoinMeeting}
            onOpenResumeModal={() => setResumeModalOpen(true)}
          />
        )}

        {currentView.startsWith('stream_') && (
          <StreamView
            streamId={selectedStreamId}
            onStartInterview={handleStartInterview}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'questions' && (
          <QuestionBank
            onPracticeByVoice={handlePracticeQuestionByVoice}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'interview' && (
          <AIMockInterview
            initialStreamId={selectedStreamId}
            initialRole={selectedRole}
            initialQuestion={targetQuestion}
            onFinish={handleInterviewFinish}
            onCancel={() => handleNavigate('dashboard')}
          />
        )}

        {currentView === 'report' && activeReport && (
          <InterviewReportView
            report={activeReport}
            onBackToDashboard={() => handleNavigate('dashboard')}
            onRetake={() => handleStartInterview(activeReport.streamId, activeReport.roleExam)}
          />
        )}

        {currentView === 'mentors' && (
          <MentorBrowseAndBook
            onJoinMeetingRoom={handleJoinMeeting}
          />
        )}

        {currentView === 'meeting' && (
          <LiveMentorMeeting
            roomId={activeMeetingRoomId}
            onLeave={() => handleNavigate('dashboard')}
          />
        )}

        {currentView === 'admin' && (
          <AdminPanel />
        )}
      </main>

      {/* Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onOpenOnboarding={() => setOnboardingOpen(true)}
      />

      <OnboardingModal
        isOpen={onboardingOpen}
        onClose={() => setOnboardingOpen(false)}
      />

      <ResumeUploadModal
        isOpen={resumeModalOpen}
        onClose={() => setResumeModalOpen(false)}
        onProceedWithCustomBio={(extracted) => {
          handleStartInterview('cse');
        }}
      />

      <WarmupModal
        isOpen={warmupModalOpen}
        onClose={() => setWarmupModalOpen(false)}
      />

      <SupabaseConfigModal
        isOpen={supabaseModalOpen}
        onClose={() => setSupabaseModalOpen(false)}
      />
    </div>
  );
};
