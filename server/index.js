import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  isSupabaseConfigured,
  getBookingsFromDb,
  insertBookingToDb,
  logProctorEventToDb,
  saveInterviewSessionToDb
} from './supabase.js';
import { evaluateAnswer } from './evaluateAnswer.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const PORT = process.env.PORT || 5000;

// In-memory data stores for the demo
let bookings = [
  {
    id: 'book_101',
    mentorId: 'mentor-1',
    mentorName: 'Col. Rajesh Verma (Retd.)',
    mentorTitle: 'Ex-Senior Interviewing Officer (19 SSB Allahabad)',
    mentorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    studentId: 'usr_student_01',
    studentName: 'Aarav Sharma',
    streamId: 'upsc_nda',
    date: 'Today',
    timeSlot: 'Live Now (Demo Ready)',
    status: 'upcoming',
    meetingRoomId: 'room_ssb_verma_99',
    isProctored: true,
    notes: 'Focus on SSB Personal Interview and handling DAF Hometown questions.'
  },
  {
    id: 'book_102',
    mentorId: 'mentor-3',
    mentorName: 'Vikramaditya Roy',
    mentorTitle: 'Staff Software Engineer @ Google',
    mentorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    studentId: 'usr_student_01',
    studentName: 'Aarav Sharma',
    streamId: 'cse',
    date: 'Tomorrow',
    timeSlot: '02:00 PM - 02:45 PM',
    status: 'upcoming',
    meetingRoomId: 'room_cse_google_42',
    isProctored: true,
    notes: 'Distributed System Design and concurrency optimizations.'
  }
];

let integrityLogs = [];
let pendingAppeals = [];

// Health Check & Supabase Status
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    appName: 'Prep Pilot',
    tagline: 'Speak. Practice. Succeed.',
    version: '1.0.0',
    supabaseConnected: isSupabaseConfigured,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/supabase/status', (req, res) => {
  res.json({
    configured: isSupabaseConfigured,
    supabaseUrl: process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || null,
    hasKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY),
    mode: isSupabaseConfigured ? 'live_supabase' : 'in_memory_simulator'
  });
});

// Bookings (Supabase synced with in-memory fallback)
app.get('/api/bookings', async (req, res) => {
  try {
    const list = await getBookingsFromDb(bookings);
    res.json({ bookings: list });
  } catch (e) {
    res.json({ bookings });
  }
});

app.post('/api/bookings', async (req, res) => {
  const newBooking = {
    ...req.body,
    id: req.body?.id || 'book_' + Date.now(),
    status: 'upcoming',
    meetingRoomId: req.body?.meetingRoomId || 'room_' + Math.random().toString(36).substring(2, 9),
  };
  bookings.unshift(newBooking);

  // Sync to Supabase in background
  try {
    await insertBookingToDb(newBooking);
  } catch (err) {
    console.warn('Could not sync booking to Supabase:', err.message);
  }

  res.status(201).json({ success: true, booking: newBooking });
});

// Proctoring event logging (Supabase + WebRTC Broadcast)
app.post('/api/proctor/event', async (req, res) => {
  const event = {
    id: 'evt_' + Date.now(),
    ...req.body,
    timestamp: new Date().toISOString()
  };
  integrityLogs.unshift(event);
  if (integrityLogs.length > 500) integrityLogs.pop();
  
  // Persist to Supabase
  try {
    await logProctorEventToDb(event);
  } catch (e) {}

  // Broadcast alert to active mentor room if applicable
  if (event.roomId) {
    io.to(event.roomId).emit('proctor-alert', event);
  }
  
  res.json({ success: true, event });
});

app.get('/api/proctor/logs', (req, res) => {
  res.json({ logs: integrityLogs });
});

// Save complete interview session & turns
app.post('/api/interview/save', async (req, res) => {
  const { session, turns } = req.body;
  if (!session) {
    return res.status(400).json({ error: 'Missing session payload' });
  }

  const result = await saveInterviewSessionToDb({ session, turns });
  res.json({ success: true, syncedToSupabase: !!result, data: result });
});

// AI Question Generator Endpoint
app.post('/api/questions/generate', (req, res) => {
  const { streamId, topic, difficulty = 'Medium', role = 'General' } = req.body;

  // Generate dynamic contextual questions
  const generatedQuestion = {
    id: 'gen_' + Date.now(),
    streamId: streamId || 'cse',
    category: topic || 'Domain Competency',
    difficulty,
    frequency: 'Common',
    question: `In the context of ${topic || 'your specialization'}, explain how you approach trade-offs between performance, scalability, and maintainability. Give a concrete example from your recent work.`,
    idealOutline: [
      'Define the trade-off envelope clearly (CAP theorem, time vs memory, latency vs consistency).',
      'Walk through a practical scenario showing how you measured bottlenecks.',
      'Explain the metrics and instrumentation used to validate the chosen design.'
    ],
    keyPoints: [
      'Articulate clear engineering or policy judgment.',
      'Show awareness of edge-cases and rollback plans.',
      'Highlight communication with cross-functional stakeholders.'
    ],
    commonMistakes: [
      'Providing an abstract textbook definition without any personal or real-world example.',
      'Claiming a chosen architecture has zero downsides.'
    ],
    sampleAnswer: `When addressing trade-offs in ${topic || 'high-scale systems'}, I prioritize business constraints first. For example, during our last architecture overhaul, we chose eventual consistency over strong consistency to achieve 99.99% read uptime and sub-20ms latencies, mitigating edge cases using idempotent queues and reconcilers.`
  };

  res.json({ success: true, question: generatedQuestion });
});

// ============================================================================
// AI INTERVIEW EVALUATION ENDPOINT — Quality rubric (key points + sample)
// ============================================================================
app.post('/api/interview/evaluate', (req, res) => {
  const evaluation = evaluateAnswer(req.body || {});
  res.json({ success: true, evaluation });
});


// Socket.IO Real-Time WebRTC & Room Signaling
io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on('join-room', ({ roomId, role, userName }) => {
    socket.join(roomId);
    socket.to(roomId).emit('user-joined', { socketId: socket.id, role, userName });
    console.log(`User ${userName} (${role}) joined room ${roomId}`);
  });

  socket.on('signal', ({ roomId, signalData, targetId }) => {
    if (targetId) {
      io.to(targetId).emit('signal', { senderId: socket.id, signalData });
    } else {
      socket.to(roomId).emit('signal', { senderId: socket.id, signalData });
    }
  });

  socket.on('chat-message', ({ roomId, message, senderName, role, time }) => {
    io.to(roomId).emit('chat-message', {
      id: 'msg_' + Date.now(),
      message,
      senderName,
      role,
      time: time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  });

  socket.on('push-question', ({ roomId, question }) => {
    io.to(roomId).emit('push-question', question);
  });

  socket.on('whiteboard-draw', ({ roomId, drawData }) => {
    socket.to(roomId).emit('whiteboard-draw', drawData);
  });

  socket.on('proctor-alert', ({ roomId, alert }) => {
    io.to(roomId).emit('proctor-alert', alert);
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Serve built frontend assets if dist exists
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
    return next();
  }
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) next();
  });
});

server.listen(PORT, () => {
  console.log(`Prep Pilot Full-Stack Server running on port ${PORT}`);
});
