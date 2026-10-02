import React, { useState } from 'react';
import {
  PlusCircle,
  Sparkles,
  BookOpen,
  Trash2,
  Copy,
  Check,
  Save,
  Send,
  HelpCircle,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
  UploadCloud,
  FileText,
  AlertCircle,
  Eye,
  BarChart2,
} from 'lucide-react';
import { CategoryId, CustomQuiz, Difficulty, Question, QuizMode } from '../types/quiz.ts';
import { CATEGORIES } from '../data/questions.ts';
import { saveStoredCustomQuiz } from '../utils/storage.ts';

interface QuizCreatorViewProps {
  currentUser: string;
  onQuizPublished: (quiz: CustomQuiz) => void;
  onCancel: () => void;
  onViewMyQuizzes: () => void;
  onStartQuiz: (quiz: CustomQuiz) => void;
}

export const QuizCreatorView: React.FC<QuizCreatorViewProps> = ({
  currentUser,
  onQuizPublished,
  onCancel,
  onViewMyQuizzes,
  onStartQuiz,
}) => {
  // Quiz General Settings
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<CategoryId>('technology');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [mode, setMode] = useState<QuizMode>('classic');
  const [customCode, setCustomCode] = useState(() => `QZ-${Math.floor(1000 + Math.random() * 9000)}`);

  // Active Creation Mode Tab
  const [creationMode, setCreationMode] = useState<'manual' | 'ai'>('manual');

  // AI Notes Generation State
  const [aiNotesText, setAiNotesText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiQuestionCount, setAiQuestionCount] = useState<number>(5);

  // Questions List
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: `q-${Date.now()}-1`,
      category: 'technology',
      difficulty: 'medium',
      question: 'What is the primary function of an Operating System kernel?',
      options: [
        'Managing hardware resources and bridging applications',
        'Styling web applications with CSS',
        'Compiling source code to JavaScript',
        'Serving DNS queries across the internet',
      ],
      correctAnswerIndex: 0,
      topic: 'Operating Systems',
      explanation: 'Why: The kernel operates at the core of the OS to manage memory, CPU scheduling, and hardware drivers.',
      type: 'multiple_choice',
    },
    {
      id: `q-${Date.now()}-2`,
      category: 'technology',
      difficulty: 'easy',
      question: 'True or False: RAM is a non-volatile memory storage medium that retains data without power.',
      options: ['True', 'False'],
      correctAnswerIndex: 1,
      topic: 'Hardware Memory',
      explanation: 'Why: RAM is volatile memory; its contents are lost when electric power is disconnected.',
      type: 'true_false',
    },
  ]);

  // Published Success State
  const [publishedQuiz, setPublishedQuiz] = useState<CustomQuiz | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Handle adding a new blank question
  const handleAddQuestion = () => {
    const newQ: Question = {
      id: `q-${Date.now()}-${questions.length + 1}`,
      category,
      difficulty: difficulty === 'mixed' ? 'medium' : difficulty,
      question: '',
      options: ['', '', '', ''],
      correctAnswerIndex: 0,
      topic: '',
      explanation: '',
      type: 'multiple_choice',
    };
    setQuestions([...questions, newQ]);
  };

  // Handle question deletion
  const handleDeleteQuestion = (index: number) => {
    if (questions.length <= 1) {
      setValidationError('A quiz must have at least 1 question.');
      return;
    }
    const updated = questions.filter((_, i) => i !== index);
    setQuestions(updated);
  };

  // Handle question duplication
  const handleDuplicateQuestion = (index: number) => {
    const target = questions[index];
    const clone: Question = {
      ...target,
      id: `q-${Date.now()}-${Math.random()}`,
      question: `${target.question} (Copy)`,
    };
    const next = [...questions];
    next.splice(index + 1, 0, clone);
    setQuestions(next);
  };

  // Update question text
  const handleUpdateQuestionText = (index: number, text: string) => {
    const next = [...questions];
    next[index] = { ...next[index], question: text };
    setQuestions(next);
  };

  // Update question topic
  const handleUpdateTopic = (index: number, topic: string) => {
    const next = [...questions];
    next[index] = { ...next[index], topic };
    setQuestions(next);
  };

  // Update question explanation
  const handleUpdateExplanation = (index: number, explanation: string) => {
    const next = [...questions];
    next[index] = { ...next[index], explanation };
    setQuestions(next);
  };

  // Update question type
  const handleUpdateType = (index: number, type: 'multiple_choice' | 'true_false') => {
    const next = [...questions];
    const current = next[index];
    if (type === 'true_false') {
      next[index] = {
        ...current,
        type,
        options: ['True', 'False'],
        correctAnswerIndex: Math.min(current.correctAnswerIndex, 1),
      };
    } else {
      next[index] = {
        ...current,
        type,
        options: current.options.length === 2 ? [...current.options, 'Option C', 'Option D'] : current.options,
      };
    }
    setQuestions(next);
  };

  // Update question option text
  const handleUpdateOption = (qIndex: number, optIndex: number, text: string) => {
    const next = [...questions];
    const options = [...next[qIndex].options];
    options[optIndex] = text;
    next[qIndex] = { ...next[qIndex], options };
    setQuestions(next);
  };

  // Update correct answer index
  const handleSetCorrectAnswer = (qIndex: number, optIndex: number) => {
    const next = [...questions];
    next[qIndex] = { ...next[qIndex], correctAnswerIndex: optIndex };
    setQuestions(next);
  };

  // AI Generation from study material text
  const handleGenerateQuestionsWithAI = async () => {
    if (!aiNotesText.trim() || aiNotesText.trim().length < 30) {
      setAiError('Please paste or write at least a few sentences of study material.');
      return;
    }
    setAiLoading(true);
    setAiError('');

    try {
      const res = await fetch('/api/notes/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notesText: aiNotesText,
          difficulty,
          questionCount: aiQuestionCount,
          questionType: 'mixed',
          fileName: title ? `${title}.txt` : 'Study Material',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success || !data.questions) {
        throw new Error(data.error || 'Failed to generate questions with AI.');
      }

      // Populate into questions state!
      setQuestions((prev) => [...prev, ...data.questions]);
      setCreationMode('manual'); // switch to review/edit
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || 'Could not reach AI generator. You can add questions manually.');
    } finally {
      setAiLoading(false);
    }
  };

  // Publish Quiz Action
  const handlePublishQuiz = () => {
    setValidationError('');

    if (!title.trim()) {
      setValidationError('Please enter a Quiz Title.');
      return;
    }

    if (questions.length === 0) {
      setValidationError('Please add at least one question.');
      return;
    }

    // Validate that questions have non-empty text and options
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) {
        setValidationError(`Question #${i + 1} has empty question text.`);
        return;
      }
      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j].trim()) {
          setValidationError(`Question #${i + 1}, Option ${j + 1} is empty.`);
          return;
        }
      }
    }

    const cleanCode = (customCode.trim().toUpperCase() || `QZ-${Math.floor(1000 + Math.random() * 9000)}`).replace(/\s+/g, '-');

    const newQuiz: CustomQuiz = {
      id: `custom-quiz-${Date.now()}`,
      code: cleanCode,
      title: title.trim(),
      description: description.trim() || 'Custom quiz challenge created on Quizora.',
      category,
      difficulty,
      mode,
      questions,
      createdAt: new Date().toISOString(),
      authorName: currentUser || 'Teacher / Creator',
      isPublished: true,
      attemptsCount: 0,
      attempts: [],
    };

    saveStoredCustomQuiz(newQuiz);
    setPublishedQuiz(newQuiz);
    onQuizPublished(newQuiz);
  };

  const handleCopyCode = () => {
    if (!publishedQuiz) return;
    navigator.clipboard.writeText(publishedQuiz.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-in fade-in duration-200">
      {/* Published Success Modal / Banner */}
      {publishedQuiz ? (
        <div className="bg-[#111827] border-2 border-emerald-500/50 rounded-3xl p-6 sm:p-10 shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Quiz Published Successfully!
            </span>
            <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white mt-1">
              {publishedQuiz.title}
            </h1>
            <p className="text-slate-400 text-sm max-w-md mx-auto mt-2">
              Share the code below with your students, classmates, or study group to let them join and attempt this quiz.
            </p>
          </div>

          {/* Share Code Box */}
          <div className="max-w-sm mx-auto p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-700/80 flex items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Shareable Quiz Code
              </span>
              <div className="font-display font-black text-2xl sm:text-3xl text-indigo-300 font-mono-tabular tracking-wider mt-0.5">
                {publishedQuiz.code}
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopyCode}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-md active:scale-95"
            >
              {copiedCode ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>COPIED!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>COPY CODE</span>
                </>
              )}
            </button>
          </div>

          {/* Action CTAs */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => onStartQuiz(publishedQuiz)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/30 transition-all hover:-translate-y-0.5"
            >
              <Send className="w-4 h-4" />
              <span>TEST / TAKE QUIZ NOW</span>
            </button>

            <button
              type="button"
              onClick={onViewMyQuizzes}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-sm transition-all"
            >
              <BarChart2 className="w-4 h-4 text-indigo-400" />
              <span>VIEW IN MY QUIZZES</span>
            </button>
          </div>
        </div>
      ) : (
        /* QUIZ CREATOR FORM */
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Quiz Creator Studio</span>
              </div>
              <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
                Create & Publish a Quiz
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Build questions manually, generate with AI from notes, set timers, and generate a shareable code for your group.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <button
                type="button"
                onClick={onViewMyQuizzes}
                className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-slate-600 text-slate-300 hover:text-white text-xs font-semibold transition-all"
              >
                My Published Quizzes
              </button>
            </div>
          </div>

          {validationError && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{validationError}</span>
            </div>
          )}

          {/* SECTION 1: QUIZ SETTINGS */}
          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <h2 className="font-display font-bold text-lg text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>1. Quiz Details & Settings</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Quiz Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Physics Midterm Practice, CS101 Fundamentals"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Custom Share Code (Optional)
                </label>
                <input
                  type="text"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
                  placeholder="e.g. CS-101, PHYS-402, QZ-8492"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm font-mono-tabular uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Description / Instructions
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. 5-question review challenge for Friday's class test."
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as CategoryId)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Quiz Mode & Pacing
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMode('classic')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      mode === 'classic'
                        ? 'bg-indigo-600/20 border-indigo-500 text-white ring-1 ring-indigo-500/30'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Classic (Relaxed)
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('timed')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      mode === 'timed'
                        ? 'bg-indigo-600/20 border-indigo-500 text-white ring-1 ring-indigo-500/30'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Timed (15s / Q)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: CREATION MODE TABS */}
          <div className="flex items-center gap-3 p-1 rounded-2xl bg-slate-900 border border-slate-800 max-w-md">
            <button
              type="button"
              onClick={() => setCreationMode('manual')}
              className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                creationMode === 'manual'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create / Edit Manually</span>
            </button>

            <button
              type="button"
              onClick={() => setCreationMode('ai')}
              className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                creationMode === 'ai'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-4 h-4 text-indigo-300" />
              <span>Generate with AI</span>
            </button>
          </div>

          {/* AI GENERATOR DRAWER */}
          {creationMode === 'ai' && (
            <div className="bg-gradient-to-b from-[#131b31] to-[#0f172a] border-2 border-indigo-500/40 rounded-3xl p-6 sm:p-8 space-y-5 animate-in fade-in duration-200 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-400" />
                    <span>Generate Questions from Notes with AI</span>
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Paste your lecture notes, chapter summaries, or formulas. AI will formulate questions and load them directly into your editor!
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Paste Study Material / Notes Text
                </label>
                <textarea
                  rows={5}
                  value={aiNotesText}
                  onChange={(e) => setAiNotesText(e.target.value)}
                  placeholder="e.g. Operating Systems: A page fault occurs when a requested page is not in physical RAM. The OS loads it from swap storage..."
                  className="w-full p-4 rounded-2xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed font-sans"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <span>Questions to generate:</span>
                  <select
                    value={aiQuestionCount}
                    onChange={(e) => setAiQuestionCount(Number(e.target.value))}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono-tabular"
                  >
                    <option value={3}>3 questions</option>
                    <option value={5}>5 questions</option>
                    <option value={10}>10 questions</option>
                  </select>
                </div>

                <button
                  type="button"
                  disabled={aiLoading}
                  onClick={handleGenerateQuestionsWithAI}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{aiLoading ? 'GENERATING WITH AI...' : 'GENERATE & ADD TO QUIZ'}</span>
                </button>
              </div>

              {aiError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{aiError}</span>
                </div>
              )}
            </div>
          )}

          {/* SECTION 3: REVIEW / EDIT QUESTIONS */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display font-bold text-lg text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  <span>2. Review & Edit Questions ({questions.length})</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Click the radio button next to an option to mark it as the correct answer.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddQuestion}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all shadow-md shadow-indigo-600/25 cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add Question</span>
              </button>
            </div>

            <div className="space-y-4">
              {questions.map((q, qIndex) => (
                <div
                  key={q.id}
                  className="bg-[#111827] border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl"
                >
                  {/* Top Question Row: Number, Type Toggle, Delete */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 font-bold text-xs flex items-center justify-center font-mono-tabular">
                        {qIndex + 1}
                      </span>
                      <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Question {qIndex + 1}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={q.type || 'multiple_choice'}
                        onChange={(e) =>
                          handleUpdateType(qIndex, e.target.value as 'multiple_choice' | 'true_false')
                        }
                        className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 text-xs"
                      >
                        <option value="multiple_choice">Multiple Choice</option>
                        <option value="true_false">True / False</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => handleDuplicateQuestion(qIndex)}
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                        title="Duplicate question"
                      >
                        <Copy className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteQuestion(qIndex)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                        title="Delete question"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Question Text */}
                  <div>
                    <input
                      type="text"
                      value={q.question}
                      onChange={(e) => handleUpdateQuestionText(qIndex, e.target.value)}
                      placeholder="Enter question prompt..."
                      className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Options List */}
                  <div className="space-y-2 pt-1">
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Options (Select the correct answer)
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {q.options.map((opt, optIndex) => {
                        const isCorrect = q.correctAnswerIndex === optIndex;
                        return (
                          <div
                            key={optIndex}
                            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border transition-all ${
                              isCorrect
                                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-200'
                                : 'bg-slate-900/80 border-slate-800 text-slate-300'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`correct-${q.id}`}
                              checked={isCorrect}
                              onChange={() => handleSetCorrectAnswer(qIndex, optIndex)}
                              className="accent-emerald-500 w-4 h-4 cursor-pointer"
                              title="Mark as correct answer"
                            />
                            <span className="text-xs font-bold font-mono-tabular text-slate-500 w-4">
                              {String.fromCharCode(65 + optIndex)}.
                            </span>
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => handleUpdateOption(qIndex, optIndex, e.target.value)}
                              placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                              className="bg-transparent border-0 text-xs sm:text-sm text-slate-200 focus:outline-none w-full"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Optional Metadata: Topic & Explanation */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <input
                        type="text"
                        value={q.topic || ''}
                        onChange={(e) => handleUpdateTopic(qIndex, e.target.value)}
                        placeholder="Topic tag (e.g. Memory, Normalization)"
                        className="w-full px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-300 placeholder-slate-600 text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={q.explanation || ''}
                        onChange={(e) => handleUpdateExplanation(qIndex, e.target.value)}
                        placeholder="Why? Explanation for student feedback"
                        className="w-full px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-300 placeholder-slate-600 text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PUBLISH ACTION BAR */}
          <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-400">
              <span>Ready with {questions.length} questions</span>
              <span className="mx-1.5" aria-hidden="true">·</span>
              <span>Code: <strong className="text-indigo-400 font-mono-tabular">{customCode}</strong></span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onCancel}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-all"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handlePublishQuiz}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/30 transition-all hover:-translate-y-0.5 cursor-pointer active:translate-y-0"
              >
                <Send className="w-4 h-4" />
                <span>PUBLISH QUIZ & GENERATE CODE</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
