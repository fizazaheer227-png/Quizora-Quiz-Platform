import React from 'react';
import {
  Cpu,
  Atom,
  Globe,
  Film,
  Trophy,
  Terminal,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { CATEGORIES, QUESTION_BANK } from '../data/questions.ts';
import { CategoryId, Question, QuizConfig, UserStats } from '../types/quiz.ts';
import { NotesQuizSection } from './NotesQuizSection.tsx';

interface CategoryGridProps {
  stats: UserStats;
  onSelectCategory: (categoryId: CategoryId) => void;
  onStartNotesQuiz?: (config: QuizConfig, questions: Question[]) => void;
  showNotesUpload?: boolean;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({
  stats,
  onSelectCategory,
  onStartNotesQuiz,
  showNotesUpload = true,
}) => {
  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Cpu':
        return <Cpu className="w-6 h-6 text-indigo-400" />;
      case 'Atom':
        return <Atom className="w-6 h-6 text-emerald-400" />;
      case 'Globe':
        return <Globe className="w-6 h-6 text-amber-400" />;
      case 'Film':
        return <Film className="w-6 h-6 text-rose-400" />;
      case 'Trophy':
        return <Trophy className="w-6 h-6 text-purple-400" />;
      case 'Terminal':
        return <Terminal className="w-6 h-6 text-cyan-400" />;
      default:
        return <Sparkles className="w-6 h-6 text-indigo-400" />;
    }
  };

  return (
    <section className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* 1. QUIZ FROM MY NOTES SECTION */}
      {showNotesUpload && onStartNotesQuiz && (
        <div className="mb-12">
          <NotesQuizSection onStartNotesQuiz={onStartNotesQuiz} />

          {/* OR DIVIDER */}
          <div className="relative my-12 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative px-6 bg-[#0B0F19] text-xs font-bold uppercase tracking-widest text-slate-400">
              OR
            </div>
          </div>
        </div>
      )}

      {/* 2. CHOOSE A QUIZ CATEGORY */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <span className="text-xs font-semibold tracking-wider text-indigo-400 uppercase">
            Curated Arenas
          </span>
          <h2 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
            CHOOSE A QUIZ CATEGORY
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Pick a knowledge domain to configure difficulty and question length.
          </p>
        </div>
        <div className="text-xs text-slate-400">
          <span>{QUESTION_BANK.length} Total Curated Questions</span>
          <span className="mx-2" aria-hidden="true">·</span>
          <span>Instant Feedback</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {CATEGORIES.map((cat) => {
          const categoryQuestionsCount = QUESTION_BANK.filter((q) => q.category === cat.id).length;
          const userCatStat = stats.categoryStats[cat.id];
          const hasPlayed = userCatStat && userCatStat.quizzes > 0;

          return (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className="group relative bg-[#111827]/80 hover:bg-[#151E33] border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-6 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-indigo-950/40 hover:-translate-y-1 flex flex-col justify-between"
            >
              <div>
                {/* Header row: Icon & Question Count */}
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700/60 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                    {getCategoryIcon(cat.icon)}
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono-tabular font-medium text-slate-400">
                      {categoryQuestionsCount} questions
                    </span>
                    {hasPlayed && (
                      <p className="text-[11px] text-indigo-400 font-mono-tabular">
                        {userCatStat.points} pts scored
                      </p>
                    )}
                  </div>
                </div>

                {/* Category Title & Description */}
                <h3 className="mt-5 font-display text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">
                  {cat.name}
                </h3>
                <p className="mt-2 text-sm text-slate-400 line-clamp-2 leading-relaxed">
                  {cat.description}
                </p>
              </div>

              {/* Card Footer CTA */}
              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-indigo-400 group-hover:text-indigo-300">
                <span>Configure Quiz</span>
                <div className="w-7 h-7 rounded-full bg-slate-800/80 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center transition-all duration-200">
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
