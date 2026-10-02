import React from 'react';
import {
  Award,
  Footprints,
  Target,
  Flame,
  Compass,
  Crown,
  Zap,
  Sparkles,
  Lock,
  CheckCircle,
} from 'lucide-react';
import { Achievement } from '../types/quiz.ts';

interface AchievementsViewProps {
  achievements: Achievement[];
}

export const AchievementsView: React.FC<AchievementsViewProps> = ({ achievements }) => {
  const unlockedCount = achievements.filter((a) => a.isUnlocked).length;
  const progressPercent = Math.round((unlockedCount / achievements.length) * 100);

  const getAchievementIcon = (iconName: string, isUnlocked: boolean) => {
    const iconClass = `w-6 h-6 ${isUnlocked ? 'text-amber-400' : 'text-slate-500'}`;
    switch (iconName) {
      case 'Footprints':
        return <Footprints className={iconClass} />;
      case 'Target':
        return <Target className={iconClass} />;
      case 'Flame':
        return <Flame className={iconClass} />;
      case 'Compass':
        return <Compass className={iconClass} />;
      case 'Award':
        return <Award className={iconClass} />;
      case 'Crown':
        return <Crown className={iconClass} />;
      case 'Zap':
        return <Zap className={iconClass} />;
      case 'Sparkles':
        return <Sparkles className={iconClass} />;
      default:
        return <Award className={iconClass} />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-in fade-in duration-200">
      {/* Header with summary card */}
      <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6 sm:p-8 mb-8 sm:mb-10 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Milestones & Badges</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Trophy Room
            </h1>
            <p className="mt-1 text-slate-400 text-sm">
              Unlock badges as you conquer quizzes, maintain streaks, and climb rankings.
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shrink-0 min-w-[200px] text-center sm:text-right">
            <span className="text-xs text-slate-400 uppercase tracking-wide font-medium">
              Progress
            </span>
            <div className="font-display text-3xl font-extrabold text-white font-mono-tabular mt-0.5">
              {unlockedCount} / {achievements.length}
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-400 to-indigo-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {achievements.map((item) => {
          const isUnlocked = item.isUnlocked;

          return (
            <div
              key={item.id}
              className={`rounded-2xl p-5 sm:p-6 border transition-all duration-200 flex flex-col justify-between ${
                isUnlocked
                  ? 'bg-[#111827] border-amber-500/30 shadow-lg shadow-amber-950/20'
                  : 'bg-[#0E1320]/60 border-slate-800/80 opacity-75'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                      isUnlocked
                        ? 'bg-amber-500/10 border-amber-500/30 shadow-md shadow-amber-500/10'
                        : 'bg-slate-900 border-slate-800'
                    }`}
                  >
                    {getAchievementIcon(item.icon, isUnlocked)}
                  </div>

                  {isUnlocked ? (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Unlocked</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/60 border border-slate-700/50 text-slate-400 text-xs font-medium">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Locked</span>
                    </div>
                  )}
                </div>

                <h3
                  className={`mt-4 font-display font-bold text-lg ${
                    isUnlocked ? 'text-white' : 'text-slate-300'
                  }`}
                >
                  {item.title}
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Footer: Progress or Unlock Date */}
              <div className="mt-5 pt-4 border-t border-slate-800/80">
                {isUnlocked ? (
                  <span className="text-[11px] font-mono-tabular text-amber-400/90 font-medium">
                    Unlocked on {item.unlockedAt || 'Recent'}
                  </span>
                ) : item.progress ? (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-400 font-mono-tabular">
                      <span>Progress</span>
                      <span>
                        {item.progress.current} / {item.progress.max}
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-500 h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(
                            100,
                            (item.progress.current / item.progress.max) * 100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <span className="text-[11px] text-slate-500">Incomplete</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
