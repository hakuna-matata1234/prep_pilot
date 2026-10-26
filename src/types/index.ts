export type UserRole = 'student' | 'mentor' | 'admin';

export type StreamId = 'cse' | 'architecture' | 'upsc_nda';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  targetStream?: StreamId;
  targetExamRole?: string;
  experienceLevel?: 'fresher' | '1-3yrs' | '3+yrs' | 'aspirant';
  preferredLanguage?: 'en' | 'hi';
  dailyPracticeGoal?: number; // minutes
  dailyStreak: number;
  xp: number;
  level: number;
  completedSessions: number;
  totalSpeakingMinutes: number;
  badges: string[];
  isOnboarded?: boolean;
}

export interface StreamCategory {
  id: string;
  name: string;
  description: string;
  topicsCount: number;
}

export interface StreamDefinition {
  id: StreamId;
  name: string;
  tagline: string;
  iconName: string;
  description: string;
  categories: string[];
  roles: string[];
  levels: string[];
  bannerGradient: string;
  primaryMetric: string;
  overviewTips: string[];
}

export interface QuestionItem {
  id: string;
  streamId: StreamId;
  category: string;
  roleLevel?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  frequency: 'Very common' | 'Common' | 'Occasionally asked';
  question: string;
  idealOutline: string[];
  keyPoints: string[];
  commonMistakes: string[];
  sampleAnswer: string;
  codeSnippet?: string;
  isBookmarked?: boolean;
  isPracticed?: boolean;
}

export interface InterviewConfig {
  streamId: StreamId;
  roleExam: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  durationMinutes: 5 | 10 | 20;
  persona: 'Friendly' | 'Strict' | 'Panel of 3';
  language: 'en' | 'hi';
  isProctored: boolean;
  resumeContext?: string;
}

export interface TurnEvaluation {
  turnIndex: number;
  question: string;
  userTranscript: string;
  overallScore: number; // 0-10
  contentAccuracy: number; // 0-10
  communicationClarity: number; // 0-10
  confidence: number; // 0-10
  structure: number; // 0-10
  relevance: number; // 0-10
  positivePoints: string[];
  improvements: string[];
  modelAnswer: string;
  wpm: number;
  fillerWordsCount: number;
  fillerWordsDetected: string[];
}

export interface IntegrityEvent {
  id: string;
  sessionId: string;
  timestamp: string;
  type: 'gaze_away' | 'no_face' | 'multi_face' | 'tab_switch' | 'fullscreen_exit' | 'clipboard_attempt';
  description: string;
  snapshotUrl?: string;
  warningIssued: boolean;
  warningNumber?: number;
  status: 'confirmed' | 'dismissed' | 'pending';
}

export interface InterviewReport {
  sessionId: string;
  streamId: StreamId;
  roleExam: string;
  date: string;
  durationSeconds: number;
  persona: string;
  isProctored: boolean;
  warningsCount: number;
  isTerminated: boolean;
  terminationReason?: string;
  overallScore: number;
  subScores: {
    contentAccuracy: number;
    communicationClarity: number;
    confidence: number;
    structure: number;
    relevance: number;
    attentionGazeScore: number;
  };
  speechAnalytics: {
    averageWpm: number;
    fillerWordsTotal: number;
    fillerWordsBreakdown: Record<string, number>;
    totalSpeakingSeconds: number;
    pauseCount: number;
  };
  turns: TurnEvaluation[];
  actionablePlan: string[];
  suggestedQuestions: string[];
  integrityEvents: IntegrityEvent[];
}

export interface MentorProfile {
  id: string;
  name: string;
  avatar: string;
  title: string;
  streamId: StreamId;
  experienceYears: number;
  organization: string;
  languages: string[];
  rating: number;
  reviewsCount: number;
  bio: string;
  pricePerSession: string; // e.g. "Free (Demo)"
  isApproved: boolean;
  availableDays: string[];
  slots: string[];
}

export interface BookingItem {
  id: string;
  mentorId: string;
  mentorName: string;
  mentorTitle: string;
  mentorAvatar: string;
  studentId: string;
  studentName: string;
  streamId: StreamId;
  date: string;
  timeSlot: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  meetingRoomId: string;
  isProctored: boolean;
  notes?: string;
}
