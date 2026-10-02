import React, { useState } from 'react';
import {
  KeyRound,
  X,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Play,
  Layers,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { CustomQuiz } from '../types/quiz.ts';
import { findCustomQuizByCode, getStoredCustomQuizzes } from '../utils/storage.ts';

interface JoinQuizModalProps {
  initialCode?: string;
  onClose: () => void;
  onJoinQuiz: (quiz: CustomQuiz) => void;
}

export const JoinQuizModal: React.FC<JoinQuizModalProps> = ({
  initialCode = '',
  onClose,
  onJoinQuiz,
}) => {
  const [code, setCode] = useState(initialCode.toUpperCase());
  const [error, setError] = useState('');
  const [foundQuiz, setFoundQuiz] = useState<CustomQuiz | null>(() => {
    if (initialCode) {
      return findCustomQuizByCode(initialCode) || null;
    }
    return null;
  });

  const availableQuizzes = getStoredCustomQuizzes();

  const handleLookup = (lookupCode: string) => {
    setError('');
    const target = findCustomQuizByCode(lookupCode);
    if (!target) {
      setError(`No active quiz found with code "${lookupCode}". Check the code and try again.`);
      setFoundQuiz(null);
      return;
    }
    setFoundQuiz(target);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError('Please enter a quiz code.');
      return;
    }
    handleLookup(code);
  };

  const handleStartFoundQuiz = () => {
    if (foundQuiz) {
      onJoinQuiz(foundQuiz);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#111827] border border-slate-700/80 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 bg-slate-900/60 flex items-start justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                Join with Code
              </div>
              <h2 className="font-display font-bold text-xl sm:text-2xl text-white">
                Enter Quiz Code
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Enter Quiz Code
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase());
                  setError('');
                }}
                placeholder="e.g. CODE-101, DB-201, BIO-105"
                className="flex-1 px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm font-mono-tabular uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoFocus
              />
              <button
                type="submit"
                className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition-all cursor-pointer whitespace-nowrap active:scale-95"
              >
                Find Quiz
              </button>
            </div>
          </form>

          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* FOUND QUIZ CARD */}
          {foundQuiz && (
            <div className="p-5 rounded-2xl bg-indigo-950/40 border-2 border-indigo-500/50 space-y-4 animate-in fade-in duration-200">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 px-2 py-0.5 rounded-md bg-indigo-900/60 border border-indigo-500/30">
                    {foundQuiz.category} · Code: {foundQuiz.code}
                  </span>
                  <h3 className="font-display font-bold text-lg text-white mt-1">
                    {foundQuiz.title}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    {foundQuiz.description}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Created by <span className="text-white font-medium">{foundQuiz.authorName}</span>
                  </p>
                </div>
              </div>

              {/* Stats badges */}
              <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 text-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase">Questions</span>
                  <div className="font-bold text-white font-mono-tabular mt-0.5">
                    {foundQuiz.questions.length}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase">Difficulty</span>
                  <div className="font-bold text-indigo-300 capitalize mt-0.5">
                    {foundQuiz.difficulty}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase">Mode</span>
                  <div className="font-bold text-white capitalize mt-0.5">
                    {foundQuiz.mode}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleStartFoundQuiz}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all active:scale-95 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>START QUIZ CHALLENGE</span>
              </button>
            </div>
          )}

          {/* QUICK AVAILABLE QUIZZES LIST */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Or pick an available public quiz:
            </span>

            <div className="space-y-2">
              {availableQuizzes.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setCode(item.code);
                    handleLookup(item.code);
                  }}
                  className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-indigo-500/50 flex items-center justify-between gap-3 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-mono-tabular text-xs font-bold">
                      {item.code.slice(0, 2)}
                    </div>
                    <div>
                      <div className="font-semibold text-white text-xs sm:text-sm">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono-tabular">
                        Code: <span className="text-indigo-300 font-bold">{item.code}</span> · {item.questions.length} questions
                      </div>
                    </div>
                  </div>

                  <span className="text-xs font-semibold text-indigo-400">Select &rarr;</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
