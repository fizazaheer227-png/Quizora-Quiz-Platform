import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Plus,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  Edit3,
  CheckCircle2,
  Clock,
  Shuffle,
  Eye,
  RotateCcw,
  BookOpen,
  UploadCloud,
  Loader2,
  AlertCircle,
  HelpCircle,
  Share2,
  Check,
  Play,
  Layers,
} from 'lucide-react';
import {
  HostedQuestion,
  HostedQuiz,
  HostedQuizSettings,
  UserProfile,
} from '../types/quiz.ts';
import { generateUniqueQuizCode, saveStoredHostedQuiz } from '../utils/storage.ts';

interface CreateQuizViewProps {
  profile: UserProfile;
  editingQuiz?: HostedQuiz | null;
  onQuizPublished: (quiz: HostedQuiz) => void;
  onCancel: () => void;
}

type CreatorMethod = 'manual' | 'ai';

const SUBJECT_OPTIONS = [
  'Computer Science',
  'Biology & Life Sciences',
  'Physics',
  'Chemistry',
  'Mathematics',
  'History & Social Studies',
  'Business & Economics',
  'General Education',
];

const SAMPLE_TEACHING_NOTES = `Lecture Chapter 4: Data Communication and Computer Networks
1. OSI Reference Model:
The Open Systems Interconnection (OSI) model conceptualizes network communication in 7 layers:
Physical, Data Link, Network, Transport, Session, Presentation, Application.
The Network Layer (Layer 3) handles packet routing and logical IP addressing using routers.
The Transport Layer (Layer 4) provides host-to-host communication, segmentation, error recovery, and flow control. Protocols include TCP and UDP.

2. TCP vs UDP Protocol Differences:
Transmission Control Protocol (TCP) is connection-oriented, requiring a 3-way handshake (SYN, SYN-ACK, ACK). It guarantees reliable, ordered packet delivery with checksum verification.
User Datagram Protocol (UDP) is connectionless and best-effort with no delivery guarantees, making it suitable for low-latency voice, DNS lookups, and video streaming.

3. IP Addressing and Subnetting:
IPv4 addresses are 32-bit numerical labels expressed in dot-decimal notation, providing approximately 4.3 billion addresses.
IPv6 addresses are 128-bit hexadecimal labels created to overcome IPv4 address exhaustion.
A Subnet Mask divides an IP address into a Network prefix and a Host identifier.`;

