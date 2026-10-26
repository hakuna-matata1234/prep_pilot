import React, { useState, useEffect } from 'react';
import { MENTORS_SEED } from '../data/mentorsData';
import { MentorProfile, StreamId, BookingItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { fetchMentorsFromSupabase } from '../lib/supabase';
import { 
  Star, 
  Video, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Award, 
  Languages, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles,
  Download,
  X,
  Database
} from 'lucide-react';

interface MentorBrowseAndBookProps {
  onJoinMeetingRoom: (roomId: string) => void;
}

export const MentorBrowseAndBook: React.FC<MentorBrowseAndBookProps> = ({
  onJoinMeetingRoom
}) => {
  const { user } = useAuth();
  const [mentors, setMentors] = useState<MentorProfile[]>(MENTORS_SEED);
  const [selectedStream, setSelectedStream] = useState<string>('all');
  const [activeBookingMentor, setActiveBookingMentor] = useState<MentorProfile | null>(null);
  const [selectedDate, setSelectedDate] = useState('Today (Instant Demo Call)');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookedRoomId, setBookedRoomId] = useState('');
  const [isBookingSubmitting, setIsBookingSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Load mentors from Supabase
  useEffect(() => {
    async function loadMentors() {
      try {
        const dbMentors = await fetchMentorsFromSupabase();
        if (dbMentors && dbMentors.length > 0) {
          setMentors(dbMentors);
        }
      } catch (e) {}
    }
    loadMentors();
  }, []);

  const filtered = mentors.filter(m => {
    return selectedStream === 'all' || m.streamId === selectedStream;
  });

  const handleOpenBooking = (mentor: MentorProfile) => {
    setActiveBookingMentor(mentor);
    setSelectedSlot(mentor.slots[0]);
    setBookingSuccess(false);
    setBookingError(null);
  };

  const handleConfirmBooking = async () => {
    if (!activeBookingMentor || isBookingSubmitting) return;
    setIsBookingSubmitting(true);
    setBookingError(null);

    const newBooking: BookingItem = {
      id: 'book_' + Date.now(),
      mentorId: activeBookingMentor.id,
      mentorName: activeBookingMentor.name,
      mentorTitle: activeBookingMentor.title,
      mentorAvatar: activeBookingMentor.avatar,
      studentId: user?.id || 'usr_student_01',
      studentName: user?.name || 'Aarav Sharma',
      streamId: activeBookingMentor.streamId,
      date: selectedDate,
      timeSlot: selectedSlot || activeBookingMentor.slots[0] || '10:00 AM - 10:45 AM',
      status: 'upcoming',
      meetingRoomId: 'room_' + activeBookingMentor.id + '_' + Math.random().toString(36).substring(2, 7),
      isProctored: true,
      notes: `Prep Pilot 1:1 Live Practice Session for ${activeBookingMentor.streamId.toUpperCase()}`
    };

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBooking)
      });
      const data = await response.json();
      if (!response.ok || !data.success || !data.booking?.meetingRoomId) {
        throw new Error(data.error || 'The booking service could not confirm this session.');
      }
      setBookedRoomId(data.booking.meetingRoomId);
      setBookingSuccess(true);
    } catch (error) {
      setBookingError(error instanceof Error ? error.message : 'Could not connect to the booking service. Please try again.');
    } finally {
      setIsBookingSubmitting(false);
    }
  };

  // Generate and download .ics calendar invite
  const downloadICS = () => {
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Prep Pilot//1:1 Mentor Interview//EN
BEGIN:VEVENT
SUMMARY:1:1 Mock Interview with ${activeBookingMentor?.name} (${activeBookingMentor?.organization})
DESCRIPTION:Prep Pilot Proctored 1:1 Video Mock Interview. Room: ${bookedRoomId}
LOCATION:Prep Pilot Video Room (${window.location.origin})
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PrepPilot_Session_${activeBookingMentor?.name.replace(/\s+/g, '_')}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="rounded-3xl glass-panel p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-brand-950/40 to-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
              Vetted Veteran Examiners
            </span>
            <span className="text-xs text-slate-400">Google Meet-Style 1:1 Video Mock Interviews</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
            Book Live Expert Mentors
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Practice 1-on-1 with retired Armed Forces Interviewing Officers, ex-UPSC board members, and FAANG staff engineers.
          </p>
        </div>

        {/* Stream Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {[
            { id: 'all', label: 'All Mentors' },
            { id: 'upsc_nda', label: 'UPSC & NDA (SSB)' },
            { id: 'cse', label: 'CSE Tech' },
            { id: 'architecture', label: 'Architecture' }
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setSelectedStream(st.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                selectedStream === st.id
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mentor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((mentor) => (
          <div
            key={mentor.id}
            className="rounded-3xl glass-panel p-6 border border-slate-200 dark:border-slate-800 hover:border-brand-500/50 transition-all flex flex-col justify-between group shadow-xl"
          >
            <div>
              <div className="flex items-start gap-4 mb-4">
                <img
                  src={mentor.avatar}
                  alt={mentor.name}
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-brand-500/40 shadow-lg group-hover:ring-brand-500 transition-all"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-brand-400 transition-colors">
                      {mentor.name}
                    </h3>
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-400 shrink-0">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{mentor.rating}</span>
                      <span className="text-[10px] text-slate-400">({mentor.reviewsCount})</span>
                    </div>
                  </div>

                  <p className="text-xs font-medium text-slate-400 mt-0.5">
                    {mentor.title}
                  </p>
                  <p className="text-[11px] text-brand-400 font-semibold mt-0.5">
                    {mentor.organization} • {mentor.experienceYears} Years Exp.
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                {mentor.bio}
              </p>

              {/* Languages & Slots preview */}
              <div className="space-y-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Languages className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                  <span>Languages: <strong className="text-slate-200">{mentor.languages.join(', ')}</strong></span>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Available: <strong className="text-slate-200">{mentor.availableDays.join(', ')}</strong></span>
                </div>
              </div>
            </div>

            {/* Action Footer */}
            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Fee</span>
                <span className="text-xs font-bold text-emerald-400">{mentor.pricePerSession}</span>
              </div>

              <button
                onClick={() => handleOpenBooking(mentor)}
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md shadow-brand-500/25 flex items-center gap-1.5 transition-all"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Book 1:1 Video Slot</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Booking Modal */}
      {activeBookingMentor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl glass-panel bg-slate-900 border border-brand-500/40 p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setActiveBookingMentor(null)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {!bookingSuccess ? (
              <>
                <div className="flex items-center gap-3">
                  <img
                    src={activeBookingMentor.avatar}
                    alt={activeBookingMentor.name}
                    className="w-12 h-12 rounded-xl object-cover ring-2 ring-brand-500"
                  />
                  <div>
                    <h3 className="text-base font-bold text-white">{activeBookingMentor.name}</h3>
                    <p className="text-xs text-slate-400">{activeBookingMentor.title}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Select Date */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      1. Select Interview Date
                    </label>
                    <select
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full p-2.5 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-brand-500"
                    >
                      <option value="Today (Instant Demo Call)">Today (Instant Demo Call)</option>
                      <option value="Tomorrow">Tomorrow</option>
                      <option value="This Saturday">This Saturday</option>
                      <option value="This Sunday">This Sunday</option>
                    </select>
                  </div>

                  {/* Select Slot */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      2. Choose Time Slot (Asia/Kolkata IST)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {activeBookingMentor.slots.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          className={`p-2.5 rounded-xl text-xs font-semibold border transition-all text-left ${
                            selectedSlot === slot
                              ? 'bg-brand-600 text-white border-brand-500 shadow-md'
                              : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Proctored mode notice */}
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>Includes live mentor integrity dashboard with 3-warning enforcement.</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-semibold">Demo Pass: Free</span>
                  <button
                    onClick={handleConfirmBooking}
                    disabled={isBookingSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all"
                  >
                    {isBookingSubmitting ? 'Confirming...' : 'Confirm & Generate Meeting Room'}
                  </button>
                </div>
                {bookingError && (
                  <p role="alert" className="text-xs text-rose-400">{bookingError}</p>
                )}
              </>
            ) : (
              /* Booking Success Confirmation */
              <div className="text-center py-4 space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-extrabold text-white">
                  1:1 Session Confirmed!
                </h3>
                <p className="text-xs text-slate-300 max-w-sm mx-auto">
                  Your meeting with <strong className="text-white">{activeBookingMentor.name}</strong> is booked for <strong className="text-amber-400">{selectedDate} ({selectedSlot})</strong>.
                </p>

                <div className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono text-emerald-400">
                  Unique Room ID: {bookedRoomId}
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={downloadICS}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-4 h-4" />
                    <span>Add to Calendar (.ics)</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveBookingMentor(null);
                      onJoinMeetingRoom(bookedRoomId);
                    }}
                    className="w-full sm:w-auto px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-1.5"
                  >
                    <Video className="w-4 h-4" />
                    <span>Enter Live Meeting Now</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
