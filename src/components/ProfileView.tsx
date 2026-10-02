import React, { useState } from 'react';
import {
  User,
  Check,
  Edit2,
  Calendar,
  Award,
  Trophy,
  Target,
  Sparkles,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';
import { UserProfile, UserStats } from '../types/quiz.ts';

interface ProfileViewProps {
  profile: UserProfile;
  stats: UserStats;
  unlockedAchievementsCount: number;
  currentRank: number;
  onUpdateProfile: (updated: UserProfile) => void;
  onResetData: () => void;
}

const AVATAR_GRADIENTS = [
  { label: 'Indigo Velvet', value: 'from-indigo-600 to-violet-600' },
  { label: 'Neon Cyan', value: 'from-cyan-600 to-blue-600' },
  { label: 'Emerald Mint', value: 'from-emerald-600 to-teal-600' },
  { label: 'Sunset Amber', value: 'from-amber-600 to-rose-600' },
  { label: 'Berry Violet', value: 'from-purple-600 to-pink-600' },
  { label: 'Crimson Rose', value: 'from-rose-600 to-red-600' },
];

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  stats,
  unlockedAchievementsCount,
  currentRank,
  onUpdateProfile,
  onResetData,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(profile.name);
  const [username, setUsername] = useState(profile.username);
  const [avatarColor, setAvatarColor] = useState(profile.avatarColor);
  const [bio, setBio] = useState(profile.bio || '');
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const getInitials = (text: string) => {
    return text
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'Q';
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...profile,
      name: name.trim() || 'Player One',
      username: username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '') || 'player1',
      avatarColor,
      bio: bio.trim(),
    };
    onUpdateProfile(updated);
    setIsEditing(false);
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-in fade-in duration-200">
      {/* Toast Feedback */}
      {showSavedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-in slide-in-from-bottom-2">
          <Check className="w-4 h-4" />
          <span>Profile updated successfully</span>
        </div>
      )}

      {/* Main Profile Card */}
      <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden mb-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 pb-8 border-b border-slate-800/80">
          {/* Avatar with Initials */}
          <div className="relative group">
            <div
              className={`w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr ${avatarColor} flex items-center justify-center text-3xl sm:text-4xl font-extrabold text-white shadow-2xl ring-4 ring-slate-800/60`}
            >
              {getInitials(name)}
            </div>
            <div className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-[10px] font-bold text-indigo-400">
              #{currentRank || 13}
            </div>
          </div>

          {/* User Info Header */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {profile.name}
                </h1>
                <p className="text-sm font-medium text-indigo-400">
                  @{profile.username}
                </p>
              </div>

              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>

            <p className="mt-3 text-sm text-slate-300 max-w-xl leading-relaxed">
              {profile.bio || 'Quizora competitor sharpening mind and memory across all knowledge domains.'}
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Joined Quizora {profile.joinedDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Core Summary Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 text-center sm:text-left">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">
              Joined Quizora
            </span>
            <div className="mt-1 text-base sm:text-lg font-bold text-white">
              {profile.joinedDate}
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">
              Total Quizzes
            </span>
            <div className="mt-1 text-xl sm:text-2xl font-extrabold font-mono-tabular text-white">
              {stats.totalQuizzes}
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">
              Total Points
            </span>
            <div className="mt-1 text-xl sm:text-2xl font-extrabold font-mono-tabular text-indigo-300">
              {stats.totalPoints}
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">
              Achievements
            </span>
            <div className="mt-1 text-xl sm:text-2xl font-extrabold font-mono-tabular text-amber-400">
              {unlockedAchievementsCount}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Edit Form Card */}
      {isEditing && (
        <form
          onSubmit={handleSave}
          className="bg-[#111827] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 mb-8 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="font-display font-bold text-lg text-white">Edit Profile Details</h2>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={30}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Username
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
                  @
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  maxLength={20}
                  required
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Bio / Tagline
            </label>
            <input
              type="text"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={120}
              placeholder="Tell others what you love about quizzing..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Avatar Color Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Avatar Theme Gradient
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
              {AVATAR_GRADIENTS.map((grad) => {
                const isSelected = avatarColor === grad.value;
                return (
                  <button
                    key={grad.value}
                    type="button"
                    onClick={() => setAvatarColor(grad.value)}
                    className={`h-11 rounded-xl bg-gradient-to-tr ${grad.value} flex items-center justify-center transition-all ${
                      isSelected
                        ? 'ring-2 ring-white scale-105 shadow-lg'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                    title={grad.label}
                  >
                    {isSelected && <Check className="w-4 h-4 text-white" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30"
            >
              Save Changes
            </button>
          </div>
        </form>
      )}

      {/* Danger Zone: Reset Data */}
      <div className="bg-[#111827]/60 border border-slate-800/80 rounded-3xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-display font-bold text-sm text-slate-300">
              Reset Local Storage Progress
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Clear your quiz match history, personal stats, and restored demo records.
            </p>
          </div>

          {confirmReset ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onResetData();
                  setConfirmReset(false);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow"
              >
                Confirm Reset
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-800 hover:border-rose-900/50 hover:bg-rose-950/20 text-slate-400 hover:text-rose-400 text-xs font-medium transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Game Data</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
