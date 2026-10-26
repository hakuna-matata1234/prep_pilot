import React, { useState, useEffect } from 'react';
import { QUESTIONS_SEED } from '../data/questionsData';
import { STREAMS_DATA } from '../data/streamsData';
import { QuestionItem, StreamId } from '../types';
import { useAuth } from '../context/AuthContext';
import { 
  fetchQuestionsFromSupabase, 
  toggleQuestionBookmarkInSupabase, 
  fetchUserBookmarkedQuestionIds 
} from '../lib/supabase';
import { 
  Search, 
  Filter, 
  Bookmark, 
  BookmarkCheck, 
  CheckCircle, 
  Mic, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  BookOpen, 
  Code2, 
  AlertTriangle,
  Lightbulb,
  Clock,
  Send,
  Loader2,
  Database
} from 'lucide-react';

interface QuestionBankProps {
  onPracticeByVoice: (question: QuestionItem) => void;
  onNavigate: (view: string, param?: any) => void;
}

export const QuestionBank: React.FC<QuestionBankProps> = ({
  onPracticeByVoice,
  onNavigate
}) => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<QuestionItem[]>(QUESTIONS_SEED);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStream, setSelectedStream] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedFrequency, setSelectedFrequency] = useState<string>('all');
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);
  const [bookmarks, setBookmarks] = useState<Record<string, boolean>>({});
  const [practiced, setPracticed] = useState<Record<string, boolean>>({});

  // Load questions and user bookmarks from Supabase
  useEffect(() => {
    async function loadSupabaseData() {
      try {
        const dbQuestions = await fetchQuestionsFromSupabase();
        if (dbQuestions && dbQuestions.length > 0) {
          // Merge unique questions
          const existingIds = new Set(dbQuestions.map(q => q.id));
          const merged = [...dbQuestions, ...QUESTIONS_SEED.filter(q => !existingIds.has(q.id))];
          setQuestions(merged);
        }

        if (user?.id) {
          const userBookmarkIds = await fetchUserBookmarkedQuestionIds(user.id);
          const map: Record<string, boolean> = {};
          userBookmarkIds.forEach(id => { map[id] = true; });
          setBookmarks(map);
        }
      } catch (e) {
        console.warn('QuestionBank Supabase load notice:', e);
      }
    }
    loadSupabaseData();
  }, [user?.id]);

  // AI Generate modal
  const [isGenerating, setIsGenerating] = useState(false);
  const [customTopic, setCustomTopic] = useState('');
  const [generateStream, setGenerateStream] = useState<StreamId>('cse');
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  // Timed MCQ Challenge state
  const [activeTab, setActiveTab] = useState<'subjective' | 'mcq'>('subjective');
  const [mcqScore, setMcqScore] = useState<number | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});

  const toggleBookmark = (id: string) => {
    const nextState = !bookmarks[id];
    setBookmarks(prev => ({ ...prev, [id]: nextState }));
    if (user?.id) {
      toggleQuestionBookmarkInSupabase(user.id, id, !nextState).catch(() => {});
    }
  };

  const togglePracticed = (id: string) => {
    setPracticed(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleGenerateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTopic.trim()) return;
    setIsGenerating(true);

    try {
      const response = await fetch('/api/questions/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          streamId: generateStream,
          topic: customTopic,
          difficulty: 'Medium'
        })
      });
      const data = await response.json();
      if (data.success && data.question) {
        setQuestions([data.question, ...questions]);
        setCustomTopic('');
        setShowGenerateModal(false);
      }
    } catch (err) {
      // Local client fallback
      const fallbackQ: QuestionItem = {
        id: 'gen_' + Date.now(),
        streamId: generateStream,
        category: customTopic,
        difficulty: 'Medium',
        frequency: 'Common',
        question: `How would you evaluate and optimize architecture or decision strategies regarding "${customTopic}" in high-consequence scenarios?`,
        idealOutline: [
          'State core theoretical foundations and industry best practices.',
          'Identify common trade-offs (scalability vs latency, public safety vs administrative speed).',
          'Conclude with measurable verification metrics.'
        ],
        keyPoints: ['Structured articulation', 'Risk mitigation', 'Evidence-based judgment'],
        commonMistakes: ['Relying purely on textbook theory without practical edge-cases.'],
        sampleAnswer: `When handling ${customTopic}, I establish baseline metrics first, isolate systemic failure modes, and apply iterative optimizations while maintaining clear rollback contingencies.`
      };
      setQuestions([fallbackQ, ...questions]);
      setCustomTopic('');
      setShowGenerateModal(false);
    } finally {
      setIsGenerating(false);
    }
  };

  // Filtered list
  const filtered = questions.filter(q => {
    const matchesStream = selectedStream === 'all' || q.streamId === selectedStream;
    const matchesDiff = selectedDifficulty === 'all' || q.difficulty === selectedDifficulty;
    const matchesFreq = selectedFrequency === 'all' || q.frequency === selectedFrequency;
    const matchesQuery = 
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStream && matchesDiff && matchesFreq && matchesQuery;
  });

  // Sample seed MCQs for the MCQ Challenge Tab
  const seedMcqs = [
    {
      q: 'Which database indexing structure stores all table data records exclusively in the leaf nodes and connects leaves with a linked list?',
      options: ['B-Tree', 'B+ Tree', 'Hash Index', 'LSM-Tree'],
      correct: 1,
      explanation: 'B+ Trees store row pointers and data exclusively in leaf nodes, linking them horizontally to allow fast sequential range queries.'
    },
    {
      q: 'Under the Indian Constitution, which Article empowers the Supreme Court to issue writs for the enforcement of Fundamental Rights?',
      options: ['Article 21', 'Article 32', 'Article 226', 'Article 300A'],
      correct: 1,
      explanation: 'Article 32 gives the Supreme Court the power to issue writs (Habeas Corpus, Mandamus, etc.) for enforcement of Fundamental Rights.'
    },
    {
      q: 'In bioclimatic architecture for composite Indian climates, which orientation is ideal for the longest facade of a building to minimize solar heat gain?',
      options: ['East-West', 'North-South', 'North-East', 'South-West'],
      correct: 1,
      explanation: 'Facing primary windows North and South minimizes harsh horizontal solar radiation while admitting manageable daylight.'
    }
  ];

  const handleMcqSelect = (qIdx: number, optIdx: number) => {
    setSelectedAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
  };

  const calculateMcqScore = () => {
    let score = 0;
    seedMcqs.forEach((mcq, idx) => {
      if (selectedAnswers[idx] === mcq.correct) score++;
    });
    setMcqScore(score);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner & Generation CTA */}
      <div className="rounded-3xl glass-panel p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-500/20 text-brand-400 border border-brand-500/30">
              Verified Syllabus Question Banks
            </span>
            <span className="text-xs text-slate-400">100+ Curated Challenges</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
            Interview Question Repository
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Explore commonly asked technical, architectural, and civil services inquiries with model answers and voice drill integrations.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setShowGenerateModal(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-brand-500/25 flex items-center gap-2 transition-all"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Generate Questions with AI</span>
          </button>
        </div>
      </div>

      {/* Tabs: Subjective Repository vs Timed MCQ Drill */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('subjective')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'subjective'
              ? 'bg-brand-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Spoken & Subjective Bank ({filtered.length})
        </button>
        <button
          onClick={() => setActiveTab('mcq')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'mcq'
              ? 'bg-brand-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Timed MCQ / Concept Drill (3 Questions)
        </button>
      </div>

      {activeTab === 'subjective' ? (
        <>
          {/* Search & Filter Bar */}
          <div className="rounded-2xl glass-panel p-4 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search questions by topic, algorithm, design pattern, or keywords..."
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs">
              {/* Stream filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 font-medium">Stream:</span>
                <select
                  value={selectedStream}
                  onChange={(e) => setSelectedStream(e.target.value)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-xs focus:outline-none"
                >
                  <option value="all">All Streams</option>
                  <option value="cse">CSE Tech</option>
                  <option value="architecture">Architecture</option>
                  <option value="upsc_nda">UPSC & NDA (SSB)</option>
                </select>
              </div>

              {/* Difficulty filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 font-medium">Difficulty:</span>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-xs focus:outline-none"
                >
                  <option value="all">All Difficulties</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              {/* Frequency filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 font-medium">Frequency:</span>
                <select
                  value={selectedFrequency}
                  onChange={(e) => setSelectedFrequency(e.target.value)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-xs focus:outline-none"
                >
                  <option value="all">All Frequencies</option>
                  <option value="Very common">Very common</option>
                  <option value="Common">Common</option>
                  <option value="Occasionally asked">Occasionally asked</option>
                </select>
              </div>

              <div className="ml-auto text-slate-400 text-[11px]">
                Showing {filtered.length} questions
              </div>
            </div>
          </div>

          {/* Questions Accordion List */}
          <div className="space-y-4">
            {filtered.map((q) => {
              const isExpanded = expandedQuestionId === q.id;
              const isSaved = bookmarks[q.id];
              const isDone = practiced[q.id];

              return (
                <div
                  key={q.id}
                  className={`rounded-2xl glass-panel border transition-all duration-200 overflow-hidden ${
                    isExpanded 
                      ? 'border-brand-500/50 bg-slate-900/95 shadow-xl' 
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Question Header Bar */}
                  <div className="p-5 flex items-start justify-between gap-4">
                    <div 
                      className="flex-1 cursor-pointer"
                      onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400">
                          {q.category}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          q.difficulty === 'Easy' ? 'bg-emerald-500/20 text-emerald-400' :
                          q.difficulty === 'Medium' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-rose-500/20 text-rose-400'
                        }`}>
                          {q.difficulty}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          {q.frequency}
                        </span>
                        {isDone && (
                          <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Practiced
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
                        {q.question}
                      </h3>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => toggleBookmark(q.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          isSaved ? 'text-amber-400 bg-amber-500/10' : 'text-slate-400 hover:text-white'
                        }`}
                        title={isSaved ? 'Bookmarked' : 'Bookmark question'}
                      >
                        {isSaved ? <BookmarkCheck className="w-4 h-4 fill-amber-400" /> : <Bookmark className="w-4 h-4" />}
                      </button>

                      <button
                        onClick={() => onPracticeByVoice(q)}
                        className="px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-brand-500/20 transition-all"
                      >
                        <Mic className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Practice by Voice</span>
                      </button>

                      <button
                        onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details: Ideal Outline, Key Points, Traps, Sample Answer */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-2 border-t border-slate-800 space-y-4 animate-in slide-in-from-top-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Ideal Outline */}
                        <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
                          <h4 className="text-xs font-bold text-brand-400 flex items-center gap-1.5">
                            <Lightbulb className="w-4 h-4" />
                            <span>Ideal Answer Outline (STAR / Systematic)</span>
                          </h4>
                          <ul className="space-y-1.5 text-xs text-slate-300">
                            {q.idealOutline.map((item, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-brand-400 font-bold shrink-0">{idx + 1}.</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Common Mistakes */}
                        <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/20 space-y-2">
                          <h4 className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                            <AlertTriangle className="w-4 h-4" />
                            <span>Common Mistakes & Traps</span>
                          </h4>
                          <ul className="space-y-1.5 text-xs text-slate-300">
                            {q.commonMistakes.map((mistake, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-rose-400 font-bold">•</span>
                                <span>{mistake}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Model Sample Answer */}
                      <div className="p-4 rounded-xl bg-slate-900 border border-slate-700/80">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                            Sample Model Answer (Spoken Benchmark)
                          </span>
                          <button
                            onClick={() => togglePracticed(q.id)}
                            className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>{isDone ? 'Marked as Practiced' : 'Mark as Practiced'}</span>
                          </button>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed font-sans italic bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                          "{q.sampleAnswer}"
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      ) : (
        /* Timed MCQ Challenge Section */
        <div className="rounded-2xl glass-panel p-6 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Timed Concept Check (Objective Test)</h3>
              <p className="text-xs text-slate-400">Quick conceptual verification to supplement your verbal mock practice.</p>
            </div>
            {mcqScore !== null && (
              <div className="px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold text-sm">
                Score: {mcqScore} / {seedMcqs.length} Correct
              </div>
            )}
          </div>

          <div className="space-y-6">
            {seedMcqs.map((mcq, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <p className="text-sm font-semibold text-white">
                  {idx + 1}. {mcq.q}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {mcq.options.map((opt, optIdx) => {
                    const isSelected = selectedAnswers[idx] === optIdx;
                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleMcqSelect(idx, optIdx)}
                        className={`p-2.5 rounded-xl text-xs text-left border transition-all ${
                          isSelected
                            ? 'bg-brand-600 text-white border-brand-500 font-bold'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                        }`}
                      >
                        <span className="font-mono mr-2">{String.fromCharCode(65 + optIdx)}.</span>
                        {opt}
                      </button>
                    );
                  })}
                </div>

                {mcqScore !== null && (
                  <div className="p-2.5 rounded-lg bg-slate-800/80 text-[11px] text-slate-300 border border-slate-700">
                    <strong className="text-amber-400">Explanation: </strong> {mcq.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-800">
            <button
              onClick={calculateMcqScore}
              className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md transition-all"
            >
              Submit & Verify Answers
            </button>
          </div>
        </div>
      )}

      {/* AI Generate Question Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl glass-panel bg-slate-900 border border-brand-500/40 p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Generate Custom Questions with AI</span>
            </h3>
            <p className="text-xs text-slate-400">
              Input any niche topic, algorithm, design challenge, or exam paper topic to instantly seed new questions.
            </p>

            <form onSubmit={handleGenerateQuestion} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Target Stream
                </label>
                <select
                  value={generateStream}
                  onChange={(e) => setGenerateStream(e.target.value as StreamId)}
                  className="w-full p-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none"
                >
                  <option value="cse">CSE & Software Engineering</option>
                  <option value="architecture">Architecture & Spatial Design</option>
                  <option value="upsc_nda">UPSC Civil Services & NDA (SSB)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Topic or Technology Keyword
                </label>
                <input
                  type="text"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  placeholder="e.g. Raft Consensus, Vernacular Adobe Bricks, or Article 356"
                  className="w-full p-2.5 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-brand-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
                >
                  {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>Generate Question</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
