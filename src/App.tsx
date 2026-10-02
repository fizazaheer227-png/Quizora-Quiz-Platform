/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { LandingHero } from './components/LandingHero.tsx';
import { CategoryGrid } from './components/CategoryGrid.tsx';
import { QuizSetupModal } from './components/QuizSetupModal.tsx';
import { QuizScreen } from './components/QuizScreen.tsx';
import { ResultsScreen } from './components/ResultsScreen.tsx';
import { LeaderboardView } from './components/LeaderboardView.tsx';
import { StatsView } from './components/StatsView.tsx';
import { AchievementsView } from './components/AchievementsView.tsx';
import { ProfileView } from './components/ProfileView.tsx';
import { AchievementToast } from './components/AchievementToast.tsx';
import { NotesQuizSection } from './components/NotesQuizSection.tsx';
import { QuizCreatorView } from './components/QuizCreatorView.tsx';
import { MyQuizzesView } from './components/MyQuizzesView.tsx';
import { JoinQuizModal } from './components/JoinQuizModal.tsx';
import { Footer } from './components/Footer.tsx';
import {
  ActiveTab,
  CategoryId,
  CustomQuiz,
  LeaderboardEntry,
  Question,
  QuizConfig,
  QuizResult,
  StudyQuizRecord,
  UserProfile,
  UserStats,
  Achievement,
} from './types/quiz.ts';
import { getQuizQuestions } from './data/questions.ts';
import {
  getStoredProfile,
  saveStoredProfile,
  getStoredStats,
  getStoredHistory,
  getStoredAchievements,
  getStoredLeaderboard,
  getStoredSoundMuted,
  setStoredSoundMuted,
  getStoredStudyQuizzes,
  deleteStoredStudyQuiz,
  getStoredCustomQuizzes,
  deleteStoredCustomQuiz,
  recordQuizCompletion,
  resetAllData,
} from './utils/storage.ts';
import { soundEffects } from './utils/sound.ts';
import { BookOpen } from 'lucide-react';

