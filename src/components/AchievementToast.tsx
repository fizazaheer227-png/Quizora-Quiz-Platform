import React from 'react';
import { Award, Sparkles, X } from 'lucide-react';
import { Achievement } from '../types/quiz.ts';

interface AchievementToastProps {
  achievement: Achievement | null;
  onClose: () => void;
}

export const AchievementToast: React.FC<AchievementToastProps> = ({ achievement, onClose }) => {
  if (!achievement) return null;

  return (
    <div className="fixed top-20 right-4 sm:right-8 z-50 max-w-sm w-full bg-[#111827] border border-amber-500/40 rounded-2xl p-4 shadow-2xl shadow-amber-950/40 animate-in slide-in-from-top-4 duration-300">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
          <Award className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-400 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Achievement Unlocked!</span>
          </div>
          <h4 className="font-display font-bold text-sm text-white mt-0.5 truncate">
            {achievement.title}
          </h4>
          <p className="text-xs text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
            {achievement.description}
          </p>
        </div>

        <button
          onClick={onClose}
          className="text-slate-500 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