export const CreateQuizView: React.FC<CreateQuizViewProps> = ({
  profile,
  editingQuiz,
  onQuizPublished,
  onCancel,
}) => {
  // Step navigation
  const [creationMethod, setCreationMethod] = useState<CreatorMethod>('manual');

  // Quiz Meta
  const [title, setTitle] = useState(editingQuiz?.title || '');
  const [description, setDescription] = useState(editingQuiz?.description || '');
  const [subject, setSubject] = useState(editingQuiz?.subject || 'Computer Science');
  const [instructions, setInstructions] = useState(
    editingQuiz?.instructions ||
      'Please read each question carefully and select the best answer. Answer all questions before submitting.'
  );

  // Questions List
  const [questions, setQuestions] = useState<HostedQuestion[]>(
    editingQuiz?.questions || [
      {
        id: `q-${Date.now()}-1`,
        question: 'What is the primary function of the Network Layer (Layer 3) in the OSI model?',
        type: 'multiple_choice',
        options: [
          'Packet routing and logical IP addressing',
          'Physical cable voltage modulation',
          'Application data encryption and presentation',
          'Process-to-process session synchronization',
        ],
        correctAnswerIndex: 0,
        points: 10,
        explanation: 'The Network layer routes packets across intermediate networks using IP addresses.',
        topic: 'Network Layer',
      },
    ]
  );

  // Active question being edited in manual mode
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);

  // Settings
  const [settings, setSettings] = useState<HostedQuizSettings>(
    editingQuiz?.settings || {
      timeLimitMinutes: 15,
      shuffleQuestions: false,
      shuffleAnswers: false,
      showResultsImmediately: true,
      allowMultipleAttempts: false,
      passingScorePercent: 60,
      enableLeaderboard: true,
    }
  );

  // AI Generator state
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiNotesText, setAiNotesText] = useState('');
  const [aiQuestionCount, setAiQuestionCount] = useState<number>(5);
  const [aiDifficulty, setAiDifficulty] = useState<string>('medium');
  const [aiQuestionType, setAiQuestionType] = useState<string>('multiple_choice');
  const [aiUploadedFileName, setAiUploadedFileName] = useState('');

  // Publish success state
  const [publishedQuiz, setPublishedQuiz] = useState<HostedQuiz | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Question CRUD Handlers
  const handleAddQuestion = (type: 'multiple_choice' | 'true_false' = 'multiple_choice') => {
    const newQ: HostedQuestion = {
      id: `q-${Date.now()}-${questions.length + 1}`,
      question: type === 'multiple_choice' ? 'New multiple choice question prompt' : 'New True/False statement',
      type,
      options: type === 'multiple_choice' ? ['Option A', 'Option B', 'Option C', 'Option D'] : ['True', 'False'],
      correctAnswerIndex: 0,
      points: 10,
      explanation: '',
      topic: subject,
    };
    setQuestions([...questions, newQ]);
    setActiveQuestionIndex(questions.length);
  };

  const handleUpdateQuestion = (index: number, updated: Partial<HostedQuestion>) => {
    const copy = [...questions];
    copy[index] = { ...copy[index], ...updated };
    setQuestions(copy);
  };

  const handleDeleteQuestion = (index: number) => {
    if (questions.length <= 1) {
      alert('A quiz must contain at least 1 question.');
      return;
    }
    const filtered = questions.filter((_, idx) => idx !== index);
    setQuestions(filtered);
    setActiveQuestionIndex(Math.max(0, index - 1));
  };

  const handleDuplicateQuestion = (index: number) => {
    const target = questions[index];
    const duplicated: HostedQuestion = {
      ...target,
      id: `q-${Date.now()}-dup`,
      question: `${target.question} (Copy)`,
    };
    const copy = [...questions];
    copy.splice(index + 1, 0, duplicated);
    setQuestions(copy);
    setActiveQuestionIndex(index + 1);
  };

  const handleMoveQuestion = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === questions.length - 1) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const copy = [...questions];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIndex, 0, moved);
    setQuestions(copy);
    setActiveQuestionIndex(targetIndex);
  };

  // AI File Upload and Question Generation
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    setAiUploadedFileName(file.name);
    setAiError('');

    try {
      const isText = file.type.startsWith('text/') || file.name.endsWith('.txt') || file.name.endsWith('.md');
      if (isText) {
        const text = await file.text();
        setAiNotesText(text);
        return;
      }

      // Convert PDF/Docx to base64 and extract
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const result = ev.target?.result as string;
        const base64 = result.split(',')[1] || result;
        const res = await fetch('/api/notes/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            base64,
            mimeType: file.type || 'application/pdf',
            fileName: file.name,
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed to extract text from document');
        }
        setAiNotesText(data.extractedText);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setAiError(err.message || 'File processing failed');
    }
  };

  const handleLoadSampleAi = () => {
    setAiUploadedFileName('Computer_Networks_Chapter4.txt');
    setAiNotesText(SAMPLE_TEACHING_NOTES);
    if (!title) setTitle('Computer Networks Midterm: OSI & TCP/IP');
    if (!description) setDescription('Assessment on Layer 3 routing, Layer 4 transport, and IPv4/IPv6 subnetting.');
  };

  const handleGenerateAiQuestions = async () => {
    if (!aiNotesText.trim()) {
      setAiError('Please upload teaching material or load sample notes first.');
      return;
    }
    setAiGenerating(true);
    setAiError('');

    try {
      const res = await fetch('/api/notes/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notesText: aiNotesText,
          difficulty: aiDifficulty,
          questionCount: aiQuestionCount,
          questionType: aiQuestionType,
          fileName: aiUploadedFileName || 'Teaching Material',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success || !data.questions) {
        throw new Error(data.error || 'AI generation failed. Please retry.');
      }

      const formatted: HostedQuestion[] = data.questions.map((q: any, i: number) => ({
        id: `ai-q-${Date.now()}-${i}`,
        question: q.question,
        type: q.type === 'true_false' ? 'true_false' : 'multiple_choice',
        options: q.options,
        correctAnswerIndex: q.correctAnswerIndex ?? 0,
        points: 10,
        explanation: q.explanation || '',
        topic: q.topic || subject,
      }));

      setQuestions(formatted);
      setActiveQuestionIndex(0);
      setCreationMethod('manual'); // Switch to Review Questions mode!
    } catch (err: any) {
      setAiError(err.message || 'Failed to draft questions with AI.');
    } finally {
      setAiGenerating(false);
    }
  };

  // Publish Quiz
  const handlePublishQuiz = () => {
    if (!title.trim()) {
      alert('Please provide a Quiz Title.');
      return;
    }
    if (questions.length === 0) {
      alert('Please add at least 1 question.');
      return;
    }

    const code = editingQuiz?.code || generateUniqueQuizCode();
    const totalMarks = questions.reduce((sum, q) => sum + (Number(q.points) || 10), 0);

    const newQuiz: HostedQuiz = {
      id: editingQuiz?.id || `quiz-hosted-${Date.now()}`,
      code,
      title: title.trim(),
      description: description.trim(),
      subject: subject.trim(),
      instructions: instructions.trim(),
      creatorName: profile.name,
      creatorUsername: profile.username,
      createdAt: editingQuiz?.createdAt || new Date().toISOString(),
      status: 'live',
      settings,
      questions,
      totalMarks,
    };

    saveStoredHostedQuiz(newQuiz);
    setPublishedQuiz(newQuiz);
  };

  const currentQ = questions[activeQuestionIndex] || questions[0];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-in fade-in duration-200">
      {/* SUCCESS MODAL AFTER PUBLISHING */}
      {publishedQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in zoom-in-95 duration-200">
          <div className="bg-[#111827] border border-indigo-500/40 rounded-3xl p-6 sm:p-10 max-w-lg w-full text-center shadow-2xl relative">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
              PUBLISHED SUCCESSFULLY
            </span>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white mt-1">
              Your quiz is live!
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-2">
              Share the unique code or invite link with your students.
            </p>

            {/* Quiz Code Big Badge */}
            <div className="my-6 p-5 rounded-2xl bg-slate-900 border border-indigo-500/30">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                Quiz Code
              </span>
              <div className="font-mono-tabular font-extrabold text-3xl sm:text-4xl text-indigo-400 tracking-wider mt-1 select-all">
                {publishedQuiz.code}
              </div>
            </div>

            {/* Buttons */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(publishedQuiz.code);
                  setCopiedCode(true);
                  setTimeout(() => setCopiedCode(false), 2000);
                }}
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedCode ? 'COPIED!' : 'COPY CODE'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const url = `${window.location.origin}?code=${publishedQuiz.code}`;
                  navigator.clipboard.writeText(url);
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2000);
                }}
                className="py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-600/30"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                <span>{copiedLink ? 'LINK COPIED!' : 'COPY INVITE LINK'}</span>
              </button>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => onQuizPublished(publishedQuiz)}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
              >
                View in My Quizzes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Form Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
            Faculty Assessment Studio
          </span>
          <h1 className="mt-1 font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            CREATE A QUIZ
          </h1>
          <p className="mt-1 text-slate-400 text-sm">
            Build a test, share it with your students, and track their performance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handlePublishQuiz}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-indigo-600/30 transition-all hover:-translate-y-0.5"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>PUBLISH QUIZ</span>
          </button>
        </div>
      </div>

      {/* Section 1: Quiz Details */}
      <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl mb-8 space-y-6">
        <h2 className="font-display font-bold text-lg text-white flex items-center gap-2">
          <span>1. Quiz Details</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Quiz Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. CS201: Data Structures Midterm Exam"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Subject
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              {SUBJECT_OPTIONS.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of test topics and target learning objectives"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Student Instructions
            </label>
            <input
              type="text"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g. Calculators allowed. Answer all questions."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Creation Method Switcher Tabs */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2 p-1 rounded-2xl bg-slate-900 border border-slate-800">
          <button
            type="button"
            onClick={() => setCreationMethod('manual')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              creationMethod === 'manual'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            <span>1. CREATE MANUALLY ({questions.length} Questions)</span>
          </button>

          <button
            type="button"
            onClick={() => setCreationMethod('ai')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              creationMethod === 'ai'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>2. GENERATE WITH AI</span>
          </button>
        </div>
      </div>

      {/* METHOD 2: AI QUIZ CREATOR */}
      {creationMethod === 'ai' && (
        <div className="bg-[#111827] border border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-xl mb-8 space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Test Drafter</span>
              </span>
              <h2 className="font-display font-bold text-xl text-white mt-1">
                Upload your teaching material and let Quizora draft your test.
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Upload PDF, DOCX, TXT, or Image. Questions are drafted strictly from your document for your review.
              </p>
            </div>

            <button
              type="button"
              onClick={handleLoadSampleAi}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 text-indigo-300 hover:text-white text-xs font-semibold border border-indigo-500/30"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Load Sample Teaching Material</span>
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt,.md,.csv,.png,.jpg,.jpeg"
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* Upload Area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-700 hover:border-indigo-500/60 rounded-2xl p-6 text-center cursor-pointer bg-slate-900/60 hover:bg-slate-900 transition-all flex flex-col items-center justify-center gap-2"
          >
            <UploadCloud className="w-8 h-8 text-indigo-400" />
            <div className="text-sm font-semibold text-white">
              {aiUploadedFileName ? `Selected: ${aiUploadedFileName}` : 'Click to select or drop teaching material'}
            </div>
            <p className="text-xs text-slate-500">PDF, DOCX, TXT or Image</p>
          </div>

          {/* AI Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Number of questions
              </label>
              <select
                value={aiQuestionCount}
                onChange={(e) => setAiQuestionCount(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white"
              >
                <option value={5}>5 Questions</option>
                <option value={10}>10 Questions</option>
                <option value={15}>15 Questions</option>
                <option value={20}>20 Questions</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Difficulty
              </label>
              <select
                value={aiDifficulty}
                onChange={(e) => setAiDifficulty(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Question types
              </label>
              <select
                value={aiQuestionType}
                onChange={(e) => setAiQuestionType(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white"
              >
                <option value="multiple_choice">Multiple Choice</option>
                <option value="true_false">True / False</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>
          </div>

          {aiError && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{aiError}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-500">
              Generated questions will be opened in &ldquo;Review Questions&rdquo; for your approval.
            </span>

            <button
              type="button"
              disabled={aiGenerating}
              onClick={handleGenerateAiQuestions}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition-all"
            >
              {aiGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>{aiGenerating ? 'Drafting Test...' : 'DRAFT TEST WITH AI'}</span>
            </button>
          </div>
        </div>
      )}

      {/* METHOD 1 / REVIEW QUESTIONS WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Left Column: Question Navigator */}
        <div className="lg:col-span-4 bg-[#111827] border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
                <span>REVIEW QUESTIONS ({questions.length})</span>
              </h3>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleAddQuestion('multiple_choice')}
                  className="px-2 py-1 rounded-lg bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white text-[11px] font-semibold transition-colors"
                  title="Add Multiple Choice"
                >
                  + MCQ
                </button>
                <button
                  type="button"
                  onClick={() => handleAddQuestion('true_false')}
                  className="px-2 py-1 rounded-lg bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white text-[11px] font-semibold transition-colors"
                  title="Add True/False"
                >
                  + T/F
                </button>
              </div>
            </div>

            {/* Questions list */}
            <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
              {questions.map((q, idx) => {
                const isActive = idx === activeQuestionIndex;
                return (
                  <div
                    key={q.id || idx}
                    onClick={() => setActiveQuestionIndex(idx)}
                    className={`p-3 rounded-2xl border text-left cursor-pointer transition-all flex items-start justify-between gap-2 ${
                      isActive
                        ? 'bg-indigo-600/15 border-indigo-500 text-white shadow-sm ring-1 ring-indigo-500/30'
                        : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono-tabular">
                        <span className="font-bold text-indigo-400">Q{idx + 1}</span>
                        <span aria-hidden="true">·</span>
                        <span className="uppercase text-[10px]">{q.type === 'true_false' ? 'T/F' : 'MCQ'}</span>
                        <span aria-hidden="true">·</span>
                        <span>{q.points || 10} pts</span>
                      </div>
                      <p className="text-xs font-medium text-slate-200 truncate mt-1">
                        {q.question}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveQuestion(idx, 'up');
                        }}
                        disabled={idx === 0}
                        className="p-1 text-slate-500 hover:text-white disabled:opacity-30"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveQuestion(idx, 'down');
                        }}
                        disabled={idx === questions.length - 1}
                        className="p-1 text-slate-500 hover:text-white disabled:opacity-30"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-800 text-[11px] text-slate-500 flex justify-between">
            <span>Total Marks: {questions.reduce((sum, q) => sum + (Number(q.points) || 10), 0)} pts</span>
            <span>{questions.length} Questions</span>
          </div>
        </div>

        {/* Right Column: Question Editor Workspace */}
        <div className="lg:col-span-8 bg-[#111827] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-lg bg-indigo-600/20 text-indigo-400 font-mono-tabular font-bold text-xs">
                Question {activeQuestionIndex + 1} of {questions.length}
              </span>
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                {currentQ.type === 'true_false' ? 'True / False Question' : 'Multiple Choice Question'}
              </span>
            </div>

            {/* Question Actions: Duplicate, Delete */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleDuplicateQuestion(activeQuestionIndex)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="Duplicate this question"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>DUPLICATE</span>
              </button>

              <button
                type="button"
                onClick={() => handleDeleteQuestion(activeQuestionIndex)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-400 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="Delete this question"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>DELETE</span>
              </button>
            </div>
          </div>

          {/* Question Prompt */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Question Prompt *
            </label>
            <textarea
              rows={2}
              value={currentQ.question}
              onChange={(e) => handleUpdateQuestion(activeQuestionIndex, { question: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              placeholder="Enter question text..."
            />
          </div>

          {/* Points & Topic */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Marks / Points
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={currentQ.points || 10}
                onChange={(e) => handleUpdateQuestion(activeQuestionIndex, { points: Number(e.target.value) || 10 })}
                className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white font-mono-tabular"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Topic / Concept
              </label>
              <input
                type="text"
                value={currentQ.topic || ''}
                onChange={(e) => handleUpdateQuestion(activeQuestionIndex, { topic: e.target.value })}
                placeholder="e.g. OSI Model, Transport Layer"
                className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white"
              />
            </div>
          </div>

          {/* Options & Correct Answer Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Answer Options (Select the correct answer)
              </label>
              <span className="text-xs text-indigo-400">Click circle to mark correct</span>
            </div>

            <div className="space-y-3">
              {currentQ.options.map((opt, optIdx) => {
                const isCorrect = currentQ.correctAnswerIndex === optIdx;
                const letter = ['A', 'B', 'C', 'D'][optIdx] || `${optIdx + 1}`;

                return (
                  <div
                    key={optIdx}
                    className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                      isCorrect
                        ? 'bg-emerald-950/30 border-emerald-500/60 ring-1 ring-emerald-500/30'
                        : 'bg-slate-900/60 border-slate-800'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleUpdateQuestion(activeQuestionIndex, { correctAnswerIndex: optIdx })}
                      className={`w-7 h-7 rounded-full border flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                        isCorrect
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      {letter}
                    </button>

                    <input
                      type="text"
                      disabled={currentQ.type === 'true_false'}
                      value={opt}
                      onChange={(e) => {
                        const newOpts = [...currentQ.options];
                        newOpts[optIdx] = e.target.value;
                        handleUpdateQuestion(activeQuestionIndex, { options: newOpts });
                      }}
                      className="flex-1 bg-transparent border-0 text-sm text-white focus:outline-none"
                    />

                    {isCorrect && (
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider shrink-0 pr-2">
                        Correct Answer
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Explanation */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Explanation for Students
            </label>
            <input
              type="text"
              value={currentQ.explanation || ''}
              onChange={(e) => handleUpdateQuestion(activeQuestionIndex, { explanation: e.target.value })}
              placeholder="Why this answer is correct..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Section 3: Quiz Settings */}
      <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl mb-8 space-y-6">
        <div>
          <h2 className="font-display font-bold text-lg text-white">
            2. Assessment Settings
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure test constraints, timer limits, and student review visibility.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Time Limit */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Time Limit
            </label>
            <select
              value={settings.timeLimitMinutes}
              onChange={(e) => setSettings({ ...settings, timeLimitMinutes: Number(e.target.value) })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white"
            >
              <option value={0}>No Limit (Untimed)</option>
              <option value={5}>5 Minutes</option>
              <option value={10}>10 Minutes</option>
              <option value={15}>15 Minutes</option>
              <option value={30}>30 Minutes</option>
              <option value={45}>45 Minutes</option>
              <option value={60}>60 Minutes (1 Hour)</option>
            </select>
          </div>

          {/* Passing Score */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Passing Score (%)
            </label>
            <input
              type="number"
              min={0}
              max={100}
              value={settings.passingScorePercent || 60}
              onChange={(e) => setSettings({ ...settings, passingScorePercent: Number(e.target.value) || 60 })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white font-mono-tabular"
            />
          </div>

          {/* Enable Leaderboard */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 self-end">
            <div>
              <div className="text-xs font-semibold text-white">Hosted Leaderboard</div>
              <div className="text-[11px] text-slate-400">Classroom rankings</div>
            </div>
            <input
              type="checkbox"
              checked={settings.enableLeaderboard}
              onChange={(e) => setSettings({ ...settings, enableLeaderboard: e.target.checked })}
              className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-800">
          <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 cursor-pointer">
            <div>
              <div className="text-xs font-semibold text-white">Shuffle Questions</div>
              <div className="text-[10px] text-slate-500">Randomize question order</div>
            </div>
            <input
              type="checkbox"
              checked={settings.shuffleQuestions}
              onChange={(e) => setSettings({ ...settings, shuffleQuestions: e.target.checked })}
              className="w-4 h-4 accent-indigo-600 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 cursor-pointer">
            <div>
              <div className="text-xs font-semibold text-white">Shuffle Answers</div>
              <div className="text-[10px] text-slate-500">Randomize option order</div>
            </div>
            <input
              type="checkbox"
              checked={settings.shuffleAnswers}
              onChange={(e) => setSettings({ ...settings, shuffleAnswers: e.target.checked })}
              className="w-4 h-4 accent-indigo-600 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 cursor-pointer">
            <div>
              <div className="text-xs font-semibold text-white">Show Results Immediately</div>
              <div className="text-[10px] text-slate-500">Reveal score on submit</div>
            </div>
            <input
              type="checkbox"
              checked={settings.showResultsImmediately}
              onChange={(e) => setSettings({ ...settings, showResultsImmediately: e.target.checked })}
              className="w-4 h-4 accent-indigo-600 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 cursor-pointer">
            <div>
              <div className="text-xs font-semibold text-white">Allow Multiple Attempts</div>
              <div className="text-[10px] text-slate-500">Students can retake</div>
            </div>
            <input
              type="checkbox"
              checked={settings.allowMultipleAttempts}
              onChange={(e) => setSettings({ ...settings, allowMultipleAttempts: e.target.checked })}
              className="w-4 h-4 accent-indigo-600 rounded"
            />
          </label>
        </div>
      </div>

      {/* Footer Publish Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-3xl bg-[#111827] border border-slate-800 shadow-xl">
        <div className="text-xs text-slate-400">
          <span>Ready to launch: </span>
          <span className="font-semibold text-white">{questions.length} Questions</span>
          <span className="mx-1.5" aria-hidden="true">·</span>
          <span className="font-semibold text-indigo-400">
            {questions.reduce((sum, q) => sum + (Number(q.points) || 10), 0)} Total Marks
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handlePublishQuiz}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all hover:-translate-y-0.5"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>PUBLISH QUIZ</span>
          </button>
        </div>
      </div>
    </div>
  );
};
