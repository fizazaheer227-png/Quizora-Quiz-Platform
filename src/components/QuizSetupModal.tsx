import React, { useState } from 'react';
import { X, Play, Clock, Sparkles, BookOpen, Layers } from 'lucide-react';
import { CategoryId, Difficulty, Question, QuizConfig, QuizMode } from '../types/quiz.ts';
import { CATEGORIES } from '../data/questions.ts';
import { NotesQuizSection } from './NotesQuizSection.tsx';

interface QuizSetupModalProps {
  initialCategoryId: CategoryId;
  onClose: () => void;
  onStartQuiz: (config: QuizConfig) => void;
  onStartNotesQuiz?: (config: QuizConfig, questions: Question[]) => void;
}

export const QuizSetupModal: React.FC<QuizSetupModalProps> = ({
  initialCategoryId,
  onClose,
  onStartQuiz,
  onStartNotesQuiz,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>(initialCategoryId);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [mode, setMode] = useState<QuizMode>('classic');
  const [activeSetupTab, setActiveSetupTab] = useState<'notes' | 'category'>('notes');

  const currentCategory = CATEGORIES.find((c) => c.id === selectedCategory) || CATEGORIES[0];

  const handleStartCategoryChallenge = () => {
    onStartQuiz({
      category: selectedCategory,
      difficulty,
      questionCount,
      mode,
    });
  };

  const handleNotesQuizStart = (config: QuizConfig, questions: Question[]) => {
    if (onStartNotesQuiz) {
      onStartNotesQuiz(config, questions);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#111827] border border-slate-700/80 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden relative max-h-[92vh] flex flex-col">
        {/* Header Banner */}
        <div className="p-5 sm:p-6 border-b border-slate-800 bg-slate-900/60 flex items-start justify-between shrink-0">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Challenge Configuration</span>
            </div>
            <h2 className="font-display text-2xl font-extrabold text-white">
              Quiz Setup
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Choose between creating a quiz from your own study notes or playing Quizora categories.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            aria-label="Close setup modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: Notes vs Category */}
        <div className="px-5 sm:px-6 pt-4 shrink-0">
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-900 border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveSetupTab('notes')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeSetupTab === 'notes'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>QUIZ FROM MY NOTES</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSetupTab('category')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeSetupTab === 'category'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>CHOOSE A CATEGORY</span>
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* OPTION 1: QUIZ FROM MY NOTES */}
          {activeSetupTab === 'notes' && (
            <NotesQuizSection
              isCompactMode={true}
              onStartNotesQuiz={handleNotesQuizStart}
            />
          )}

          {/* OPTION 2: CATEGORY QUIZ */}
          {activeSetupTab === 'category' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Category Quick Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
                  Category
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CATEGORIES.map((cat) => {
                    const isSelected = cat.id === selectedCategory;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-3 py-2.5 rounded-xl text-xs font-medium border text-left transition-all truncate ${
                          isSelected
                            ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-semibold ring-1 ring-indigo-500/40'
                            : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        {cat.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Difficulty Selector */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Difficulty
                  </label>
                  <span className="text-xs text-slate-500">
                    {difficulty === 'easy'
                      ? '10 pts per answer'
                      : difficulty === 'medium'
                      ? '20 pts per answer'
                      : '30 pts per answer'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2.5">
                  {(['easy', 'medium', 'hard'] as Difficulty[]).map((level) => {
                    const isSelected = difficulty === level;
                    const label = level === 'easy' ? 'Easy' : level === 'medium' ? 'Medium' : 'Hard';
                    const points = level === 'easy' ? '+10 pts' : level === 'medium' ? '+20 pts' : '+30 pts';

                    return (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setDifficulty(level)}
                        className={`py-3 px-3 rounded-xl border text-center transition-all ${
                          isSelected
                            ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm ring-1 ring-indigo-500/40'
                            : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                        }`}
                      >
                        <div className="text-sm font-semibold capitalize text-white">{label}</div>
                        <div className="text-[11px] text-indigo-400 font-mono-tabular mt-0.5">{points}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Number of Questions */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
                  Number of Questions
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[5, 10, 15].map((count) => {
                    const isSelected = questionCount === count;
                    return (
                      <button
                        key={count}
                        type="button"
                        onClick={() => setQuestionCount(count)}
                        className={`py-2.5 px-3 rounded-xl border text-center font-semibold transition-all ${
                          isSelected
                            ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm ring-1 ring-indigo-500/40'
                            : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                        }`}
                      >
                        <span className="text-base font-mono-tabular">{count}</span>
                        <span className="text-xs text-slate-400 ml-1 font-normal">Questions</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quiz Mode */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
                  Quiz Mode
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setMode('classic')}
                    className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 ${
                      mode === 'classic'
                        ? 'bg-indigo-600/20 border-indigo-500 text-white ring-1 ring-indigo-500/40'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <div className="p-2 rounded-lg bg-slate-800 text-indigo-400 shrink-0 mt-0.5">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">Classic</div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        No overall time pressure. Think carefully at your own pace.
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode('timed')}
                    className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 ${
                      mode === 'timed'
                        ? 'bg-indigo-600/20 border-indigo-500 text-white ring-1 ring-indigo-500/40'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <div className="p-2 rounded-lg bg-slate-800 text-amber-400 shrink-0 mt-0.5">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">Timed</div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        15 seconds countdown per question. Fast reflexes required.
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Footer (for category mode) */}
        {activeSetupTab === 'category' && (
          <div className="p-5 sm:p-6 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between gap-4 shrink-0">
            <div className="text-xs text-slate-400 hidden sm:block">
              <span>Selected: {currentCategory.name}</span>
              <span className="mx-1.5" aria-hidden="true">·</span>
              <span className="capitalize">{difficulty}</span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStartCategoryChallenge}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all hover:-translate-y-0.5 active:translate-y-0"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>START CHALLENGE</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
