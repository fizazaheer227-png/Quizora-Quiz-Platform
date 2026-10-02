import React, { useState } from 'react';
import {
  Layers,
  PlusCircle,
  Copy,
  Check,
  Trash2,
  Play,
  Users,
  Clock,
  Sparkles,
  BarChart2,
  Calendar,
  CheckCircle2,
  Target,
  ArrowRight,
  X,
} from 'lucide-react';
import { CustomQuiz, QuizAttemptRecord } from '../types/quiz.ts';

interface MyQuizzesViewProps {
  quizzes: CustomQuiz[];
  onCreateNewQuiz: () => void;
  onTakeQuiz: (quiz: CustomQuiz) => void;
  onDeleteQuiz: (quizId: string) => void;
}

export const MyQuizzesView: React.FC<MyQuizzesViewProps> = ({
  quizzes,
  onCreateNewQuiz,
  onTakeQuiz,
  onDeleteQuiz,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedQuizForAttempts, setSelectedQuizForAttempts] = useState<CustomQuiz | null>(null);

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Compute aggregate stats across quizzes
  const totalCreated = quizzes.length;
  const totalAttempts = quizzes.reduce((acc, q) => acc + (q.attemptsCount || q.attempts?.length || 0), 0);
  const allRecordedAttempts = quizzes.flatMap((q) => q.attempts || []);
  const avgClassAccuracy =
    allRecordedAttempts.length > 0
      ? Math.round(allRecordedAttempts.reduce((acc, a) => acc + a.accuracy, 0) / allRecordedAttempts.length)
      : 84;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
            Creator Dashboard
          </span>
          <h1 className="mt-1 font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            My Quizzes & Analytics
          </h1>
          <p className="mt-1 text-slate-400 text-sm sm:text-base">
            Manage your custom quizzes, copy student join codes, and inspect class attempt logs.
          </p>
        </div>

        <button
          type="button"
          onClick={onCreateNewQuiz}
          className="self-start sm:self-center inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition-all hover:-translate-y-0.5"
        >
          <PlusCircle className="w-4 h-4" />
          <span>CREATE NEW QUIZ</span>
        </button>
      </div>

      {/* 3 Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Quizzes Created</span>
            <Layers className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-display font-extrabold text-white mt-2 font-mono-tabular">
            {totalCreated}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Active shareable challenges</p>
        </div>

        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Student Attempts</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-display font-extrabold text-purple-300 mt-2 font-mono-tabular">
            {totalAttempts}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Total recorded submissions</p>
        </div>

        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Avg. Group Accuracy</span>
            <Target className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-display font-extrabold text-emerald-400 mt-2 font-mono-tabular">
            {avgClassAccuracy}%
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Across all student sessions</p>
        </div>
      </div>

      {/* Quizzes Grid */}
      {quizzes.length === 0 ? (
        <div className="bg-[#111827] border border-slate-800 rounded-3xl p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto">
            <Layers className="w-7 h-7" />
          </div>
          <h2 className="font-display font-bold text-xl text-white">No Quizzes Created Yet</h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Build your first custom quiz or generate questions from study notes to get a unique shareable code for your group.
          </p>
          <button
            type="button"
            onClick={onCreateNewQuiz}
            className="mt-2 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create First Quiz</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {quizzes.map((quiz) => {
            const formattedDate = new Date(quiz.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });
            const attemptsCount = quiz.attemptsCount || quiz.attempts?.length || 0;

            return (
              <div
                key={quiz.id}
                className="bg-[#111827] border border-slate-800 hover:border-indigo-500/40 rounded-3xl p-6 shadow-xl flex flex-col justify-between transition-all duration-200"
              >
                <div>
                  {/* Header Row: Title & Code */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 px-2 py-0.5 rounded-md bg-indigo-950/60 border border-indigo-500/30">
                        {quiz.category}
                      </span>
                      <h3 className="font-display font-bold text-lg text-white mt-1.5 line-clamp-1" title={quiz.title}>
                        {quiz.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {quiz.description}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => onDeleteQuiz(quiz.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors shrink-0"
                      title="Delete quiz"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Shareable Code Card */}
                  <div className="mt-4 p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        Share Code
                      </span>
                      <div className="font-mono-tabular font-bold text-base text-indigo-300 tracking-wider">
                        {quiz.code}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopy(quiz.code, quiz.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all active:scale-95"
                    >
                      {copiedId === quiz.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Metadata Row */}
                  <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800 text-center text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase">Questions</span>
                      <div className="font-bold text-slate-200 font-mono-tabular mt-0.5">
                        {quiz.questions.length}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase">Difficulty</span>
                      <div className="font-bold text-indigo-300 capitalize mt-0.5">
                        {quiz.difficulty}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase">Mode</span>
                      <div className="font-bold text-slate-200 capitalize mt-0.5">
                        {quiz.mode}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedQuizForAttempts(quiz)}
                    className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
                  >
                    <BarChart2 className="w-3.5 h-3.5" />
                    <span>View Attempts ({attemptsCount})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onTakeQuiz(quiz)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition-all active:scale-95 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>TAKE QUIZ</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ATTEMPTS & RESULTS MODAL */}
      {selectedQuizForAttempts && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#111827] border border-slate-700/80 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
            {/* Header */}
            <div className="p-5 sm:p-6 border-b border-slate-800 bg-slate-900/60 flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                  Attempt Analytics · Code: {selectedQuizForAttempts.code}
                </span>
                <h3 className="font-display font-extrabold text-xl sm:text-2xl text-white mt-1">
                  {selectedQuizForAttempts.title}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Logged student submissions and evaluation results.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedQuizForAttempts(null)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-3 flex-1">
              {!selectedQuizForAttempts.attempts || selectedQuizForAttempts.attempts.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">
                  <p>No attempts recorded for this quiz yet.</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Share code <strong className="text-indigo-400 font-mono-tabular">{selectedQuizForAttempts.code}</strong> with your students to view results here!
                  </p>
                </div>
              ) : (
                selectedQuizForAttempts.attempts.map((att) => {
                  const dateStr = new Date(att.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  return (
                    <div
                      key={att.id}
                      className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-300 font-bold flex items-center justify-center text-xs">
                          {att.userName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-white text-sm">
                            {att.userName}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {dateStr}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-right">
                        <div>
                          <div className="text-[10px] text-slate-400 uppercase">Score</div>
                          <div className="font-display font-extrabold text-white text-sm font-mono-tabular">
                            {att.score} pts
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400 uppercase">Accuracy</div>
                          <div className="font-bold text-emerald-400 text-sm font-mono-tabular">
                            {att.accuracy}%
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedQuizForAttempts(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