export default function App() {
  // Navigation & View State
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [setupModalCategory, setSetupModalCategory] = useState<CategoryId | null>(null);

  // Active Quiz State
  const [currentQuizConfig, setCurrentQuizConfig] = useState<QuizConfig | null>(null);
  const [currentQuizQuestions, setCurrentQuizQuestions] = useState<Question[] | null>(null);
  const [inQuizSession, setInQuizSession] = useState(false);
  const [activeResult, setActiveResult] = useState<QuizResult | null>(null);

  // Persistent App State
  const [profile, setProfile] = useState<UserProfile>(getStoredProfile);
  const [stats, setStats] = useState<UserStats>(getStoredStats);
  const [history, setHistory] = useState<QuizResult[]>(getStoredHistory);
  const [studyQuizzes, setStudyQuizzes] = useState<StudyQuizRecord[]>(getStoredStudyQuizzes);
  const [customQuizzes, setCustomQuizzes] = useState<CustomQuiz[]>(getStoredCustomQuizzes);
  const [achievements, setAchievements] = useState<Achievement[]>(getStoredAchievements);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(getStoredLeaderboard);
  const [isMuted, setIsMuted] = useState<boolean>(getStoredSoundMuted);

  // Join Quiz Modal State
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [joinModalCode, setJoinModalCode] = useState('');

  // Celebratory Toast for unlocked achievements
  const [unlockedToast, setUnlockedToast] = useState<Achievement | null>(null);

  // Keep sound mute state persisted
  useEffect(() => {
    setStoredSoundMuted(isMuted);
  }, [isMuted]);

  // Current rank of user
  const currentUserRank =
    leaderboard.find((e) => e.isUser || e.username === profile.username)?.rank ||
    leaderboard.length;

  // Open Quiz Setup Modal for a category
  const handleOpenSetup = (category: CategoryId) => {
    setActiveResult(null);
    setSetupModalCategory(category);
  };

  // Quick Start from Hero CTA or Navbar CTA
  const handleQuickStart = () => {
    setActiveResult(null);
    setSetupModalCategory('technology');
  };

  // Launch Category Challenge from Setup Modal
  const handleStartChallenge = (config: QuizConfig) => {
    const questions = getQuizQuestions(config.category, config.difficulty as 'easy' | 'medium' | 'hard', config.questionCount);
    setCurrentQuizConfig(config);
    setCurrentQuizQuestions(questions);
    setSetupModalCategory(null);
    setActiveResult(null);
    setInQuizSession(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Launch Grounded Notes Quiz
  const handleStartNotesQuiz = (config: QuizConfig, questions: Question[]) => {
    setCurrentQuizConfig(config);
    setCurrentQuizQuestions(questions);
    setSetupModalCategory(null);
    setActiveResult(null);
    setInQuizSession(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Launch Custom Quiz (from code or creator)
  const handleStartCustomQuiz = (quiz: CustomQuiz) => {
    const config: QuizConfig = {
      category: quiz.category,
      difficulty: quiz.difficulty,
      questionCount: quiz.questions.length,
      mode: quiz.mode,
      customQuizId: quiz.id,
      customQuizCode: quiz.code,
      customQuizTitle: quiz.title,
    };
    setCurrentQuizConfig(config);
    setCurrentQuizQuestions(quiz.questions);
    setJoinModalOpen(false);
    setSetupModalCategory(null);
    setActiveResult(null);
    setInQuizSession(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle joining with code from Hero or Navbar
  const handleJoinQuizWithCode = (code: string) => {
    setJoinModalCode(code);
    setJoinModalOpen(true);
  };

  // Finish Challenge (Category, Notes, and Custom quizzes)
  const handleFinishQuiz = (result: QuizResult) => {
    setActiveResult(result);
    setInQuizSession(false);

    // Save result, update stats, leaderboard, custom quiz attempts, and evaluate achievements
    const { newlyUnlocked, updatedStats } = recordQuizCompletion(result);

    // Refresh state from storage
    setStats(updatedStats);
    setHistory(getStoredHistory());
    setLeaderboard(getStoredLeaderboard());
    setAchievements(getStoredAchievements());
    setStudyQuizzes(getStoredStudyQuizzes());
    setCustomQuizzes(getStoredCustomQuizzes());

    // Celebrate new achievements if any
    if (newlyUnlocked.length > 0) {
      const firstUnlocked = newlyUnlocked[0];
      setUnlockedToast(firstUnlocked);
      soundEffects.playUnlock(isMuted);
      setTimeout(() => {
        setUnlockedToast(null);
      }, 4500);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Retry Weak Topics (Creates targeted short quiz for missed concepts)
  const handleRetryWeakTopics = async (weakTopics: string[], notesText?: string) => {
    const textToUse = notesText || currentQuizConfig?.notesText;
    if (!textToUse || weakTopics.length === 0) return;

    try {
      const res = await fetch('/api/notes/retry-weak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notesText: textToUse,
          weakTopics,
          fileName: currentQuizConfig?.notesFileName || 'Weak Concepts Revision',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success || !data.questions) {
        throw new Error(data.error || 'Failed to generate revision quiz');
      }

      const revisionConfig: QuizConfig = {
        category: 'technology',
        difficulty: 'medium',
        questionCount: data.questions.length,
        mode: currentQuizConfig?.mode || 'classic',
        isNotesQuiz: true,
        notesFileName: `Revision: ${currentQuizConfig?.notesFileName || 'My Notes'}`,
        notesText: textToUse,
      };

      handleStartNotesQuiz(revisionConfig, data.questions);
    } catch (err: any) {
      console.warn('Network revision call failed, using client-side revision fallback:', err);
      // Fallback: build targeted questions from text
      const filteredLines = textToUse
        .split(/\n+/)
        .map((l) => l.trim())
        .filter((l) => l.length > 20 && weakTopics.some((wt) => l.toLowerCase().includes(wt.toLowerCase())));

      const fallbackQuestions: Question[] = (filteredLines.length > 0 ? filteredLines : textToUse.split(/\n+/).filter((l) => l.trim().length > 20))
        .slice(0, 5)
        .map((line, i) => ({
          id: `revision-fb-${Date.now()}-${i}`,
          category: 'technology',
          difficulty: 'medium',
          question: `Regarding ${weakTopics[i % weakTopics.length] || 'this concept'}, is it accurate that: "${line}"?`,
          options: ['True', 'False'],
          correctAnswerIndex: 0,
          topic: weakTopics[i % weakTopics.length] || 'Review Topic',
          sourceExcerpt: line.slice(0, 140),
          explanation: `Why: As stated in your study material: "${line}"`,
          isFromNotes: true,
          notesFileName: currentQuizConfig?.notesFileName || 'Revision Quiz',
          type: 'true_false',
        }));

      if (fallbackQuestions.length > 0) {
        const revisionConfig: QuizConfig = {
          category: 'technology',
          difficulty: 'medium',
          questionCount: fallbackQuestions.length,
          mode: currentQuizConfig?.mode || 'classic',
          isNotesQuiz: true,
          notesFileName: `Revision: ${currentQuizConfig?.notesFileName || 'My Notes'}`,
          notesText: textToUse,
        };
        handleStartNotesQuiz(revisionConfig, fallbackQuestions);
      }
    }
  };

  // Retake previous study quiz from My Stats
  const handleRetakeStudyQuiz = (record: StudyQuizRecord) => {
    const config: QuizConfig = {
      category: 'technology',
      difficulty: record.difficulty,
      questionCount: record.questions.length,
      mode: 'classic',
      isNotesQuiz: true,
      notesFileName: record.fileName,
      notesText: record.notesText,
    };
    handleStartNotesQuiz(config, record.questions);
  };

  // Delete previous study quiz record
  const handleDeleteStudyQuiz = (id: string) => {
    deleteStoredStudyQuiz(id);
    setStudyQuizzes(getStoredStudyQuizzes());
  };

  // Delete custom quiz record
  const handleDeleteCustomQuiz = (id: string) => {
    deleteStoredCustomQuiz(id);
    setCustomQuizzes(getStoredCustomQuizzes());
  };

  // Try Again with same configuration
  const handleTryAgain = () => {
    if (!currentQuizConfig) return;

    if (currentQuizConfig.isNotesQuiz && currentQuizQuestions) {
      // Re-shuffle current notes questions
      const shuffled = [...currentQuizQuestions].sort(() => Math.random() - 0.5);
      setCurrentQuizQuestions(shuffled);
      setActiveResult(null);
      setInQuizSession(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (currentQuizConfig.customQuizId && currentQuizQuestions) {
      const shuffled = [...currentQuizQuestions].sort(() => Math.random() - 0.5);
      setCurrentQuizQuestions(shuffled);
      setActiveResult(null);
      setInQuizSession(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const freshQuestions = getQuizQuestions(
      currentQuizConfig.category,
      currentQuizConfig.difficulty as 'easy' | 'medium' | 'hard',
      currentQuizConfig.questionCount
    );
    setCurrentQuizQuestions(freshQuestions);
    setActiveResult(null);
    setInQuizSession(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // New Quiz: Open Explore or Setup
  const handleNewQuiz = () => {
    setActiveResult(null);
    setInQuizSession(false);
    setActiveTab('explore');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Update Profile
  const handleUpdateProfile = (updated: UserProfile) => {
    setProfile(updated);
    saveStoredProfile(updated);

    // Also update current user in leaderboard state
    const currentLb = getStoredLeaderboard();
    const updatedLb = currentLb.map((item) => {
      if (item.isUser) {
        return {
          ...item,
          name: updated.name,
          username: updated.username,
          avatarColor: updated.avatarColor,
        };
      }
      return item;
    });
    setLeaderboard(updatedLb);
  };

  // Reset Progress Data
  const handleResetData = () => {
    resetAllData();
    const freshProfile = getStoredProfile();
    const freshStats = getStoredStats();
    const freshAchievements = getStoredAchievements();
    const freshLeaderboard = getStoredLeaderboard();
    const freshCustomQuizzes = getStoredCustomQuizzes();

    setProfile(freshProfile);
    setStats(freshStats);
    setHistory([]);
    setStudyQuizzes([]);
    setCustomQuizzes(freshCustomQuizzes);
    setAchievements(freshAchievements);
    setLeaderboard(freshLeaderboard);
    setActiveResult(null);
    setInQuizSession(false);
    setActiveTab('home');
  };

  // Navigation handler
  const handleNavigate = (tab: ActiveTab) => {
    if (tab === 'join') {
      setJoinModalCode('');
      setJoinModalOpen(true);
      return;
    }

    if (inQuizSession) {
      if (!window.confirm('Do you want to leave the active quiz? Progress will be lost.')) {
        return;
      }
      setInQuizSession(false);
    }
    setActiveResult(null);
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const unlockedAchievementsCount = achievements.filter((a) => a.isUnlocked).length;

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleNavigate}
        profile={profile}
        stats={stats}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
        onQuickStart={handleQuickStart}
        onOpenJoinModal={() => {
          setJoinModalCode('');
          setJoinModalOpen(true);
        }}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {/* ACTIVE QUIZ SCREEN */}
        {inQuizSession && currentQuizConfig && currentQuizQuestions ? (
          <QuizScreen
            config={currentQuizConfig}
            questions={currentQuizQuestions}
            isMuted={isMuted}
            setIsMuted={setIsMuted}
            onFinishQuiz={handleFinishQuiz}
            onExitQuiz={() => {
              setInQuizSession(false);
              setActiveTab('home');
            }}
          />
        ) : activeResult ? (
          /* RESULTS SCREEN */
          <ResultsScreen
            result={activeResult}
            onTryAgain={handleTryAgain}
            onNewQuiz={handleNewQuiz}
            onViewLeaderboard={() => {
              setActiveResult(null);
              setActiveTab('leaderboard');
            }}
            onRetryWeakTopics={handleRetryWeakTopics}
          />
        ) : (
          /* TAB CONTENT */
          <>
            {activeTab === 'home' && (
              <div>
                <LandingHero
                  stats={stats}
                  currentRank={currentUserRank}
                  onStartQuiz={handleQuickStart}
                  onViewLeaderboard={() => setActiveTab('leaderboard')}
                  onPlayQuiz={() => handleOpenSetup('technology')}
                  onOpenNotesUpload={() => setActiveTab('notes')}
                  onCreateQuiz={() => setActiveTab('create')}
                  onJoinQuizWithCode={handleJoinQuizWithCode}
                />
                <CategoryGrid
                  stats={stats}
                  onSelectCategory={handleOpenSetup}
                  onStartNotesQuiz={handleStartNotesQuiz}
                  showNotesUpload={false}
                />
              </div>
            )}

            {activeTab === 'explore' && (
              <div className="pt-6">
                <CategoryGrid
                  stats={stats}
                  onSelectCategory={handleOpenSetup}
                  onStartNotesQuiz={handleStartNotesQuiz}
                  showNotesUpload={true}
                />
              </div>
            )}

            {/* DEDICATED QUIZ FROM MY NOTES PAGE */}
            {activeTab === 'notes' && (
              <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-in fade-in duration-200">
                <div className="mb-8">
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>AI Learning Assistant</span>
                  </div>
                  <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
                    Quiz From My Notes
                  </h1>
                  <p className="text-slate-400 text-sm sm:text-base mt-1">
                    Upload your lecture notes, PDFs, DOCX, or study guides and let Quizora generate custom challenges.
                  </p>
                </div>

                <NotesQuizSection onStartNotesQuiz={handleStartNotesQuiz} />
              </div>
            )}

            {/* QUIZ CREATOR STUDIO */}
            {activeTab === 'create' && (
              <QuizCreatorView
                currentUser={profile.name}
                onQuizPublished={(_newQuiz) => {
                  setCustomQuizzes(getStoredCustomQuizzes());
                }}
                onCancel={() => setActiveTab('home')}
                onViewMyQuizzes={() => setActiveTab('my-quizzes')}
                onStartQuiz={handleStartCustomQuiz}
              />
            )}

            {/* MY QUIZZES DASHBOARD */}
            {activeTab === 'my-quizzes' && (
              <MyQuizzesView
                quizzes={customQuizzes}
                onCreateNewQuiz={() => setActiveTab('create')}
                onTakeQuiz={handleStartCustomQuiz}
                onDeleteQuiz={handleDeleteCustomQuiz}
              />
            )}

            {activeTab === 'leaderboard' && (
              <LeaderboardView
                entries={leaderboard}
                currentUsername={profile.username}
              />
            )}

            {activeTab === 'stats' && (
              <StatsView
                stats={stats}
                history={history}
                studyQuizzes={studyQuizzes}
                currentRank={currentUserRank}
                onExploreQuizzes={() => setActiveTab('explore')}
                onRetakeStudyQuiz={handleRetakeStudyQuiz}
                onDeleteStudyQuiz={handleDeleteStudyQuiz}
                onOpenNotesUpload={() => setActiveTab('notes')}
              />
            )}

            {activeTab === 'achievements' && (
              <AchievementsView achievements={achievements} />
            )}

            {activeTab === 'profile' && (
              <ProfileView
                profile={profile}
                stats={stats}
                unlockedAchievementsCount={unlockedAchievementsCount}
                currentRank={currentUserRank}
                onUpdateProfile={handleUpdateProfile}
                onResetData={handleResetData}
              />
            )}
          </>
        )}
      </main>

      {/* QUIZ SETUP MODAL */}
      {setupModalCategory && (
        <QuizSetupModal
          initialCategoryId={setupModalCategory}
          onClose={() => setSetupModalCategory(null)}
          onStartQuiz={handleStartChallenge}
          onStartNotesQuiz={handleStartNotesQuiz}
        />
      )}

      {/* JOIN QUIZ WITH CODE MODAL */}
      {joinModalOpen && (
        <JoinQuizModal
          initialCode={joinModalCode}
          onClose={() => setJoinModalOpen(false)}
          onJoinQuiz={handleStartCustomQuiz}
        />
      )}

      {/* REAL-TIME ACHIEVEMENT CELEBRATION TOAST */}
      <AchievementToast
        achievement={unlockedToast}
        onClose={() => setUnlockedToast(null)}
      />

      {/* FOOTER */}
      {!inQuizSession && (
        <Footer onNavigate={handleNavigate} onStartQuiz={handleQuickStart} />
      )}
    </div>
  );
}
