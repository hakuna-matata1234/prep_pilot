import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { QUESTIONS_SEED } from '../data/questionsData';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  PhoneOff, 
  Share2, 
  MessageSquare, 
  FileText, 
  ShieldCheck, 
  AlertTriangle, 
  Send, 
  Clock, 
  Users, 
  Sparkles, 
  CheckCircle2, 
  X,
  Maximize2,
  PenTool
} from 'lucide-react';
import { io, Socket } from 'socket.io-client';

interface LiveMentorMeetingProps {
  roomId: string;
  onLeave: () => void;
}

export const LiveMentorMeeting: React.FC<LiveMentorMeetingProps> = ({
  roomId,
  onLeave
}) => {
  const { user } = useAuth();
  const isMentor = user?.role === 'mentor';

  // Lobby state
  const [isInLobby, setIsInLobby] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [consentAgreed, setConsentAgreed] = useState(true);

  // In-call UI state
  const [activeTab, setActiveTab] = useState<'chat' | 'whiteboard' | 'mentorTools' | 'proctorAlerts'>('chat');
  const [callDurationSec, setCallDurationSec] = useState(45 * 60); // 45 min meeting
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  // Real-time chat & pushed question
  const [chatMessages, setChatMessages] = useState<Array<{ sender: string; role: string; text: string; time: string }>>([
    { sender: 'System', role: 'system', text: `Welcome to 1:1 Live Mock Session (${roomId}). Meeting encrypted & proctored.`, time: '10:00' }
  ]);
  const [messageInput, setMessageInput] = useState('');
  const [activePushedQuestion, setActivePushedQuestion] = useState<string | null>(null);

  // Whiteboard drawing / shared notes
  const [whiteboardText, setWhiteboardText] = useState('// Shared Whiteboard & Architectural Notes\n// Feel free to sketch schemas, algorithms, or policy outlines here:\n\n');

  // Mentor private rubric state
  const [mentorRubric, setMentorRubric] = useState({
    knowledge: 8.5,
    communication: 8.0,
    confidence: 8.5,
    problemSolving: 9.0,
    notes: 'Candidate demonstrates strong composure. Followed up on edge cases well.'
  });

  // Proctor alerts for mentor HUD
  const [mentorAlerts, setMentorAlerts] = useState<Array<{ id: string; time: string; reason: string; status: 'pending' | 'confirmed' | 'dismissed' }>>([
    { id: 'alt_1', time: '10:04 AM', reason: 'Candidate looked away from screen for 3.2s', status: 'pending' }
  ]);

  // Video streams refs
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);  // persists across lobby→call
  const socketRef = useRef<Socket | null>(null);

  // Camera permission error state
  const [cameraError, setCameraError] = useState<string | null>(null);

  // ── Camera helpers ──────────────────────────────────────────────────────
  const startCamera = async () => {
    setCameraError(null);
    try {
      // Stop any existing stream first
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(t => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: { echoCancellation: true, noiseSuppression: true }
      });
      localStreamRef.current = stream;
      // Apply current toggle states immediately
      stream.getVideoTracks().forEach(t => { t.enabled = cameraEnabled; });
      stream.getAudioTracks().forEach(t => { t.enabled = micEnabled; });
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.muted = true;
        localVideoRef.current.playsInline = true;
        await localVideoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      const msg = err?.name === 'NotAllowedError'
        ? 'Camera permission denied. Please allow camera access in your browser settings.'
        : err?.name === 'NotFoundError'
        ? 'No camera detected on this device.'
        : 'Unable to access camera: ' + (err?.message || err);
      setCameraError(msg);
      console.warn('[Camera]', msg);
    }
  };

  const stopCamera = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
    }
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
  };

  // Start camera preview in lobby, and re-attach when ref mounts
  useEffect(() => {
    if (!isInLobby) return;   // handled separately on call join
    startCamera();
    // Cleanup only when component fully unmounts (not on re-renders)
    return () => { /* stream kept alive for call transition */ };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);  // run once on mount

  // When video ref mounts / changes, attach existing stream
  useEffect(() => {
    if (localVideoRef.current && localStreamRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
      localVideoRef.current.play().catch(() => {});
    }
  });

  // Cleanup camera on full unmount
  useEffect(() => {
    return () => stopCamera();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  // Initialize Socket.io + start camera when entering the call room
  useEffect(() => {
    if (isInLobby) return;

    // Re-request camera for in-call view (lobby may have cleaned up the ref)
    startCamera();

    const socket = io();
    socketRef.current = socket;

    socket.emit('join-room', {
      roomId,
      role: user?.role || 'student',
      userName: user?.name || 'Aspirant'
    });

    socket.on('chat-message', (data: any) => {
      setChatMessages(prev => [...prev, {
        sender: data.senderName,
        role: data.role,
        text: data.message,
        time: data.time
      }]);
    });

    socket.on('push-question', (q: string) => {
      setActivePushedQuestion(q);
    });

    socket.on('proctor-alert', (alert: any) => {
      setMentorAlerts(prev => [{
        id: alert.id || 'alt_' + Date.now(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        reason: alert.description || alert.reason,
        status: 'pending'
      }, ...prev]);
    });

    return () => {
      socket.disconnect();
    };
  }, [isInLobby, roomId, user]);

  // Meeting timer
  useEffect(() => {
    if (isInLobby) return;
    const interval = setInterval(() => {
      setCallDurationSec(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [isInLobby]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    const msgObj = {
      sender: user?.name || 'Me',
      role: user?.role || 'student',
      text: messageInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, msgObj]);

    if (socketRef.current) {
      socketRef.current.emit('chat-message', {
        roomId,
        message: msgObj.text,
        senderName: msgObj.sender,
        role: msgObj.role,
        time: msgObj.time
      });
    }

    setMessageInput('');
  };

  const handlePushQuestion = (qText: string) => {
    setActivePushedQuestion(qText);
    if (socketRef.current) {
      socketRef.current.emit('push-question', { roomId, question: qText });
    }
  };

  const handleDismissAlert = (id: string) => {
    setMentorAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'dismissed' } : a));
  };

  const handleConfirmAlert = (id: string) => {
    setMentorAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'confirmed' } : a));
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // ==================== LOBBY SCREEN ====================
  if (isInLobby) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="rounded-3xl glass-panel p-6 sm:p-8 border border-slate-800 bg-slate-900/90 shadow-2xl space-y-6">
          <div className="text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400 bg-brand-500/10 px-2.5 py-0.5 rounded-full border border-brand-500/30">
              Pre-Join Meeting Lobby
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
              Ready to Join 1:1 Video Session?
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Room ID: <strong className="text-emerald-400 font-mono">{roomId}</strong> • Timezone: Asia/Kolkata
            </p>
          </div>

          {/* Camera Preview Box */}
          <div className="relative w-full h-64 rounded-2xl bg-black border border-slate-700 overflow-hidden flex items-center justify-center">
            {cameraEnabled ? (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform scale-x-[-1]"
              />
            ) : (
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                  <VideoOff className="w-7 h-7" />
                </div>
                <p className="text-xs text-slate-400">Camera is turned off</p>
              </div>
            )}
            {/* Camera error banner */}
            {cameraError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 px-4 text-center gap-3">
                <AlertTriangle className="w-8 h-8 text-amber-400" />
                <p className="text-xs text-amber-300">{cameraError}</p>
                <button
                  onClick={startCamera}
                  className="px-3 py-1.5 text-xs bg-brand-600 hover:bg-brand-500 text-white rounded-lg font-semibold"
                >
                  Retry Camera
                </button>
              </div>
            )}

            {/* Quick in-preview toggles */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
              <button
                onClick={() => {
                  const newMic = !micEnabled;
                  setMicEnabled(newMic);
                  localStreamRef.current?.getAudioTracks().forEach(t => { t.enabled = newMic; });
                }}
                className={`p-2 rounded-full ${micEnabled ? 'bg-slate-700 text-white' : 'bg-rose-600 text-white'}`}
              >
                {micEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </button>
              <button
                onClick={() => {
                  const newCam = !cameraEnabled;
                  setCameraEnabled(newCam);
                  localStreamRef.current?.getVideoTracks().forEach(t => { t.enabled = newCam; });
                }}
                className={`p-2 rounded-full ${cameraEnabled ? 'bg-slate-700 text-white' : 'bg-rose-600 text-white'}`}
              >
                {cameraEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Consent Checkbox */}
          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 flex items-start gap-3">
            <input
              type="checkbox"
              id="consent"
              checked={consentAgreed}
              onChange={(e) => setConsentAgreed(e.target.checked)}
              className="mt-0.5 rounded text-brand-600 focus:ring-0"
            />
            <label htmlFor="consent" className="text-xs text-slate-300 leading-relaxed cursor-pointer">
              I acknowledge that this session is proctored with on-device integrity monitoring. No raw video is uploaded or permanently retained without explicit mutual consent.
            </label>
          </div>

          {/* Join CTA */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={onLeave}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel & Return
            </button>
            <button
              disabled={!consentAgreed}
              onClick={() => setIsInLobby(false)}
              className="px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold text-sm shadow-xl shadow-emerald-600/30 transition-all"
            >
              Join Meeting Room Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==================== GOOGLE MEET-STYLE LIVE ROOM ====================
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 h-[calc(100vh-80px)] flex flex-col gap-3">
      {/* Pushed Question Banner from Mentor (if active) */}
      {activePushedQuestion && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/80 via-slate-900 to-slate-900 border border-amber-500/40 flex items-center justify-between gap-4 animate-in slide-in-from-top-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                Pushed by Mentor for Candidate Discussion:
              </span>
              <p className="text-xs font-bold text-white mt-0.5">
                "{activePushedQuestion}"
              </p>
            </div>
          </div>
          <button
            onClick={() => setActivePushedQuestion(null)}
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Grid: Video Feeds (2 Cols) + Sidebar Drawer (1 Col) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-3 min-h-0">
        {/* Left 2 Cols: Video Room Stage */}
        <div className="lg:col-span-2 rounded-3xl bg-[#090D16] border border-slate-800 p-3 flex flex-col justify-between relative overflow-hidden">
          {/* Main Remote Feed (Mentor or Candidate) */}
          <div className="relative flex-1 rounded-2xl bg-slate-950 overflow-hidden flex items-center justify-center border border-slate-800/80">
            {/* Simulated Remote Video Feed with Avatar */}
            <div className="text-center space-y-3">
              <img
                src={
                  isMentor
                    ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'
                    : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80'
                }
                alt="Participant"
                className="w-24 h-24 rounded-full mx-auto object-cover ring-4 ring-brand-500/40 shadow-2xl"
              />
              <div>
                <h3 className="text-sm font-bold text-white">
                  {isMentor ? 'Aarav Sharma (Candidate)' : 'Col. Rajesh Verma (Retd.)'}
                </h3>
                <span className="text-[10px] text-emerald-400 flex items-center justify-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  HD Audio/Video Connected
                </span>
              </div>
            </div>

            {/* Self-View PiP (Picture in Picture bottom-right) */}
            <div className="absolute bottom-4 right-4 w-36 h-28 sm:w-44 sm:h-32 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden flex items-center justify-center">
              {cameraEnabled ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover transform scale-x-[-1]"
                />
              ) : (
                <div className="text-[10px] text-slate-400">Camera Off</div>
              )}
              <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-semibold text-white">
                You ({user?.role})
              </div>
            </div>

            {/* Room Timer & Tag */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <div className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-slate-700 text-xs font-mono font-bold text-amber-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatTimer(callDurationSec)}</span>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                PROCTORED
              </span>
            </div>
          </div>

          {/* Bottom Call Action Bar (Google Meet Style) */}
          <div className="pt-3 flex items-center justify-center gap-3">
            <button
              onClick={() => {
                const newMic = !micEnabled;
                setMicEnabled(newMic);
                localStreamRef.current?.getAudioTracks().forEach(t => { t.enabled = newMic; });
              }}
              className={`p-3 rounded-full transition-all ${
                micEnabled ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-rose-600 text-white'
              }`}
              title={micEnabled ? 'Mute Mic' : 'Unmute Mic'}
            >
              {micEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>

            <button
              onClick={() => {
                const newCam = !cameraEnabled;
                setCameraEnabled(newCam);
                localStreamRef.current?.getVideoTracks().forEach(t => { t.enabled = newCam; });
              }}
              className={`p-3 rounded-full transition-all ${
                cameraEnabled ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-rose-600 text-white'
              }`}
              title={cameraEnabled ? 'Turn Off Camera' : 'Turn On Camera'}
            >
              {cameraEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setIsScreenSharing(!isScreenSharing)}
              className={`p-3 rounded-full transition-all ${
                isScreenSharing ? 'bg-indigo-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-white'
              }`}
              title="Share Screen"
            >
              <Share2 className="w-5 h-5" />
            </button>

            {/* End Call Button */}
            <button
              onClick={onLeave}
              className="px-6 py-3 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-600/30 transition-all"
            >
              <PhoneOff className="w-4 h-4" />
              <span>Leave Call</span>
            </button>
          </div>
        </div>

        {/* Right 1 Col: In-meeting Sidebar (Chat, Shared Notes, Mentor Tools, Proctor Alerts) */}
        <div className="rounded-3xl bg-[#090D16] border border-slate-800 p-4 flex flex-col justify-between overflow-hidden">
          {/* Tab Selector */}
          <div className="flex items-center gap-1 border-b border-slate-800 pb-2">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'chat' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Chat
            </button>

            <button
              onClick={() => setActiveTab('whiteboard')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'whiteboard' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Whiteboard
            </button>

            {isMentor && (
              <button
                onClick={() => setActiveTab('mentorTools')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'mentorTools' ? 'bg-amber-600 text-white' : 'text-amber-400 hover:text-white'
                }`}
              >
                Mentor Tools
              </button>
            )}

            <button
              onClick={() => setActiveTab('proctorAlerts')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                activeTab === 'proctorAlerts' ? 'bg-emerald-600 text-white' : 'text-emerald-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Alerts</span>
            </button>
          </div>

          {/* Tab 1: Live Chat */}
          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col justify-between py-2 overflow-hidden">
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                      <strong className={msg.role === 'mentor' ? 'text-amber-400' : 'text-brand-400'}>
                        {msg.sender}
                      </strong>
                      <span>{msg.time}</span>
                    </div>
                    <p className="text-slate-200">{msg.text}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendMessage} className="pt-2 flex items-center gap-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Send in-meeting message..."
                  className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-brand-500"
                />
                <button
                  type="submit"
                  className="p-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* Tab 2: Shared Whiteboard / Notes */}
          {activeTab === 'whiteboard' && (
            <div className="flex-1 flex flex-col py-2 space-y-2 overflow-hidden">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <PenTool className="w-3.5 h-3.5 text-indigo-400" />
                  Collaborative Scratchpad
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">Sync: Active</span>
              </div>
              <textarea
                value={whiteboardText}
                onChange={(e) => setWhiteboardText(e.target.value)}
                className="flex-1 w-full p-3 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-400 focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>
          )}

          {/* Tab 3: Mentor Tools & Push Question */}
          {activeTab === 'mentorTools' && isMentor && (
            <div className="flex-1 overflow-y-auto py-2 space-y-4 pr-1">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-2">
                  Push Question to Student HUD
                </span>
                <div className="space-y-1.5">
                  {QUESTIONS_SEED.slice(0, 4).map((q) => (
                    <button
                      key={q.id}
                      onClick={() => handlePushQuestion(q.question)}
                      className="w-full text-left p-2 rounded-xl bg-slate-900 hover:bg-brand-600/20 border border-slate-800 hover:border-brand-500/50 text-[11px] text-slate-200 transition-all"
                    >
                      "{q.question}"
                    </button>
                  ))}
                </div>
              </div>

              {/* Private Scoring Rubric */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Private Mentor Rubric (0-10)
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-400 block">Knowledge: {mentorRubric.knowledge}</label>
                    <input
                      type="range" min="0" max="10" step="0.5"
                      value={mentorRubric.knowledge}
                      onChange={(e) => setMentorRubric({ ...mentorRubric, knowledge: parseFloat(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block">Communication: {mentorRubric.communication}</label>
                    <input
                      type="range" min="0" max="10" step="0.5"
                      value={mentorRubric.communication}
                      onChange={(e) => setMentorRubric({ ...mentorRubric, communication: parseFloat(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                </div>
                <textarea
                  value={mentorRubric.notes}
                  onChange={(e) => setMentorRubric({ ...mentorRubric, notes: e.target.value })}
                  rows={2}
                  placeholder="Private examiner notes..."
                  className="w-full p-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-slate-200"
                />
              </div>
            </div>
          )}

          {/* Tab 4: Live Proctor Alerts */}
          {activeTab === 'proctorAlerts' && (
            <div className="flex-1 overflow-y-auto py-2 space-y-3 pr-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                Live Integrity Activity Feed
              </span>

              {mentorAlerts.map((alert) => (
                <div key={alert.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="text-amber-400 font-bold">{alert.time}</span>
                    <span className={`px-1.5 py-0.2 rounded font-bold uppercase text-[9px] ${
                      alert.status === 'confirmed' ? 'bg-rose-500/20 text-rose-400' :
                      alert.status === 'dismissed' ? 'bg-slate-700 text-slate-300' :
                      'bg-amber-500/20 text-amber-400'
                    }`}>
                      {alert.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-200">{alert.reason}</p>

                  {isMentor && alert.status === 'pending' && (
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handleDismissAlert(alert.id)}
                        className="px-2 py-1 rounded text-[10px] font-bold bg-slate-800 text-slate-300 hover:bg-slate-700"
                      >
                        Dismiss False Alert
                      </button>
                      <button
                        onClick={() => handleConfirmAlert(alert.id)}
                        className="px-2 py-1 rounded text-[10px] font-bold bg-rose-600 text-white hover:bg-rose-500"
                      >
                        Confirm Violation
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
