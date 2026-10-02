import React, { useState } from 'react';
import {
  KeyRound,
  User,
  ArrowRight,
  Clock,
  HelpCircle,
  Award,
  AlertCircle,
  GraduationCap,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { HostedQuiz, UserProfile } from '../types/quiz.ts';
import { getHostedQuizByCode, getStoredHostedQuizzes } from '../utils/storage.ts';

interface JoinQuizViewProps {
  profile: UserProfile;
  initialCode?: string;
  onStartQuiz: (quiz: HostedQuiz, studentName: string) => void;
  onNavigateToHostDashboard?: () => void;
}

export const JoinQuizView: React.FC<JoinQuizViewProps> = ({
  profile,
  initialCode = '',
  onStartQuiz,
  onNavigateToHostDashboard,
}) => {
  const [code, setCode] = useState(initialCode);
  const [studentName, setStudentName] = useState(profile.name || '');
  const [error, setError] = useState('');
  const [resolvedQuiz, setResolvedQuiz] = useState<HostedQuiz | null>(null);

  // Available sample/live quizzes for instant testing
  const allHostedQuizzes = getStoredHostedQuizzes();
  const liveQuizzes = allHostedQuizzes.filter((q) => q.status === 'live');

  const handleEnterQuiz = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');

    const trimmedCode = code.trim().toUpperCase();
    if (!trimmedCode) {
      setError('Please enter a Quiz Code (e.g. QZ-4821)');
      return;
    }

    if (!studentName.trim()) {
      setError('Please enter your full name so your instructor can record your score.');
      return;
    }

    const quiz = getHostedQuizByCode(trimmedCode);
    if (!quiz) {
      setError(`No active quiz found with code "${trimmedCode}". Please verify the code with your instructor.`);
      setResolvedQuiz(null);
      return;
    }

    if (quiz.status === 'closed') {
      setError(`This quiz (${quiz.code} - ${quiz.title}) has been marked as CLOSED by the instructor.`);
      setResolvedQuiz(null);
      return;
    }

    setResolvedQuiz(quiz);
  };

  const handleQuickLoad = (selectedQuiz: HostedQuiz) => {
    setCode(selectedQuiz.code);
    setError('');
    setResolvedQuiz(selectedQuiz);
  };

  const handleConfirmStart = () => {
    if (!resolvedQuiz) return;
    if (!studentName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    onStartQuiz(resolvedQuiz, studentName.trim());
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-4">
          <GraduationCap className="w-4 h-4" />
          <span>Student Portal</span>
        </div>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight">
          JOIN A QUIZ
        </h1>
        <p className="mt-3 text-slate-400 text-sm sm:text-base leading-relaxed">
          Enter the unique quiz code provided by your instructor or host to access your test.
        </p>
      </div>

      {/* Main Entry Card */}
      <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        {!resolvedQuiz ? (
          /* Code Input Form */
          <form onSubmit={handleEnterQuiz} className="space-y-6 relative z-10 max-w-xl mx-auto">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Quiz Code *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                  <KeyRound className="w-5 h-5 text-indigo-400" />
                </div>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.toUpperCase());
                    setError('');
                  }}
                  placeholder="e.g. QZ-4821 or QZ-1010"
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-white font-mono-tabular tracking-wider text-base sm:text-lg uppercase placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Your Full Name (Student Name) *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                  <User className="w-5 h-5 text-purple-400" />
                </div>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => {
                    setStudentName(e.target.value);
                    setError('');
                  }}
                  placeholder="Enter your name (e.g. Maya Lin)"
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-white text-sm sm:text-base placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
              </div>
              <p className="text-xs text-slate-400 mt-1.5">
                Your instructor will see this name on their live assessment roster and gradebook.
              </p>
            </div>

            {error && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm sm:text-base shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>ENTER QUIZ</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        ) : (
          /* Quiz Preview Card */
          <div className="space-y-6 relative z-10 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider">
                    {resolvedQuiz.subject}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-semibold">
                    Code: {resolvedQuiz.code}
                  </span>
                </div>
                <h2 className="font-display font-bold text-2xl sm:text-3xl text-white">
                  {resolvedQuiz.title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Host: <span className="text-slate-200 font-semibold">{resolvedQuiz.creatorName}</span>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setResolvedQuiz(null)}
                className="self-start text-xs font-semibold text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors"
              >
                Change Code
              </button>
            </div>

            {resolvedQuiz.description && (
              <p className="text-sm text-slate-300 leading-relaxed">
                {resolvedQuiz.description}
              </p>
            )}

            {/* Test Specifications */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4">
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 text-center">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-semibold">
                  Questions
                </span>
                <span className="font-display font-extrabold text-xl text-white mt-1 block">
                  {resolvedQuiz.questions.length}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 text-center">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-semibold">
                  Time Limit
                </span>
                <span className="font-display font-extrabold text-xl text-indigo-400 mt-1 flex items-center justify-center gap-1">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  {resolvedQuiz.settings.timeLimitMinutes > 0
                    ? `${resolvedQuiz.settings.timeLimitMinutes} min`
                    : 'Unlimited'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 text-center">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-semibold">
                  Total Marks
                </span>
                <span className="font-display font-extrabold text-xl text-purple-400 mt-1 block">
                  {resolvedQuiz.totalMarks} pts
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 text-center">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-semibold">
                  Passing Mark
                </span>
                <span className="font-display font-extrabold text-xl text-emerald-400 mt-1 block">
                  {resolvedQuiz.settings.passingScorePercent
                    ? `${resolvedQuiz.settings.passingScorePercent}%`
                    : 'None'}
                </span>
              </div>
            </div>

            {/* Instructions box */}
            {resolvedQuiz.instructions && (
              <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 space-y-1.5">
                <div className="flex items-center gap-2 text-indigo-300 font-semibold text-xs uppercase tracking-wider">
                  <HelpCircle className="w-4 h-4 text-indigo-400" />
                  <span>Test Instructions</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {resolvedQuiz.instructions}
                </p>
              </div>
            )}

            {/* Student Name Confirmation */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs text-slate-400 uppercase font-semibold">Taking test as:</span>
                <div className="font-bold text-sm sm:text-base text-white mt-0.5">{studentName}</div>
              </div>
              <button
                type="button"
                onClick={() => setResolvedQuiz(null)}
                className="text-xs text-indigo-400 hover:text-indigo-300 underline"
              >
                Edit name
              </button>
            </div>

            {/* Start Button */}
            <button
              type="button"
              onClick={handleConfirmStart}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold text-base shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/50 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <Award className="w-5 h-5 text-white" />
              <span>START TEST</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Quick Test Pre-loaded Quizzes Section */}
      <div className="mt-12 pt-8 border-t border-slate-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="font-display font-bold text-base sm:text-lg text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Live Hosted Quizzes Available to Join</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Select one below to test the student quiz-taking experience immediately.
            </p>
          </div>
          {onNavigateToHostDashboard && (
            <button
              type="button"
              onClick={onNavigateToHostDashboard}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold self-start"
            >
              Looking for Faculty Host Dashboard? →
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {liveQuizzes.slice(0, 4).map((quiz) => (
            <div
              key={quiz.id}
              onClick={() => handleQuickLoad(quiz)}
              className="p-5 rounded-2xl bg-[#111827]/70 hover:bg-[#111827] border border-slate-800 hover:border-indigo-500/50 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono-tabular font-extrabold text-sm text-indigo-400 px-2.5 py-0.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30">
                    {quiz.code}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">{quiz.subject}</span>
                </div>
                <h4 className="font-display font-bold text-base text-white group-hover:text-indigo-300 transition-colors">
                  {quiz.title}
                </h4>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  {quiz.description || 'Interactive test prepared by faculty.'}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  {quiz.settings.timeLimitMinutes > 0 ? `${quiz.settings.timeLimitMinutes} min` : 'No limit'}
                </span>
                <span className="flex items-center gap-1 font-semibold text-indigo-400 group-hover:translate-x-1 transition-transform">
                  <span>Take Quiz</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
