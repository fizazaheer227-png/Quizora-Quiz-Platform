import React, { useState } from 'react';
import {
  RotateCcw,
  Sparkles,
  Trophy,
  Flame,
  Clock,
  Target,
  CheckCircle2,
  XCircle,
  BookOpen,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { QuizResult } from '../types/quiz.ts';

interface ResultsScreenProps {
  result: QuizResult;
  onTryAgain: () => void;
  onNewQuiz: () => void;
  onViewLeaderboard: () => void;
  onRetryWeakTopics?: (weakTopics: string[], notesText?: string) => Promise<void> | void;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({
  result,
  onTryAgain,
  onNewQuiz,
  onViewLeaderboard,
  onRetryWeakTopics,
}) => {
  const [retryingWeak, setRetryingWeak] = useState(false);

  // Performance message determination based on accuracy percentage
  let performanceTitle = 'Keep practicing!';
  let performanceMessage = 'Every attempt sharpens your knowledge. Review and climb higher.';

  if (result.accuracy >= 90) {
    performanceTitle = 'Outstanding performance!';
    performanceMessage = 'Dominant display of mastery! You are climbing straight to the top.';
  } else if (result.accuracy >= 70) {
    performanceTitle = 'Great job!';
    performanceMessage = 'Strong grasp of the subject. A few tweaks and you will have a perfect run.';
  } else if (result.accuracy >= 50) {
    performanceTitle = 'Good attempt — keep climbing.';
    performanceMessage = 'Solid baseline foundation. Keep challenging yourself to level up.';
  }

  // Format time taken
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    if (m === 0) return `${s}s`;
    return `${m}m ${s}s`;
  };

  // SVG Circular Accuracy Gauge Math
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (result.accuracy / 100) * circumference;

  // Extract weak topics either from result.topicsToRevise or from attemptedQuestions
  const weakTopics: string[] =
    result.topicsToRevise && result.topicsToRevise.length > 0
      ? result.topicsToRevise
      : Array.from(
          new Set(
            (result.attemptedQuestions || [])
              .filter((q) => !q.isCorrect)
              .map((q) => q.question.topic || '')
              .filter((t) => t.trim().length > 0)
          )
        );

  const handleRetryWeakClick = async () => {
    if (!onRetryWeakTopics || weakTopics.length === 0) return;
    setRetryingWeak(true);
    try {
      await onRetryWeakTopics(weakTopics, result.notesText);
    } finally {
      setRetryingWeak(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-in fade-in zoom-in-95 duration-200">
      {/* Top Banner Box */}
      <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden text-center">
        {/* Ambient Top Glow */}
        <div
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-indigo-600/20 blur-3xl rounded-full pointer-events-none"
          aria-hidden="true"
        />

        {/* Unboxed Metadata */}
        <div className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <span>{result.categoryName}</span>
          <span aria-hidden="true">·</span>
          <span className="capitalize">{result.difficulty}</span>
          <span aria-hidden="true">·</span>
          <span className="capitalize">{result.mode} Mode</span>
        </div>

        {/* Performance Title */}
        <h1 className="mt-3 font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          {performanceTitle}
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-md mx-auto">
          {performanceMessage}
        </p>

        {/* Center: Circular Accuracy Gauge & Score */}
        <div className="my-8 flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-12">
          {/* Circular SVG Gauge */}
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 128 128">
              <circle
                cx="64"
                cy="64"
                r={radius}
                className="stroke-slate-800"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="64"
                cy="64"
                r={radius}
                className="stroke-indigo-500 transition-all duration-1000 ease-out"
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="font-display font-extrabold text-3xl text-white font-mono-tabular">
                {result.accuracy}%
              </span>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Accuracy
              </span>
            </div>
          </div>

          {/* Final Score Showcase */}
          <div className="text-center sm:text-left">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
              FINAL SCORE
            </span>
            <div className="font-display text-4xl sm:text-5xl font-extrabold text-white font-mono-tabular mt-1">
              {result.score}{' '}
              <span className="text-xl sm:text-2xl font-normal text-slate-400">Points</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Recorded and synced to global rankings
            </p>
          </div>
        </div>

        {/* Detailed Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-6 border-t border-slate-800/80 text-left">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Correct</span>
            </div>
            <div className="text-xl font-bold font-mono-tabular text-emerald-300 mt-1">
              {result.correctAnswers} / {result.totalQuestions}
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <XCircle className="w-3.5 h-3.5 text-rose-400" />
              <span>Wrong</span>
            </div>
            <div className="text-xl font-bold font-mono-tabular text-rose-300 mt-1">
              {result.wrongAnswers}
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Best Streak</span>
            </div>
            <div className="text-xl font-bold font-mono-tabular text-amber-300 mt-1">
              {result.bestStreak}
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>Time Taken</span>
            </div>
            <div className="text-xl font-bold font-mono-tabular text-slate-200 mt-1">
              {formatTime(result.timeTakenSeconds)}
            </div>
          </div>
        </div>

        {/* TOPICS TO REVISE (For Study Material Quizzes) */}
        {weakTopics.length > 0 && (
          <div className="mt-8 p-6 rounded-2xl bg-amber-950/25 border border-amber-500/35 text-left animate-in fade-in duration-200">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <BookOpen className="w-4 h-4" />
                <span>TOPICS TO REVISE</span>
              </div>
              <span className="text-[11px] text-amber-300/80 font-mono-tabular">
                {weakTopics.length} areas flagged for review
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 mb-3.5 leading-relaxed">
              Based on the questions you missed, review these specific concepts in your uploaded study material:
            </p>

            <ul className="space-y-1.5 mb-5 text-xs sm:text-sm font-medium text-slate-200">
              {weakTopics.map((topic, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5" />
                  <span>{topic}</span>
                </li>
              ))}
            </ul>

            {onRetryWeakTopics && (
              <button
                type="button"
                disabled={retryingWeak}
                onClick={handleRetryWeakClick}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/25 transition-all active:scale-95"
              >
                {retryingWeak ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>GENERATING REVISION QUIZ...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    <span>RETRY WEAK TOPICS</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {/* Action Buttons Row */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onTryAgain}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all hover:-translate-y-0.5"
          >
            <RotateCcw className="w-4 h-4" />
            <span>TRY AGAIN</span>
          </button>

          <button
            onClick={onNewQuiz}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-sm transition-all"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>NEW QUIZ</span>
          </button>

          <button
            onClick={onViewLeaderboard}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-slate-600 text-slate-200 hover:text-white font-semibold text-sm transition-all"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>VIEW LEADERBOARD</span>
          </button>
        </div>
      </div>
    </div>
  );
};
