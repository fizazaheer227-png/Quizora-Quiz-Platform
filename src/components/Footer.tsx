import React from 'react';
import { Sparkles, Trophy, Compass, BarChart3, Award } from 'lucide-react';
import { ActiveTab } from '../types/quiz.ts';

interface FooterProps {
  onNavigate: (tab: ActiveTab) => void;
  onStartQuiz: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onStartQuiz }) => {
  return (
    <footer className="mt-20 border-t border-slate-800/80 bg-[#0B0F19] text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-slate-800/60">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-display font-extrabold text-base tracking-tight text-white">
                QUIZORA
              </span>
            </div>
            <p className="mt-2 text-slate-400 text-xs max-w-sm">
              Play. Compete. Climb. Real-time trivia arena across science, technology, movies, sports, and code.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs font-medium">
            <button
              onClick={() => onNavigate('home')}
              className="text-slate-400 hover:text-white transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => onNavigate('explore')}
              className="text-slate-400 hover:text-white transition-colors"
            >
              Explore Quizzes
            </button>
            <button
              onClick={() => onNavigate('leaderboard')}
              className="text-slate-400 hover:text-white transition-colors"
            >
              Leaderboard
            </button>
            <button
              onClick={() => onNavigate('stats')}
              className="text-slate-400 hover:text-white transition-colors"
            >
              My Stats
            </button>
            <button
              onClick={() => onNavigate('achievements')}
              className="text-slate-400 hover:text-white transition-colors"
            >
              Achievements
            </button>
            <button
              onClick={() => onNavigate('profile')}
              className="text-slate-400 hover:text-white transition-colors"
            >
              Profile
            </button>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-[11px]">
          <div>
            © {new Date().getFullYear()} Quizora. All rights reserved.
          </div>
          <div className="flex items-center gap-2 text-slate-500">
            <span>Client-side persistent storage</span>
            <span aria-hidden="true">·</span>
            <span>Zero external API latency</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
