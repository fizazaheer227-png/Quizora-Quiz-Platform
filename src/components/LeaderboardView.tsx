import React, { useState } from 'react';
import {
  Trophy,
  Medal,
  Flame,
  Target,
  Sparkles,
  User,
  Crown,
  Search,
} from 'lucide-react';
import { CategoryId, LeaderboardEntry } from '../types/quiz.ts';
import { CATEGORIES } from '../data/questions.ts';

interface LeaderboardViewProps {
  entries: LeaderboardEntry[];
  currentUsername: string;
}

type LeaderboardTab = 'overall' | CategoryId;

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ entries, currentUsername }) => {
  const [activeTab, setActiveTab] = useState<LeaderboardTab>('overall');
  const [searchQuery, setSearchQuery] = useState('');

  // Tab definitions
  const tabs: { id: LeaderboardTab; label: string }[] = [
    { id: 'overall', label: 'Overall' },
    ...CATEGORIES.map((c) => ({ id: c.id as LeaderboardTab, label: c.name })),
  ];

  // Calculate scores and ranks based on active tab
  const processedEntries: LeaderboardEntry[] = [...entries]
    .map((entry) => {
      let activeScore = entry.score;
      if (activeTab !== 'overall') {
        activeScore = entry.categoryScores[activeTab] || 0;
      }
      return {
        ...entry,
        displayScore: activeScore,
      };
    })
    .sort((a, b) => b.displayScore - a.displayScore)
    .map((item, index) => ({
      ...item,
      rank: index + 1,
      score: item.displayScore,
    }));

  // Filter with search query
  const filteredEntries = processedEntries.filter(
    (e) =>
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const topThree = filteredEntries.slice(0, 3);
  const remainingEntries = filteredEntries.slice(3);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-in fade-in duration-200">
      {/* Top Heading */}
      <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>Global Standings</span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
          LEADERBOARD
        </h1>
        <p className="mt-2 text-slate-400 text-sm sm:text-base">
          See who&apos;s ruling Quizora.
        </p>
      </div>

      {/* Category Tabs Bar */}
      <div className="flex items-center gap-1.5 p-1.5 bg-[#111827] border border-slate-800 rounded-2xl overflow-x-auto scrollbar-none mb-8">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Top 3 Podium Showcase */}
      {topThree.length >= 3 && !searchQuery && (
        <div className="grid grid-cols-3 gap-2 sm:gap-6 mb-12 max-w-3xl mx-auto items-end pt-8">
          {/* 2nd Place */}
          <div className="order-1 flex flex-col items-center">
            <div className="relative group">
              <div
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr ${topThree[1].avatarColor} flex items-center justify-center text-lg sm:text-2xl font-extrabold text-white shadow-xl ring-2 ring-slate-400/40`}
              >
                {getInitials(topThree[1].name)}
              </div>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-slate-300 text-slate-900 text-[11px] font-bold shadow">
                2nd
              </div>
            </div>
            <div className="mt-3 text-center">
              <div className="text-xs sm:text-sm font-bold text-white truncate max-w-[90px] sm:max-w-[130px] flex items-center justify-center gap-1">
                <span>{topThree[1].name}</span>
                {topThree[1].isUser && (
                  <span className="text-[10px] text-indigo-400 font-normal">(You)</span>
                )}
              </div>
              <div className="text-xs sm:text-sm font-mono-tabular font-extrabold text-indigo-300 mt-0.5">
                {topThree[1].score} <span className="text-[10px] font-normal text-slate-400">pts</span>
              </div>
              <div className="text-[11px] text-slate-500 font-mono-tabular">
                {topThree[1].accuracy}% acc
              </div>
            </div>
            <div className="w-full h-20 sm:h-24 mt-3 rounded-t-2xl bg-slate-800/80 border-t border-x border-slate-700/60 flex items-center justify-center">
              <span className="font-display text-2xl sm:text-3xl font-extrabold text-slate-400">2</span>
            </div>
          </div>

          {/* 1st Place (Taller Center) */}
          <div className="order-2 flex flex-col items-center -mt-6">
            <div className="relative group">
              <Crown className="w-6 h-6 text-amber-400 absolute -top-7 left-1/2 -translate-x-1/2 animate-bounce" />
              <div
                className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr ${topThree[0].avatarColor} flex items-center justify-center text-2xl sm:text-3xl font-extrabold text-white shadow-2xl ring-4 ring-amber-400/60`}
              >
                {getInitials(topThree[0].name)}
              </div>
              <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-xs font-black shadow-lg">
                1st
              </div>
            </div>
            <div className="mt-4 text-center">
              <div className="text-sm sm:text-base font-bold text-white truncate max-w-[110px] sm:max-w-[150px] flex items-center justify-center gap-1">
                <span>{topThree[0].name}</span>
                {topThree[0].isUser && (
                  <span className="text-[10px] text-indigo-400 font-normal">(You)</span>
                )}
              </div>
              <div className="text-sm sm:text-base font-mono-tabular font-extrabold text-amber-300 mt-0.5">
                {topThree[0].score} <span className="text-xs font-normal text-slate-400">pts</span>
              </div>
              <div className="text-xs text-slate-400 font-mono-tabular">
                {topThree[0].accuracy}% acc · {topThree[0].quizzesPlayed} games
              </div>
            </div>
            <div className="w-full h-28 sm:h-32 mt-3 rounded-t-2xl bg-gradient-to-t from-amber-500/20 to-indigo-900/40 border-t border-x border-amber-500/40 flex items-center justify-center">
              <span className="font-display text-3xl sm:text-4xl font-extrabold text-amber-400">1</span>
            </div>
          </div>

          {/* 3rd Place */}
          <div className="order-3 flex flex-col items-center">
            <div className="relative group">
              <div
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr ${topThree[2].avatarColor} flex items-center justify-center text-lg sm:text-2xl font-extrabold text-white shadow-xl ring-2 ring-amber-700/50`}
              >
                {getInitials(topThree[2].name)}
              </div>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-amber-700 text-amber-100 text-[11px] font-bold shadow">
                3rd
              </div>
            </div>
            <div className="mt-3 text-center">
              <div className="text-xs sm:text-sm font-bold text-white truncate max-w-[90px] sm:max-w-[130px] flex items-center justify-center gap-1">
                <span>{topThree[2].name}</span>
                {topThree[2].isUser && (
                  <span className="text-[10px] text-indigo-400 font-normal">(You)</span>
                )}
              </div>
              <div className="text-xs sm:text-sm font-mono-tabular font-extrabold text-indigo-300 mt-0.5">
                {topThree[2].score} <span className="text-[10px] font-normal text-slate-400">pts</span>
              </div>
              <div className="text-[11px] text-slate-500 font-mono-tabular">
                {topThree[2].accuracy}% acc
              </div>
            </div>
            <div className="w-full h-16 sm:h-20 mt-3 rounded-t-2xl bg-slate-800/60 border-t border-x border-slate-700/60 flex items-center justify-center">
              <span className="font-display text-xl sm:text-2xl font-extrabold text-slate-400">3</span>
            </div>
          </div>
        </div>
      )}

      {/* Table Container with Search Header */}
      <div className="bg-[#111827] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs sm:text-sm text-slate-400">
            <span>Showing top ranking competitors</span>
            <span className="mx-2" aria-hidden="true">·</span>
            <span className="text-indigo-400 font-mono-tabular font-semibold">
              {filteredEntries.length} Players
            </span>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search player name..."
              className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider bg-slate-900/60">
                <th className="py-3.5 pl-6 pr-3 font-semibold">Rank</th>
                <th className="py-3.5 px-4 font-semibold">Player</th>
                <th className="py-3.5 px-4 font-semibold text-right">Score</th>
                <th className="py-3.5 px-4 font-semibold text-right hidden sm:table-cell">Accuracy</th>
                <th className="py-3.5 px-4 font-semibold text-right hidden md:table-cell">Quizzes</th>
                <th className="py-3.5 pl-4 pr-6 font-semibold text-right">Best Streak</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredEntries.map((player) => {
                const isCurrentUser = player.isUser || player.username === currentUsername;

                return (
                  <tr
                    key={player.id}
                    className={`transition-colors ${
                      isCurrentUser
                        ? 'bg-indigo-600/15 hover:bg-indigo-600/25 border-l-4 border-l-indigo-500'
                        : 'hover:bg-slate-800/40'
                    }`}
                  >
                    {/* Rank */}
                    <td className="py-4 pl-6 pr-3 whitespace-nowrap font-mono-tabular font-bold">
                      <div className="flex items-center gap-1.5">
                        {player.rank === 1 ? (
                          <span className="text-amber-400 font-extrabold flex items-center gap-1">
                            <Crown className="w-3.5 h-3.5" /> 1
                          </span>
                        ) : player.rank === 2 ? (
                          <span className="text-slate-300 font-bold">2</span>
                        ) : player.rank === 3 ? (
                          <span className="text-amber-600 font-bold">3</span>
                        ) : (
                          <span className="text-slate-400">#{player.rank}</span>
                        )}
                      </div>
                    </td>

                    {/* Player */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full bg-gradient-to-tr ${player.avatarColor} flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-sm`}
                        >
                          {getInitials(player.name)}
                        </div>
                        <div>
                          <div className="font-semibold text-white flex items-center gap-2">
                            <span>{player.name}</span>
                            {isCurrentUser && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            @{player.username}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Score */}
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <div className="font-mono-tabular font-extrabold text-white sm:text-base">
                        {player.score.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-500 font-normal">pts</div>
                    </td>

                    {/* Accuracy */}
                    <td className="py-4 px-4 text-right whitespace-nowrap hidden sm:table-cell">
                      <span className="font-mono-tabular font-medium text-slate-300">
                        {player.accuracy}%
                      </span>
                    </td>

                    {/* Quizzes Played */}
                    <td className="py-4 px-4 text-right whitespace-nowrap hidden md:table-cell">
                      <span className="font-mono-tabular text-slate-400">
                        {player.quizzesPlayed}
                      </span>
                    </td>

                    {/* Best Streak */}
                    <td className="py-4 pl-4 pr-6 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1 font-mono-tabular text-amber-300 font-semibold">
                        <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span>{player.bestStreak}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
