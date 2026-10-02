import React, { useState } from 'react';
import {
  Trophy,
  Flame,
  Volume2,
  VolumeX,
  Compass,
  BarChart3,
  Award,
  User,
  Home,
  Menu,
  X,
  Sparkles,
  Gamepad2,
  BookOpen,
  PlusCircle,
  KeyRound,
  Layers,
} from 'lucide-react';
import { ActiveTab, UserProfile, UserStats } from '../types/quiz.ts';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  profile: UserProfile;
  stats: UserStats;
  isMuted: boolean;
  setIsMuted: (val: boolean | ((prev: boolean) => boolean)) => void;
  onQuickStart: () => void;
  onOpenJoinModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  profile,
  stats,
  isMuted,
  setIsMuted,
  onQuickStart,
  onOpenJoinModal,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Exact 9 navigation items specified in user request
  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; isAI?: boolean }[] = [
    { id: 'home', label: 'Home', icon: <Home className="w-4 h-4" /> },
    { id: 'explore', label: 'Play Quiz', icon: <Gamepad2 className="w-4 h-4" /> },
    { id: 'notes', label: 'Quiz From My Notes', icon: <BookOpen className="w-4 h-4" />, isAI: true },
    { id: 'create', label: 'Create Quiz', icon: <PlusCircle className="w-4 h-4" /> },
    { id: 'join', label: 'Join Quiz', icon: <KeyRound className="w-4 h-4" /> },
    { id: 'leaderboard', label: 'Leaderboard', icon: <Trophy className="w-4 h-4" /> },
    { id: 'stats', label: 'My Stats', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'my-quizzes', label: 'My Quizzes', icon: <Layers className="w-4 h-4" /> },
    { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
  ];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const handleNavClick = (tab: ActiveTab) => {
    if (tab === 'join' && onOpenJoinModal) {
      onOpenJoinModal();
      setMobileMenuOpen(false);
      return;
    }
    setActiveTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0B0F19]/95 backdrop-blur-md border-b border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Single text element Brand wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-2.5 text-left group focus:outline-none cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-display font-extrabold text-xl tracking-tight text-white group-hover:text-indigo-300 transition-colors">
                  QUIZORA
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links (Desktop - Primary 6 links, others available in My Quizzes/Profile or Hamburger) */}
          <nav className="hidden xl:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600/20 text-indigo-300 ring-1 ring-indigo-500/40 shadow-inner'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.isAI && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold uppercase tracking-wider">
                      AI
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Actions (Sound, Score Pill, Quick Play, Mobile Toggle) */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Sound Toggle */}
            <button
              onClick={() => setIsMuted((prev) => !prev)}
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/80 transition-colors focus:outline-none cursor-pointer"
              aria-label="Toggle sound feedback"
            >
              {isMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
            </button>

            {/* Quick Play CTA */}
            <button
              onClick={onQuickStart}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/25 active:scale-95 transition-all whitespace-nowrap cursor-pointer"
            >
              <Flame className="w-3.5 h-3.5 text-amber-300" />
              <span>Play Now</span>
            </button>

            {/* User Profile Capsule */}
            <button
              onClick={() => handleNavClick('profile')}
              className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors text-left cursor-pointer"
            >
              <div
                className={`w-7 h-7 rounded-full bg-gradient-to-tr ${profile.avatarColor} flex items-center justify-center text-xs font-bold text-white shadow`}
              >
                {getInitials(profile.name)}
              </div>
              <div className="hidden md:flex flex-col">
                <span className="text-xs font-medium text-slate-200 leading-none truncate max-w-[80px]">
                  {profile.name}
                </span>
                <span className="text-[10px] text-indigo-400 font-mono-tabular font-medium">
                  {stats.totalPoints} pts
                </span>
              </div>
            </button>

            {/* Hamburger menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 focus:outline-none cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Hamburger Drawer Menu (Contains all 9 items in exact order) */}
      {mobileMenuOpen && (
        <div className="bg-[#0F1423] border-b border-slate-800 px-4 pt-3 pb-5 space-y-1 shadow-2xl animate-in slide-in-from-top-2 duration-150">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
            Menu Navigation
          </div>
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-400 font-semibold ring-1 ring-indigo-500/30'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.isAI && (
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-extrabold uppercase tracking-wider">
                    AI Feature
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-3 border-t border-slate-800/80 mt-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onQuickStart();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 cursor-pointer"
            >
              <Flame className="w-4 h-4 text-amber-300" />
              <span>Play Now (Quick Start)</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
