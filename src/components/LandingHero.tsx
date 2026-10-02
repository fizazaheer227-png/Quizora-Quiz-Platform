import React, { useState } from 'react';
import {
  ArrowRight,
  Trophy,
  Sparkles,
  Flame,
  CheckCircle2,
  Target,
  Gamepad2,
  BookOpen,
  PlusCircle,
  KeyRound,
  UploadCloud,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { UserStats } from '../types/quiz.ts';

interface LandingHeroProps {
  stats: UserStats;
  currentRank: number;
  onStartQuiz: () => void;
  onViewLeaderboard: () => void;
  onPlayQuiz: () => void;
  onOpenNotesUpload: () => void;
  onCreateQuiz: () => void;
  onJoinQuizWithCode: (code: string) => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  stats,
  currentRank,
  onStartQuiz,
  onViewLeaderboard,
  onPlayQuiz,
  onOpenNotesUpload,
  onCreateQuiz,
  onJoinQuizWithCode,
}) => {
  const [quizCodeInput, setQuizCodeInput] = useState('');
  const [codeError, setCodeError] = useState('');

  // If user hasn't played yet, display realistic initial benchmarks that update immediately
  const displayQuizzes = stats.totalQuizzes;
  const displayQuestions = stats.totalQuestionsAnswered;
  const displayScore = stats.totalPoints;
  const displayRank = stats.totalQuizzes > 0 ? `#${currentRank}` : `#${currentRank || 13}`;

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizCodeInput.trim()) {
      setCodeError('Please enter a quiz code.');
      return;
    }
    setCodeError('');
    onJoinQuizWithCode(quizCodeInput.trim());
  };

  return (
    <section className="relative pt-10 pb-16 md:pt-16 md:pb-20 overflow-hidden">
      {/* Background ambient radial glow */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-indigo-600/15 via-purple-600/10 to-transparent blur-3xl pointer-events-none rounded-full"
        aria-hidden="true"
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        {/* Subtle unboxed metadata kicker */}
        <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-indigo-400 uppercase mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>QUIZORA ARENA</span>
          <span aria-hidden="true">·</span>
          <span>PLAY · COMPETE · CLIMB</span>
        </div>

        {/* Hero Headline */}
        <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.08] text-balance">
          Think you know it? <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-indigo-200 bg-clip-text text-transparent">
            Prove it.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed text-balance">
          Pick a category, challenge yourself, and climb the leaderboard.
        </p>

        {/* Action CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto">
          <button
            onClick={onStartQuiz}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/40 hover:-translate-y-0.5 active:translate-y-0 transition-all text-sm sm:text-base cursor-pointer"
          >
            <span>START QUIZ</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            onClick={onViewLeaderboard}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 text-slate-200 hover:text-white border border-slate-700/80 hover:border-slate-600 font-semibold transition-all text-sm sm:text-base cursor-pointer"
          >
            <Trophy className="w-5 h-5 text-amber-400" />
            <span>VIEW LEADERBOARD</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* CHOOSE HOW YOU WANT TO QUIZ (3 Prominent Cards) */}
        {/* ========================================================================= */}
        <div className="mt-14 sm:mt-16 text-left">
          <div className="text-center mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
              Modes & Creation
            </span>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight mt-1">
              CHOOSE HOW YOU WANT TO QUIZ
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto mt-1">
              Select your path: challenge built-in arenas, convert notes with AI, or build custom quizzes for your class.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Card 1: PLAY A QUIZ */}
            <div className="bg-[#111827] border border-slate-800 hover:border-indigo-500/50 rounded-3xl p-6 shadow-xl flex flex-col justify-between transition-all duration-200 hover:-translate-y-1">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-600/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mb-5">
                  <Gamepad2 className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-xl text-white">
                  PLAY A QUIZ
                </h3>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                  Choose a category and challenge yourself.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={onPlayQuiz}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs sm:text-sm transition-all cursor-pointer"
                >
                  <Gamepad2 className="w-4 h-4 text-indigo-400" />
                  <span>PLAY NOW</span>
                </button>
              </div>
            </div>

            {/* Card 2: QUIZ FROM MY NOTES (Visually stands out slightly with purple AI glow/badge) */}
            <div className="bg-gradient-to-b from-[#131b31] to-[#0f172a] border-2 border-indigo-500/60 shadow-xl shadow-indigo-950/50 rounded-3xl p-6 flex flex-col justify-between relative transition-all duration-200 hover:-translate-y-1">
              {/* AI Featured Badge */}
              <div className="absolute -top-3 right-6 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-md shadow-indigo-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>AI POWERED</span>
              </div>

              <div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/30 to-purple-500/30 border border-indigo-400/40 text-indigo-300 flex items-center justify-center mb-5">
                  <BookOpen className="w-6 h-6 text-indigo-300" />
                </div>
                <h3 className="font-display font-bold text-xl text-white flex items-center gap-2">
                  <span>QUIZ FROM MY NOTES</span>
                </h3>
                <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                  Upload your study material and let AI turn it into a personalized quiz.
                </p>
                <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-950/60 border border-indigo-500/30 text-[11px] font-medium text-indigo-300">
                  <FileText className="w-3 h-3 text-indigo-400" />
                  <span>PDF • DOCX • TXT • Images</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-indigo-500/30">
                <button
                  type="button"
                  onClick={onOpenNotesUpload}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>UPLOAD & GENERATE</span>
                </button>
              </div>
            </div>

            {/* Card 3: CREATE A QUIZ */}
            <div className="bg-[#111827] border border-slate-800 hover:border-indigo-500/50 rounded-3xl p-6 shadow-xl flex flex-col justify-between transition-all duration-200 hover:-translate-y-1">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-purple-600/15 border border-purple-500/30 text-purple-400 flex items-center justify-center mb-5">
                  <PlusCircle className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-xl text-white">
                  CREATE A QUIZ
                </h3>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                  Create, share and analyze quizzes for your class or group.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={onCreateQuiz}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs sm:text-sm transition-all cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4 text-purple-400" />
                  <span>CREATE QUIZ</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* HAVE A QUIZ CODE? (Horizontal Section) */}
        {/* ========================================================================= */}
        <div className="mt-6 p-6 sm:p-7 rounded-3xl bg-[#111827] border border-slate-800 text-left relative overflow-hidden shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                  Quick Join
                </div>
                <h3 className="font-display font-bold text-xl text-white mt-0.5">
                  HAVE A QUIZ CODE?
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Join a quiz created by your teacher or friend.
                </p>
                <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
                  <span>Available codes:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setQuizCodeInput('CODE-101');
                      setCodeError('');
                    }}
                    className="font-mono-tabular text-indigo-400 hover:text-indigo-300 underline underline-offset-2"
                  >
                    CODE-101
                  </button>
                  <span>·</span>
                  <button
                    type="button"
                    onClick={() => {
                      setQuizCodeInput('DB-201');
                      setCodeError('');
                    }}
                    className="font-mono-tabular text-indigo-400 hover:text-indigo-300 underline underline-offset-2"
                  >
                    DB-201
                  </button>
                  <span>·</span>
                  <button
                    type="button"
                    onClick={() => {
                      setQuizCodeInput('BIO-105');
                      setCodeError('');
                    }}
                    className="font-mono-tabular text-indigo-400 hover:text-indigo-300 underline underline-offset-2"
                  >
                    BIO-105
                  </button>
                </div>
              </div>
            </div>

            <form onSubmit={handleJoinSubmit} className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
              <div className="w-full sm:w-64">
                <input
                  type="text"
                  value={quizCodeInput}
                  onChange={(e) => {
                    setQuizCodeInput(e.target.value.toUpperCase());
                    if (codeError) setCodeError('');
                  }}
                  placeholder="Enter Quiz Code (e.g. CODE-101)"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm font-mono-tabular uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  aria-label="Enter Quiz Code"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition-all cursor-pointer whitespace-nowrap active:scale-95"
              >
                <span>JOIN QUIZ</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {codeError && (
            <div className="mt-3 flex items-center gap-1.5 text-xs text-rose-400 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{codeError}</span>
            </div>
          )}
        </div>

        {/* Real-time stats band below hero */}
        <div className="mt-12 sm:mt-16 pt-8 border-t border-slate-800/80 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 text-left">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 sm:p-5 relative overflow-hidden group hover:border-indigo-500/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                Total Quizzes
              </span>
              <Target className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-display font-extrabold text-white font-mono-tabular">
              {displayQuizzes}
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {stats.totalQuizzes === 0 ? 'Ready for your first round' : 'Games completed'}
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 sm:p-5 relative overflow-hidden group hover:border-indigo-500/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                Questions Answered
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-display font-extrabold text-white font-mono-tabular">
              {displayQuestions}
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {stats.totalQuestionsAnswered > 0
                ? `${Math.round((stats.totalCorrect / stats.totalQuestionsAnswered) * 100)}% accuracy rate`
                : 'Across all 6 categories'}
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 sm:p-5 relative overflow-hidden group hover:border-indigo-500/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                Total Score
              </span>
              <Flame className="w-4 h-4 text-amber-400" />
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-display font-extrabold text-white font-mono-tabular">
              {displayScore} <span className="text-sm font-normal text-slate-400">pts</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {stats.bestStreak > 0 ? `Best streak: ${stats.bestStreak} in a row` : 'Score 10-30 pts per question'}
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 sm:p-5 relative overflow-hidden group hover:border-indigo-500/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                Current Rank
              </span>
              <Trophy className="w-4 h-4 text-purple-400" />
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-display font-extrabold text-white font-mono-tabular text-indigo-400">
              {displayRank}
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {stats.totalPoints > 0 ? 'Climbing the global ladder' : 'Play to climb the ladder'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
