import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { STREAMS_DATA } from '../data/streamsData';
import { QUESTIONS_SEED } from '../data/questionsData';
import { 
  InterviewConfig, 
  StreamId, 
  TurnEvaluation, 
  InterviewReport, 
  IntegrityEvent,
  QuestionItem
} from '../types';
import { 
  saveInterviewSessionToSupabase, 
  uploadInterviewAudio, 
  isSupabaseConfigured,
  fetchQuestionsFromSupabase
} from '../lib/supabase';
import { ProctoredEngine } from './ProctoredEngine';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Play, 
  Pause, 
  Square, 
  Sparkles, 
  Code2, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Send, 
  ShieldCheck, 
  ArrowRight,
  Loader2,
  ChevronRight,
  Database
} from 'lucide-react';

interface AIMockInterviewProps {
  initialStreamId?: StreamId;
  initialRole?: string;
  initialQuestion?: QuestionItem;
  onFinish: (report: InterviewReport) => void;
  onCancel: () => void;
}

export const AIMockInterview: React.FC<AIMockInterviewProps> = ({
  initialStreamId = 'cse',
  initialRole,
  initialQuestion,
  onFinish,
  onCancel
}) => {
  const { user, language, updateProfile } = useAuth();

  // Setup state
  const [isStarted, setIsStarted] = useState(false);
  const [config, setConfig] = useState<InterviewConfig>({
    streamId: initialStreamId,
    roleExam: initialRole || (STREAMS_DATA.find(s => s.id === initialStreamId)?.roles[0] || 'Software Engineer'),
    difficulty: 'Medium',
    durationMinutes: 10,
    persona: 'Friendly',
    language: 'en',
    isProctored: true,
  });

  // Interview state
  const [aiState, setAiState] = useState<'idle' | 'speaking' | 'listening' | 'thinking'>('idle');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionsPool, setQuestionsPool] = useState<QuestionItem[]>([]);
  const [currentQuestionText, setCurrentQuestionText] = useState('');
  const [transcript, setTranscript] = useState('');
  const [liveSpokenText, setLiveSpokenText] = useState('');
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(config.durationMinutes * 60);

  // Whiteboard / Code scratchpad for CSE / Architecture
  const [codeOrNotes, setCodeOrNotes] = useState('');
  const [showCodePad, setShowCodePad] = useState(false);
  const [typedAnswerInput, setTypedAnswerInput] = useState('');

  // Evaluation & session history
  const [turns, setTurns] = useState<TurnEvaluation[]>([]);
  const turnsRef = useRef<TurnEvaluation[]>([]);
  const [integrityEvents, setIntegrityEvents] = useState<IntegrityEvent[]>([]);
  const [warningsCount, setWarningsCount] = useState(0);
  const [attentionScore, setAttentionScore] = useState(95);
  const [isTerminated, setIsTerminated] = useState(false);
  const [terminationReason, setTerminationReason] = useState<string | null>(null);

  // Speech Recognition & Synthesis references
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<any>(null);
  const turnStartTimeRef = useRef<number>(Date.now());
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const transcriptRef = useRef('');
  const liveSpokenTextRef = useRef('');
  const typedAnswerInputRef = useRef('');
  const aiStateRef = useRef(aiState);
  const isMicMutedRef = useRef(isMicMuted);
  const isPausedRef = useRef(isPaused);
  const isTerminatedRef = useRef(isTerminated);

  const [mediaError, setMediaError] = useState<string | null>(null);
  const [micPermission, setMicPermission] = useState<'idle' | 'granted' | 'denied'>('idle');
  const [camPermission, setCamPermission] = useState<'idle' | 'granted' | 'denied'>('idle');

  useEffect(() => { transcriptRef.current = transcript; }, [transcript]);
  useEffect(() => { liveSpokenTextRef.current = liveSpokenText; }, [liveSpokenText]);
  useEffect(() => { typedAnswerInputRef.current = typedAnswerInput; }, [typedAnswerInput]);
  useEffect(() => { aiStateRef.current = aiState; }, [aiState]);
  useEffect(() => { isMicMutedRef.current = isMicMuted; }, [isMicMuted]);
  useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);
  useEffect(() => { isTerminatedRef.current = isTerminated; }, [isTerminated]);
  useEffect(() => { turnsRef.current = turns; }, [turns]);

  // Initialize questions pool for selected stream (Supabase when connected)
  useEffect(() => {
    let cancelled = false;
    const loadPool = async () => {
      let pool = QUESTIONS_SEED.filter(q => q.streamId === config.streamId);
      if (isSupabaseConfigured()) {
        const remote = await fetchQuestionsFromSupabase(config.streamId);
        if (remote.length > 0) pool = remote;
      }
      if (initialQuestion) {
        pool = [initialQuestion, ...pool.filter(q => q.id !== initialQuestion.id)];
      }
      if (!cancelled) setQuestionsPool(pool);
    };
    loadPool();
    return () => { cancelled = true; };
  }, [config.streamId, initialQuestion]);

  // Speech Synthesis helper (AI voice)
  const speakText = (text: string, onEndCallback?: () => void) => {
    if (!('speechSynthesis' in window)) {
      setAiState('listening');
      if (onEndCallback) onEndCallback();
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = config.language === 'hi' ? 'hi-IN' : 'en-US';
    utterance.rate = config.persona === 'Strict' ? 1.05 : 0.98;
    utterance.pitch = config.persona === 'Strict' ? 0.95 : 1.0;

    // Pick a natural voice if available
    const voices = window.speechSynthesis.getVoices();
    const selectedVoice = voices.find(v => 
      config.language === 'hi' ? v.lang.includes('hi') : (v.lang.includes('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha')))
    );
    if (selectedVoice) utterance.voice = selectedVoice;

    setAiState('speaking');

    utterance.onend = () => {
      setAiState('listening');
      if (onEndCallback) onEndCallback();
      startListening();
    };

    utterance.onerror = () => {
      setAiState('listening');
      if (onEndCallback) onEndCallback();
      startListening();
    };

    window.speechSynthesis.speak(utterance);
  };

  const appendSpokenTextToAnswerBox = (spoken: string) => {
    const chunk = spoken.trim();
    if (!chunk) return;
    setTranscript((prev) => {
      const next = (prev + ' ' + chunk).trim();
      transcriptRef.current = next;
      return next;
    });
    setTypedAnswerInput((prev) => {
      const spacer = prev && !prev.endsWith(' ') && !prev.endsWith('\n') ? ' ' : '';
      const next = (prev + spacer + chunk).trimStart();
      typedAnswerInputRef.current = next;
      return next;
    });
  };

  // Web Speech API: Speech Recognition (Voice In) → text in the answer box
  const startListening = () => {
    if (isMicMutedRef.current || isPausedRef.current || isTerminatedRef.current) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('SpeechRecognition API not supported. Falling back to typed answers.');
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = config.language === 'hi' ? 'hi-IN' : 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setAiState('listening');
        setMediaError(null);
      };

      recognition.onresult = (event: any) => {
        let currentInterim = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const spoken = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            appendSpokenTextToAnswerBox(spoken);
          } else {
            currentInterim += spoken;
          }
        }
        liveSpokenTextRef.current = currentInterim;
        setLiveSpokenText(currentInterim);

        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
          const combined = (
            typedAnswerInputRef.current + ' ' +
            transcriptRef.current + ' ' +
            liveSpokenTextRef.current
          ).trim();
          if (combined.split(/\s+/).filter(Boolean).length > 8) {
            handleCompleteTurn();
          }
        }, 4500);
      };

      recognition.onerror = (event: any) => {
        const err = event?.error;
        if (err === 'not-allowed' || err === 'service-not-allowed') {
          setMicPermission('denied');
          setMediaError('Microphone permission denied. Allow microphone access in the browser prompt, then try again.');
        } else if (err === 'no-speech' || err === 'aborted') {
          return;
        } else {
          console.warn('Speech recognition status:', err);
        }
      };

      recognition.onend = () => {
        if (
          aiStateRef.current === 'listening' &&
          !isPausedRef.current &&
          !isTerminatedRef.current &&
          !isMicMutedRef.current
        ) {
          try { recognition.start(); } catch (e) {}
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err) {
      console.warn('Could not start recognition', err);
      setMediaError('Could not start speech recognition. You can still type your answer.');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }
  };

  const stopMediaTracks = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
  };

  const requestCameraAndMicPermission = async (): Promise<boolean> => {
    setMediaError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setMediaError('This browser does not support camera or microphone access. You can still type answers.');
      return true;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
        video: config.isProctored
          ? { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
          : false
      });
      mediaStreamRef.current = stream;
      setMicPermission('granted');
      if (config.isProctored) setCamPermission('granted');
      // Release video so the proctor preview can open the same camera.
      stream.getVideoTracks().forEach((t) => t.stop());
      return true;
    } catch (err: any) {
      const name = err?.name || '';
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        setMicPermission('denied');
        setCamPermission(config.isProctored ? 'denied' : camPermission);
        setMediaError('Please allow camera and microphone access when the browser asks, then click Begin again.');
        return false;
      }
      if (name === 'NotFoundError') {
        setMediaError('No camera or microphone was found. You can still type your answers.');
        return true;
      }
      setMediaError('Could not access camera or microphone: ' + (err?.message || name) + '. You can still type your answers.');
      return true;
    }
  };

  // Timer countdown
  useEffect(() => {
    if (!isStarted || isPaused || isTerminated) return;

    const interval = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          handleWrapUpInterview();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isStarted, isPaused, isTerminated]);

  // Start the interview session
  const handleStartSession = async () => {
    const allowed = await requestCameraAndMicPermission();
    if (!allowed) return;

    setIsStarted(true);
    turnStartTimeRef.current = Date.now();
    const firstQ = questionsPool[0] || QUESTIONS_SEED[0];
    setCurrentQuestionText(firstQ.question);

    let greeting = '';
    if (config.streamId === 'upsc_nda') {
      greeting = `Good day, ${user?.name || 'Candidate'}. Welcome to your Civil Services and SSB Personality Board. Please take your seat, relax, and answer thoughtfully. Here is your first question: ${firstQ.question}`;
    } else if (config.streamId === 'architecture') {
      greeting = `Hello, ${user?.name || 'Candidate'}. Welcome to your Architecture & Spatial Design review. We will evaluate your portfolio logic, material choices, and bioclimatic sensibilities. Let us begin: ${firstQ.question}`;
    } else {
      greeting = `Hi ${user?.name || 'Aarav'}, welcome to your Software Engineering technical drill. We'll be assessing data structures, system design, and algorithmic reasoning. Let's start with this: ${firstQ.question}`;
    }

    setTimeout(() => {
      speakText(greeting);
    }, 600);
  };

  // Complete a question answer turn and receive evaluation
  const handleCompleteTurn = async () => {
    stopListening();
    setAiState('thinking');

    const fullAnswer = (
      typedAnswerInputRef.current + ' ' + liveSpokenTextRef.current
    ).trim() || transcriptRef.current.trim();
    const currentQ = questionsPool[currentQuestionIndex];

    // Call evaluate endpoint
    try {
      const response = await fetch('/api/interview/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: currentQuestionText,
          userTranscript: fullAnswer,
          streamId: config.streamId,
          persona: config.persona,
          keyPoints: currentQ?.keyPoints || [],
          sampleAnswer: currentQ?.sampleAnswer || '',
          idealOutline: currentQ?.idealOutline || []
        })
      });
      const data = await response.json();
      const evalData = data.evaluation;

      const newTurn: TurnEvaluation = {
        turnIndex: currentQuestionIndex + 1,
        question: currentQuestionText,
        userTranscript: fullAnswer,
        overallScore: evalData.overallScore,
        contentAccuracy: evalData.contentAccuracy,
        communicationClarity: evalData.communicationClarity,
        confidence: evalData.confidence,
        structure: evalData.structure,
        relevance: evalData.relevance,
        positivePoints: evalData.positivePoints,
        improvements: evalData.improvements,
        modelAnswer: questionsPool[currentQuestionIndex]?.sampleAnswer || evalData.modelAnswer,
        wpm: evalData.wpm,
        fillerWordsCount: evalData.fillerWordsCount,
        fillerWordsDetected: evalData.fillerWordsDetected
      };

      continueInterview(newTurn);
    } catch (e) {
      const wordCount = fullAnswer.split(/\s+/).filter(Boolean).length;
      const low = wordCount < 12;
      const fallbackTurn: TurnEvaluation = {
        turnIndex: currentQuestionIndex + 1,
        question: currentQuestionText,
        userTranscript: fullAnswer,
        overallScore: low ? 2.0 : 4.5,
        contentAccuracy: low ? 1.5 : 4.0,
        communicationClarity: low ? 2.0 : 5.0,
        confidence: low ? 2.0 : 4.5,
        structure: low ? 1.5 : 4.0,
        relevance: low ? 2.0 : 4.5,
        positivePoints: ['Attempted to engage with the question topic.'],
        improvements: ['Could not reach the scoring service. Submit a fuller answer covering definition, example, and outcome.'],
        modelAnswer: questionsPool[currentQuestionIndex]?.sampleAnswer || 'Ideal answer balances theory with real-world failure modes.',
        wpm: wordCount > 0 ? Math.round(wordCount / 0.45) : 0,
        fillerWordsCount: 0,
        fillerWordsDetected: []
      };

      continueInterview(fallbackTurn);
    }
  };

  const continueInterview = (completedTurn: TurnEvaluation) => {
    const completedTurns = [...turnsRef.current, completedTurn];
    turnsRef.current = completedTurns;
    setTurns(completedTurns);

    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < Math.min(questionsPool.length, 5)) {
      setCurrentQuestionIndex(nextIndex);
      const nextQ = questionsPool[nextIndex];
      setCurrentQuestionText(nextQ.question);
      setTranscript('');
      setLiveSpokenText('');
      setTypedAnswerInput('');
      turnStartTimeRef.current = Date.now();

      const transition = config.persona === 'Strict'
        ? `Understood. Let's dig deeper into the next area: ${nextQ.question}`
        : `Good points. Let us move to the next question: ${nextQ.question}`;

      speakText(transition);
    } else {
      handleWrapUpInterview(completedTurns);
    }
  };

  // Wrap up interview and compute final report
  const handleWrapUpInterview = (completedTurns = turnsRef.current) => {
    stopListening();
    stopMediaTracks();
    window.speechSynthesis?.cancel();

    const currentAnswer = (typedAnswerInputRef.current + ' ' + liveSpokenTextRef.current).trim();
    const turnList = completedTurns.length > 0 ? completedTurns : [
      {
        turnIndex: 1,
        question: currentQuestionText,
        userTranscript: currentAnswer,
        overallScore: currentAnswer ? 3.0 : 1.0,
        contentAccuracy: currentAnswer ? 3.0 : 1.0,
        communicationClarity: currentAnswer ? 3.5 : 1.0,
        confidence: currentAnswer ? 3.0 : 1.0,
        structure: currentAnswer ? 2.5 : 1.0,
        relevance: currentAnswer ? 3.0 : 1.0,
        positivePoints: ['Session ended before a full scored turn was completed.'],
        improvements: ['Submit each answer so it can be scored against the question key points.'],
        modelAnswer: questionsPool[0]?.sampleAnswer || 'Model answer illustrates clear technical trade-offs.',
        wpm: 0,
        fillerWordsCount: 0,
        fillerWordsDetected: []
      }
    ];

    const avgScore = Number((turnList.reduce((acc, t) => acc + t.overallScore, 0) / turnList.length).toFixed(1));
    const avgAccuracy = Number((turnList.reduce((acc, t) => acc + t.contentAccuracy, 0) / turnList.length).toFixed(1));
    const avgClarity = Number((turnList.reduce((acc, t) => acc + t.communicationClarity, 0) / turnList.length).toFixed(1));
    const avgConfidence = Number((turnList.reduce((acc, t) => acc + t.confidence, 0) / turnList.length).toFixed(1));
    const avgStructure = Number((turnList.reduce((acc, t) => acc + t.structure, 0) / turnList.length).toFixed(1));
    const avgRelevance = Number((turnList.reduce((acc, t) => acc + t.relevance, 0) / turnList.length).toFixed(1));
    const totalFillers = turnList.reduce((acc, t) => acc + t.fillerWordsCount, 0);

    const report: InterviewReport = {
      sessionId: 'sess_' + Date.now(),
      streamId: config.streamId,
      roleExam: config.roleExam,
      date: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
      durationSeconds: config.durationMinutes * 60 - timeLeftSeconds,
      persona: config.persona,
      isProctored: config.isProctored,
      warningsCount,
      isTerminated,
      terminationReason: terminationReason || undefined,
      overallScore: avgScore,
      subScores: {
        contentAccuracy: avgAccuracy,
        communicationClarity: avgClarity,
        confidence: avgConfidence,
        structure: avgStructure,
        relevance: avgRelevance,
        attentionGazeScore: attentionScore
      },
      speechAnalytics: {
        averageWpm: 128,
        fillerWordsTotal: totalFillers,
        fillerWordsBreakdown: { 'um': Math.ceil(totalFillers * 0.4), 'actually': Math.ceil(totalFillers * 0.3), 'like': Math.floor(totalFillers * 0.3) },
        totalSpeakingSeconds: Math.round((config.durationMinutes * 60 - timeLeftSeconds) * 0.65),
        pauseCount: 4
      },
      turns: turnList,
      actionablePlan: [
        'Practice pausing silently for 1 second instead of saying verbal fillers like "actually" or "like".',
        'Frame your technical arguments starting with high-level constraints before diving into algorithmic nuances.',
        'Review the recommended questions in your dashboard to solidify edge-case explanations.'
      ],
      suggestedQuestions: [
        'How would you handle a distributed transaction across microservices with eventual consistency?',
        'As an administrator, how do you handle political resistance to land acquisition for public infrastructure?'
      ],
      integrityEvents
    };

    // 1. Asynchronously persist to Supabase Cloud Database
    saveInterviewSessionToSupabase(report, user?.id).catch(err => {
      console.warn('Async Supabase session save notice:', err);
    });

    // 2. Also sync to backend Express server
    fetch('/api/interview/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session: { ...report, id: report.sessionId, userId: user?.id },
        turns: report.turns
      })
    }).catch(() => {});

    // 3. Award XP & speaking stats to candidate profile
    if (updateProfile && user) {
      const addedMins = Math.max(1, Math.ceil(report.durationSeconds / 60));
      updateProfile({
        completedSessions: (user.completedSessions || 0) + 1,
        totalSpeakingMinutes: (user.totalSpeakingMinutes || 0) + addedMins,
        xp: (user.xp || 100) + 150,
        level: Math.floor(((user.xp || 100) + 150) / 400) + 1
      });
    }

    onFinish(report);
  };

  // Termination handler from ProctoredEngine
  const handleProctorTermination = (reason: string) => {
    setIsTerminated(true);
    setTerminationReason(reason);
    stopListening();
    window.speechSynthesis?.cancel();
  };

  const handleProctorWarning = (count: number, reason: string) => {
    setWarningsCount(count);
  };

  const handleLogIntegrityEvent = (event: Partial<IntegrityEvent>) => {
    const fullEvent: IntegrityEvent = {
      id: 'evt_' + Date.now(),
      sessionId: 'sess_active',
      timestamp: new Date().toLocaleTimeString(),
      type: event.type || 'gaze_away',
      description: event.description || 'Integrity anomaly',
      warningIssued: !!event.warningIssued,
      warningNumber: event.warningNumber,
      status: event.status || 'confirmed'
    };
    setIntegrityEvents(prev => [fullEvent, ...prev]);
  };

  // Format timer MM:SS
  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // ==================== 1. SETUP SCREEN ====================
  if (!isStarted) {
    const currentStreamDef = STREAMS_DATA.find(s => s.id === config.streamId) || STREAMS_DATA[0];

    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="rounded-3xl glass-panel p-6 sm:p-10 border border-slate-200 dark:border-slate-800 space-y-8 bg-slate-900/90 shadow-2xl">
          <div className="text-center max-w-xl mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-amber-500 text-white flex items-center justify-center mx-auto mb-4 shadow-xl shadow-brand-500/30">
              <Mic className="w-7 h-7" />
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
              AI Spoken Mock Interview Setup
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2">
              Configure your interview stream, persona, duration, and proctoring integrity level before entering the arena.
            </p>
          </div>

          <div className="space-y-6">
            {/* Stream Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                1. Select Interview Stream
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {STREAMS_DATA.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setConfig(prev => ({
                        ...prev,
                        streamId: s.id,
                        roleExam: s.roles[0]
                      }));
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      config.streamId === s.id
                        ? 'bg-brand-600/20 border-brand-500 text-white shadow-lg shadow-brand-500/10'
                        : 'bg-slate-800/60 border-slate-700/80 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <p className="text-xs font-bold text-white">{s.name.split('&')[0]}</p>
                    <p className="text-[10px] text-amber-400 mt-1 line-clamp-1">{s.tagline}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Role / Specialization */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                2. Target Specialization / Board Track
              </label>
              <select
                value={config.roleExam}
                onChange={(e) => setConfig({ ...config, roleExam: e.target.value })}
                className="w-full p-3 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-brand-500"
              >
                {currentStreamDef.roles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* Persona, Duration & Language */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Interviewer Persona
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['Friendly', 'Strict', 'Panel of 3'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setConfig({ ...config, persona: p })}
                      className={`py-2 px-1 text-center text-xs font-bold rounded-xl border transition-all ${
                        config.persona === p
                          ? 'bg-brand-600 text-white border-brand-500'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Duration
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {([5, 10, 20] as const).map((d) => (
                    <button
                      key={d}
                      onClick={() => {
                        setConfig({ ...config, durationMinutes: d });
                        setTimeLeftSeconds(d * 60);
                      }}
                      className={`py-2 text-center text-xs font-bold rounded-xl border transition-all ${
                        config.durationMinutes === d
                          ? 'bg-indigo-600 text-white border-indigo-500'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      {d} min
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Language
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(['en', 'hi'] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setConfig({ ...config, language: lang })}
                      className={`py-2 text-center text-xs font-bold rounded-xl border transition-all ${
                        config.language === lang
                          ? 'bg-brand-600 text-white border-brand-500'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      {lang === 'en' ? 'English' : 'हिन्दी'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Proctored Mode Toggle */}
            <div className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>Enforce Anti-Cheating Proctored Mode</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400">
                      RECOMMENDED
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Runs on-device vision to detect gaze deviation (&gt;3s), missing face, and tab switching with a 3-warning rule.
                  </p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={config.isProctored}
                  onChange={(e) => setConfig({ ...config, isProctored: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600" />
              </label>
            </div>
          </div>

          {mediaError && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-200 text-xs">
              {mediaError}
            </div>
          )}

          <p className="text-[11px] text-slate-400">
            Your browser will ask to allow the microphone{config.isProctored ? ' and camera' : ''}. Grant access so spoken answers can be transcribed into the answer box
            {config.isProctored ? ' and the proctor preview can run' : ''}.
          </p>

          {/* Action CTAs */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-4">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>

            <button
              onClick={handleStartSession}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-extrabold text-sm shadow-xl shadow-brand-500/30 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
              <span>Begin Live Spoken Interview</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==================== 2. TERMINATION MODAL ====================
  if (isTerminated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
        <div className="w-full max-w-md rounded-3xl glass-panel bg-slate-900 border border-rose-500/60 p-6 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 mx-auto flex items-center justify-center">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-extrabold text-white">
            Interview Terminated: Integrity Violation
          </h2>
          <p className="text-xs text-rose-300 bg-rose-500/10 p-3 rounded-xl border border-rose-500/30">
            {terminationReason || 'Exceeded the maximum allowed threshold of 3 integrity warnings.'}
          </p>
          <p className="text-xs text-slate-400 leading-relaxed">
            All infractions have been recorded into your session audit log. You can review the event timeline in your feedback report or appeal to an admin.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => handleWrapUpInterview()}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all"
            >
              View Integrity Report & Audit Timeline
            </button>
            <button
              onClick={onCancel}
              className="w-full py-2 rounded-xl text-xs text-slate-400 hover:text-white"
            >
              Exit to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==================== 3. LIVE INTERVIEW ARENA ====================
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
      {/* Top Header Bar: Question index, Timer, Status, Controls */}
      <div className="rounded-2xl glass-panel p-4 border border-slate-800 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="px-2.5 py-1 rounded-lg bg-brand-500/20 text-brand-400 text-xs font-bold">
            Question {currentQuestionIndex + 1} of {Math.min(questionsPool.length, 5)}
          </div>
          <span className="text-xs text-slate-400 hidden sm:inline">
            Role: <strong className="text-white">{config.roleExam}</strong>
          </span>
        </div>

        {/* Timer */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-800/90 border border-slate-700 text-xs font-mono font-bold text-amber-400">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>{formatTimer(timeLeftSeconds)}</span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Pause */}
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
            title={isPaused ? 'Resume Interview' : 'Pause Interview'}
          >
            {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4" />}
          </button>

          {/* Repeat Question */}
          <button
            onClick={() => speakText(currentQuestionText)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
            title="Repeat Question by Voice"
          >
            <RotateCcw className="w-4 h-4 text-brand-400" />
          </button>

          {/* Code/Scratchpad Toggle for CSE/Arch */}
          <button
            onClick={() => setShowCodePad(!showCodePad)}
            className={`p-2 rounded-xl text-xs font-medium transition-all ${
              showCodePad ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
            title="Toggle Code / Diagram Scratchpad"
          >
            <Code2 className="w-4 h-4" />
          </button>

          {/* End Session Button */}
          <button
            onClick={() => handleWrapUpInterview()}
            className="px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white text-xs font-bold border border-rose-500/30 flex items-center gap-1.5 transition-all"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>Finish</span>
          </button>
        </div>
      </div>

      {/* Main Grid: AI Interviewer Orb Center & Proctoring Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: Animated AI Orb & Live Question Dialogue */}
        <div className="lg:col-span-2 rounded-3xl glass-panel p-6 sm:p-8 border border-slate-800 flex flex-col justify-between min-h-[480px] bg-slate-900/90 relative overflow-hidden">
          {/* Background Ambient Glow */}
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full blur-[100px] pointer-events-none transition-all duration-700 ${
            aiState === 'speaking' ? 'bg-brand-500/25' :
            aiState === 'listening' ? 'bg-emerald-500/20' :
            aiState === 'thinking' ? 'bg-amber-500/20' : 'bg-indigo-500/10'
          }`} />

          {/* Animated AI Interviewer Orb */}
          <div className="my-6 flex flex-col items-center justify-center text-center relative z-10">
            <div className="relative flex items-center justify-center">
              {/* Pulsing state ring */}
              <div className={`absolute w-36 h-36 rounded-full transition-all duration-500 ${
                aiState === 'speaking' ? 'bg-brand-500/30 animate-ping' :
                aiState === 'listening' ? 'bg-emerald-500/25 animate-pulse' :
                aiState === 'thinking' ? 'bg-amber-500/25 animate-spin-slow' : 'opacity-0'
              }`} />

              {/* Core Orb */}
              <div className={`relative w-24 h-24 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 ${
                aiState === 'speaking' ? 'bg-gradient-to-tr from-brand-600 to-indigo-500 shadow-brand-500/50 scale-105' :
                aiState === 'listening' ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 shadow-emerald-500/50' :
                aiState === 'thinking' ? 'bg-gradient-to-tr from-amber-600 to-orange-500 shadow-amber-500/50 rotate-45' :
                'bg-gradient-to-tr from-slate-700 to-slate-800'
              }`}>
                {aiState === 'speaking' && <Volume2 className="w-10 h-10 text-white animate-pulse" />}
                {aiState === 'listening' && <Mic className="w-10 h-10 text-white animate-bounce" />}
                {aiState === 'thinking' && <Sparkles className="w-10 h-10 text-white animate-spin-slow" />}
                {aiState === 'idle' && <VolumeX className="w-10 h-10 text-slate-400" />}
              </div>
            </div>

            {/* AI State Badge */}
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold capitalize bg-slate-800 border border-slate-700">
              <span className={`w-2 h-2 rounded-full ${
                aiState === 'speaking' ? 'bg-brand-400 animate-ping' :
                aiState === 'listening' ? 'bg-emerald-400 animate-pulse' :
                aiState === 'thinking' ? 'bg-amber-400' : 'bg-slate-500'
              }`} />
              <span className="text-slate-200">
                AI Interviewer is {aiState}...
              </span>
            </div>

            {/* Live Waveform when speaking or listening */}
            {(aiState === 'speaking' || aiState === 'listening') && (
              <div className="flex items-center gap-1.5 h-6 mt-3">
                {[30, 80, 45, 95, 60, 90, 40, 75, 50, 85, 35].map((h, i) => (
                  <div
                    key={i}
                    className={`w-1 rounded-full ${
                      aiState === 'speaking' ? 'bg-brand-400' : 'bg-emerald-400'
                    }`}
                    style={{
                      height: `${h}%`,
                      animation: 'wave 1s ease-in-out infinite',
                      animationDelay: `${i * 0.08}s`
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Current Question Box */}
          <div className="relative z-10 p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold text-amber-400 uppercase tracking-wider text-[10px]">
                Active Inquiry ({config.persona} Persona)
              </span>
              <span className="text-[11px] text-slate-400">Speak your answer clearly</span>
            </div>

            <p className="text-base sm:text-lg font-bold text-white leading-relaxed">
              "{currentQuestionText}"
            </p>

            {/* Live Transcript / Candidate Voice Feedback */}
            <div className="pt-3 border-t border-slate-800/80 min-h-[50px]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Your Spoken Words (Live Speech-To-Text):
              </span>
              <p className="text-xs text-slate-200 italic font-mono leading-relaxed">
                {transcript} <span className="text-emerald-400">{liveSpokenText}</span>
                {!transcript && !liveSpokenText && (
                  <span className="text-slate-500 not-italic font-sans">
                    (Listening for speech... silence will automatically submit your response)
                  </span>
                )}
              </p>
            </div>

            {/* Answer box: typed + live microphone transcript */}
            <div className="pt-2 space-y-2">
              {mediaError && (
                <p className="text-[11px] text-amber-300">{mediaError}</p>
              )}
              <textarea
                value={typedAnswerInput + (liveSpokenText ? (typedAnswerInput && !typedAnswerInput.endsWith(' ') ? ' ' : '') + liveSpokenText : '')}
                onChange={(e) => {
                  const live = liveSpokenTextRef.current;
                  let next = e.target.value;
                  if (live && next.endsWith(live)) {
                    next = next.slice(0, next.length - live.length).trimEnd();
                  }
                  typedAnswerInputRef.current = next;
                  setTypedAnswerInput(next);
                }}
                rows={4}
                placeholder="Speak your answer — it will appear here as text. You can also type."
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-brand-500 resize-y min-h-[88px]"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleCompleteTurn();
                }}
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const nextMuted = !isMicMuted;
                    setIsMicMuted(nextMuted);
                    isMicMutedRef.current = nextMuted;
                    mediaStreamRef.current?.getAudioTracks().forEach((t) => { t.enabled = !nextMuted; });
                    if (nextMuted) {
                      stopListening();
                    } else {
                      startListening();
                    }
                  }}
                  className={`p-2 rounded-xl text-xs font-medium border ${
                    isMicMuted
                      ? 'bg-rose-600 text-white border-rose-500'
                      : 'bg-slate-800 text-emerald-400 border-slate-700'
                  }`}
                  title={isMicMuted ? 'Unmute microphone' : 'Mute microphone'}
                >
                  {isMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
                <button
                  onClick={handleCompleteTurn}
                  disabled={aiState === 'thinking'}
                  className="px-4 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs flex items-center gap-1 shadow-md shrink-0"
                >
                  {aiState === 'thinking' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>Submit Answer</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Proctored Engine HUD or Code/Whiteboard Scratchpad */}
        <div className="space-y-4">
          {/* Proctoring HUD */}
          {config.isProctored ? (
            <ProctoredEngine
              isActive={isStarted && !isTerminated}
              onWarningIssued={handleProctorWarning}
              onSessionTerminated={handleProctorTermination}
              onUpdateAttentionScore={setAttentionScore}
              onLogEvent={handleLogIntegrityEvent}
            />
          ) : (
            <div className="rounded-2xl glass-panel p-4 border border-slate-800 text-center text-xs text-slate-400">
              Proctored mode is disabled for this practice session.
            </div>
          )}

          {/* Interactive Code Scratchpad (toggleable) */}
          {showCodePad && (
            <div className="rounded-2xl glass-panel p-4 border border-indigo-500/40 bg-slate-900 space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-400 flex items-center gap-1">
                  <Code2 className="w-4 h-4" /> Code & System Diagram Scratchpad
                </span>
                <span className="text-[10px] text-slate-500">Live Note</span>
              </div>
              <textarea
                value={codeOrNotes}
                onChange={(e) => setCodeOrNotes(e.target.value)}
                rows={6}
                placeholder="// Type pseudocode, schema outline, or architectural thoughts here..."
                className="w-full p-2.5 text-xs font-mono rounded-xl bg-slate-950 border border-slate-700 text-emerald-400 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}

          {/* Real-time Session Turn History mini-list */}
          <div className="rounded-2xl glass-panel p-4 border border-slate-800 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Evaluated Turns ({turns.length})
            </span>
            {turns.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No turns completed yet. Speak your answer to submit.</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {turns.map((t) => (
                  <div key={t.turnIndex} className="p-2 rounded-xl bg-slate-800/70 border border-slate-700/80 text-xs flex items-center justify-between">
                    <span className="truncate max-w-[170px] text-slate-300">
                      Q{t.turnIndex}: {t.question}
                    </span>
                    <span className="px-1.5 py-0.5 rounded font-bold text-emerald-400 bg-emerald-500/10">
                      {t.overallScore}/10
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
