import {
  Achievement,
  CategoryId,
  CustomQuiz,
  LeaderboardEntry,
  QuizAttemptRecord,
  QuizResult,
  StudyQuizRecord,
  UserProfile,
  UserStats,
} from '../types/quiz.ts';
import { INITIAL_LEADERBOARD_PLAYERS } from '../data/defaultLeaderboard.ts';

const STORAGE_KEYS = {
  PROFILE: 'quizora_profile_v1',
  STATS: 'quizora_stats_v1',
  HISTORY: 'quizora_history_v1',
  ACHIEVEMENTS: 'quizora_achievements_v1',
  LEADERBOARD: 'quizora_leaderboard_v1',
  SOUND_MUTED: 'quizora_sound_muted_v1',
  STUDY_QUIZZES: 'quizora_study_quizzes_v1',
  CUSTOM_QUIZZES: 'quizora_custom_quizzes_v1',
};

const DEFAULT_PROFILE: UserProfile = {
  name: 'Player One',
  username: 'player1',
  avatarColor: 'from-indigo-600 to-violet-600',
  joinedDate: 'October 2026',
  bio: 'Quiz enthusiast aiming for the #1 spot on Quizora.',
};

const DEFAULT_STATS: UserStats = {
  totalQuizzes: 0,
  totalQuestionsAnswered: 0,
  totalCorrect: 0,
  totalPoints: 0,
  bestStreak: 0,
  categoryStats: {
    technology: { quizzes: 0, correct: 0, total: 0, points: 0 },
    science: { quizzes: 0, correct: 0, total: 0, points: 0 },
    general: { quizzes: 0, correct: 0, total: 0, points: 0 },
    movies: { quizzes: 0, correct: 0, total: 0, points: 0 },
    sports: { quizzes: 0, correct: 0, total: 0, points: 0 },
    coding: { quizzes: 0, correct: 0, total: 0, points: 0 },
  },
};

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_step',
    title: 'First Step',
    description: 'Complete your first quiz on Quizora.',
    icon: 'Footprints',
    isUnlocked: false,
    progress: { current: 0, max: 1 },
  },
  {
    id: 'perfect_score',
    title: 'Perfect Score',
    description: 'Score 100% accuracy in any quiz challenge.',
    icon: 'Target',
    isUnlocked: false,
    progress: { current: 0, max: 1 },
  },
  {
    id: 'on_fire',
    title: 'On Fire',
    description: 'Achieve a consecutive 5-answer streak.',
    icon: 'Flame',
    isUnlocked: false,
    progress: { current: 0, max: 5 },
  },
  {
    id: 'quiz_explorer',
    title: 'Quiz Explorer',
    description: 'Play quizzes across at least 3 distinct categories.',
    icon: 'Compass',
    isUnlocked: false,
    progress: { current: 0, max: 3 },
  },
  {
    id: 'knowledge_hunter',
    title: 'Knowledge Hunter',
    description: 'Complete 10 total quizzes on the platform.',
    icon: 'Award',
    isUnlocked: false,
    progress: { current: 0, max: 10 },
  },
  {
    id: 'top_10',
    title: 'Top 10',
    description: 'Climb into the overall Leaderboard Top 10 rankings.',
    icon: 'Crown',
    isUnlocked: false,
    progress: { current: 0, max: 1 },
  },
  {
    id: 'speed_demon',
    title: 'Speed Demon',
    description: 'Complete a quiz in Timed Countdown mode.',
    icon: 'Zap',
    isUnlocked: false,
    progress: { current: 0, max: 1 },
  },
  {
    id: 'century_club',
    title: 'Century Club',
    description: 'Earn 200 or more points in a single quiz session.',
    icon: 'Sparkles',
    isUnlocked: false,
    progress: { current: 0, max: 200 },
  },
];

// Profile
export function getStoredProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return DEFAULT_PROFILE;
}

export function saveStoredProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch {
    // ignore
  }
}

// Stats
export function getStoredStats(): UserStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STATS);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_STATS,
        ...parsed,
        categoryStats: {
          ...DEFAULT_STATS.categoryStats,
          ...(parsed.categoryStats || {}),
        },
      };
    }
  } catch {
    // ignore
  }
  return DEFAULT_STATS;
}

export function saveStoredStats(stats: UserStats): void {
  try {
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
  } catch {
    // ignore
  }
}

// History
export function getStoredHistory(): QuizResult[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return [];
}

export function saveStoredHistory(history: QuizResult[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  } catch {
    // ignore
  }
}

// Achievements
export function getStoredAchievements(): Achievement[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
    if (raw) {
      const parsed: Achievement[] = JSON.parse(raw);
      // Merge with INITIAL_ACHIEVEMENTS to ensure any newly added definitions exist
      return INITIAL_ACHIEVEMENTS.map((initial) => {
        const found = parsed.find((p) => p.id === initial.id);
        return found ? { ...initial, ...found } : initial;
      });
    }
  } catch {
    // ignore
  }
  return INITIAL_ACHIEVEMENTS;
}

export function saveStoredAchievements(achievements: Achievement[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
  } catch {
    // ignore
  }
}

// Sound Preference
export function getStoredSoundMuted(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEYS.SOUND_MUTED) === 'true';
  } catch {
    return false;
  }
}

export function setStoredSoundMuted(muted: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SOUND_MUTED, String(muted));
  } catch {
    // ignore
  }
}

// Leaderboard
export function getStoredLeaderboard(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LEADERBOARD);
    if (raw) {
      const parsed: LeaderboardEntry[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }

  // Initialize with seed and calculate ranks
  const profile = getStoredProfile();
  const stats = getStoredStats();

  const userEntry: Omit<LeaderboardEntry, 'rank'> = {
    id: 'current-user',
    name: profile.name,
    username: profile.username,
    avatarColor: profile.avatarColor,
    score: stats.totalPoints,
    accuracy:
      stats.totalQuestionsAnswered > 0
        ? Math.round((stats.totalCorrect / stats.totalQuestionsAnswered) * 100)
        : 0,
    quizzesPlayed: stats.totalQuizzes,
    bestStreak: stats.bestStreak,
    categoryScores: {
      technology: stats.categoryStats.technology?.points || 0,
      science: stats.categoryStats.science?.points || 0,
      general: stats.categoryStats.general?.points || 0,
      movies: stats.categoryStats.movies?.points || 0,
      sports: stats.categoryStats.sports?.points || 0,
      coding: stats.categoryStats.coding?.points || 0,
    },
    isUser: true,
  };

  const initialList = [...INITIAL_LEADERBOARD_PLAYERS, userEntry];
  const sorted = initialList.sort((a, b) => b.score - a.score);
  const ranked: LeaderboardEntry[] = sorted.map((entry, idx) => ({
    ...entry,
    rank: idx + 1,
  }));

  saveStoredLeaderboard(ranked);
  return ranked;
}

export function saveStoredLeaderboard(entries: LeaderboardEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(entries));
  } catch {
    // ignore
  }
}

// Study Quizzes Management
export function getStoredStudyQuizzes(): StudyQuizRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STUDY_QUIZZES);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return [];
}

export function saveStoredStudyQuiz(record: StudyQuizRecord): void {
  try {
    const existing = getStoredStudyQuizzes();
    const filtered = existing.filter((item) => item.id !== record.id);
    localStorage.setItem(STORAGE_KEYS.STUDY_QUIZZES, JSON.stringify([record, ...filtered]));
  } catch {
    // ignore
  }
}

export function deleteStoredStudyQuiz(id: string): void {
  try {
    const existing = getStoredStudyQuizzes();
    const updated = existing.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEYS.STUDY_QUIZZES, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

// =========================================================================
// Custom Quizzes (Created by Users & Teachers)
// =========================================================================
export const DEFAULT_CUSTOM_QUIZZES: CustomQuiz[] = [
  {
    id: 'quiz-seed-code-101',
    code: 'CODE-101',
    title: 'Web & JavaScript Fundamentals',
    description: 'Essential mastery check covering JavaScript scope, event loop, asynchronous promises, and DOM manipulation.',
    category: 'coding',
    difficulty: 'medium',
    mode: 'classic',
    createdAt: '2026-09-28T14:30:00.000Z',
    authorName: 'Prof. Davis',
    isPublished: true,
    attemptsCount: 14,
    attempts: [
      { id: 'att-1', quizId: 'quiz-seed-code-101', userName: 'Sarah Chen', score: 100, totalQuestions: 5, accuracy: 100, date: '2026-10-01T16:20:00.000Z' },
      { id: 'att-2', quizId: 'quiz-seed-code-101', userName: 'Liam Patel', score: 80, totalQuestions: 5, accuracy: 80, date: '2026-10-01T18:45:00.000Z' },
      { id: 'att-3', quizId: 'quiz-seed-code-101', userName: 'Maya Lin', score: 80, totalQuestions: 5, accuracy: 80, date: '2026-10-02T02:10:00.000Z' },
      { id: 'att-4', quizId: 'quiz-seed-code-101', userName: 'Jordan Vance', score: 60, totalQuestions: 5, accuracy: 60, date: '2026-10-02T04:30:00.000Z' },
    ],
    questions: [
      {
        id: 'cq-1',
        category: 'coding',
        difficulty: 'medium',
        question: 'What is the output of typeof null in JavaScript?',
        options: ['"null"', '"object"', '"undefined"', '"number"'],
        correctAnswerIndex: 1,
        topic: 'JavaScript Types',
        explanation: 'Due to a historical bug in JavaScript early implementation, typeof null evaluates to "object".',
      },
      {
        id: 'cq-2',
        category: 'coding',
        difficulty: 'medium',
        question: 'Which method schedule microtasks in the JavaScript Event Loop before setTimeout callbacks execute?',
        options: ['queueMicrotask()', 'setImmediate()', 'requestAnimationFrame()', 'process.tickDelay()'],
        correctAnswerIndex: 0,
        topic: 'Event Loop',
        explanation: 'queueMicrotask() places the callback onto the microtask queue, which drains prior to macrotasks like setTimeout.',
      },
      {
        id: 'cq-3',
        category: 'coding',
        difficulty: 'easy',
        question: 'Which keyword declares a block-scoped variable that cannot be reassigned?',
        options: ['var', 'let', 'const', 'static'],
        correctAnswerIndex: 2,
        topic: 'Variables',
        explanation: 'const creates a block-scoped binding that prevents reassignment of the variable identifier.',
      },
      {
        id: 'cq-4',
        category: 'coding',
        difficulty: 'hard',
        question: 'What does Promise.allSettled() return compared to Promise.all()?',
        options: [
          'It rejects immediately on first error',
          'It returns an array of objects describing each promise outcome, regardless of rejections',
          'It only executes promises sequentially',
          'It returns the fastest resolved value'
        ],
        correctAnswerIndex: 1,
        topic: 'Asynchronous JS',
        explanation: 'Promise.allSettled() waits for all input promises to settle and returns an array with status and value/reason.',
      },
      {
        id: 'cq-5',
        category: 'coding',
        difficulty: 'medium',
        question: 'Which DOM method efficiently delegates click events to dynamic child elements?',
        options: ['event.stopPropagation()', 'event.target checking on parent listener', 'document.refreshDOM()', 'element.bindAll()'],
        correctAnswerIndex: 1,
        topic: 'DOM APIs',
        explanation: 'Attaching one listener to a common ancestor and inspecting event.target implements efficient event delegation.',
      },
    ],
  },
  {
    id: 'quiz-seed-db-201',
    code: 'DB-201',
    title: 'Relational Databases & SQL Mastery',
    description: 'Comprehensive assessment on normal forms (1NF, 2NF, 3NF), relational keys, and ACID transaction guarantees.',
    category: 'technology',
    difficulty: 'medium',
    mode: 'timed',
    createdAt: '2026-09-30T10:15:00.000Z',
    authorName: 'Elena Rostova',
    isPublished: true,
    attemptsCount: 9,
    attempts: [
      { id: 'att-5', quizId: 'quiz-seed-db-201', userName: 'Marcus Chen', score: 100, totalQuestions: 5, accuracy: 100, date: '2026-10-01T11:00:00.000Z' },
      { id: 'att-6', quizId: 'quiz-seed-db-201', userName: 'Devon Lee', score: 80, totalQuestions: 5, accuracy: 80, date: '2026-10-01T15:20:00.000Z' },
    ],
    questions: [
      {
        id: 'cq-db-1',
        category: 'technology',
        difficulty: 'easy',
        question: 'What requirement does First Normal Form (1NF) enforce on relational table columns?',
        options: ['All column values must be atomic', 'All columns must have foreign keys', 'Every table must have a composite key', 'No NULL values allowed anywhere'],
        correctAnswerIndex: 0,
        topic: '1NF Normalization',
        explanation: '1NF requires that each column contains only atomic (indivisible) values and each row is unique.',
      },
      {
        id: 'cq-db-2',
        category: 'technology',
        difficulty: 'medium',
        question: 'Second Normal Form (2NF) specifically eliminates which type of dependency?',
        options: ['Transitive dependencies', 'Partial functional dependencies on composite keys', 'Cyclic foreign key dependencies', 'Referential constraints'],
        correctAnswerIndex: 1,
        topic: '2NF Normalization',
        explanation: '2NF eliminates partial dependencies by requiring non-key attributes to depend on the entire candidate key.',
      },
      {
        id: 'cq-db-3',
        category: 'technology',
        difficulty: 'medium',
        question: 'To achieve Third Normal Form (3NF), which dependency must be removed from non-key attributes?',
        options: ['Atomic dependencies', 'Transitive dependencies', 'Reflexive dependencies', 'Trivial functional dependencies'],
        correctAnswerIndex: 1,
        topic: '3NF Normalization',
        explanation: '3NF requires that no non-prime attribute is transitively dependent on any candidate key.',
      },
      {
        id: 'cq-db-4',
        category: 'technology',
        difficulty: 'hard',
        question: 'What does the "I" represent in ACID transaction properties?',
        options: ['Immutability', 'Isolation', 'Indexation', 'Idempotence'],
        correctAnswerIndex: 1,
        topic: 'ACID Guarantees',
        explanation: 'Isolation ensures that concurrent transactions execute as if they were running serially without interference.',
      },
      {
        id: 'cq-db-5',
        category: 'technology',
        difficulty: 'medium',
        question: 'Which SQL constraint guarantees that a value in Table A must match an existing primary key in Table B?',
        options: ['CHECK', 'UNIQUE', 'FOREIGN KEY', 'PRIMARY INDEX'],
        correctAnswerIndex: 2,
        topic: 'Relational Integrity',
        explanation: 'A FOREIGN KEY establishes a referential integrity constraint between two tables.',
      },
    ],
  },
  {
    id: 'quiz-seed-bio-105',
    code: 'BIO-105',
    title: 'Cellular Biology & Genetics',
    description: 'Quick check on mitochondrial respiration, cell division stages, and Mendelian genetics.',
    category: 'science',
    difficulty: 'easy',
    mode: 'classic',
    createdAt: '2026-09-29T09:00:00.000Z',
    authorName: 'Dr. Marcus Vance',
    isPublished: true,
    attemptsCount: 18,
    attempts: [
      { id: 'att-7', quizId: 'quiz-seed-bio-105', userName: 'Nina Simone', score: 100, totalQuestions: 4, accuracy: 100, date: '2026-10-01T14:10:00.000Z' },
    ],
    questions: [
      {
        id: 'cq-bio-1',
        category: 'science',
        difficulty: 'easy',
        question: 'Which cellular organelle is responsible for generating the majority of ATP through oxidative phosphorylation?',
        options: ['Ribosome', 'Mitochondria', 'Endoplasmic Reticulum', 'Golgi Apparatus'],
        correctAnswerIndex: 1,
        topic: 'Cell Biology',
        explanation: 'Mitochondria are the powerhouse organelles where cellular respiration and ATP synthesis occur.',
      },
      {
        id: 'cq-bio-2',
        category: 'science',
        difficulty: 'easy',
        question: 'In DNA, which nitrogenous base pairs complementarily with Adenine (A)?',
        options: ['Guanine', 'Cytosine', 'Thymine', 'Uracil'],
        correctAnswerIndex: 2,
        topic: 'Genetics',
        explanation: 'Adenine pairs with Thymine in DNA via two hydrogen bonds.',
      },
      {
        id: 'cq-bio-3',
        category: 'science',
        difficulty: 'medium',
        question: 'During which phase of mitosis do sister chromatids pull apart toward opposite spindle poles?',
        options: ['Prophase', 'Metaphase', 'Anaphase', 'Telophase'],
        correctAnswerIndex: 2,
        topic: 'Cell Division',
        explanation: 'During anaphase, the centromeres split and sister chromatids migrate to opposite cell poles.',
      },
      {
        id: 'cq-bio-4',
        category: 'science',
        difficulty: 'easy',
        question: 'What is the phenotypic ratio of offspring from a monohybrid cross of two heterozygous parents (Aa x Aa)?',
        options: ['1:1', '3:1', '9:3:3:1', '2:1:1'],
        correctAnswerIndex: 1,
        topic: 'Mendelian Genetics',
        explanation: 'A classic monohybrid heterozygous cross yields a 3 dominant to 1 recessive phenotypic ratio.',
      },
    ],
  },
];

export function getStoredCustomQuizzes(): CustomQuiz[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_QUIZZES);
    if (raw) {
      const parsed: CustomQuiz[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }

  // Seed default quizzes on first load
  saveStoredCustomQuizzes(DEFAULT_CUSTOM_QUIZZES);
  return DEFAULT_CUSTOM_QUIZZES;
}

export function saveStoredCustomQuizzes(quizzes: CustomQuiz[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_QUIZZES, JSON.stringify(quizzes));
  } catch {
    // ignore
  }
}

export function saveStoredCustomQuiz(quiz: CustomQuiz): void {
  try {
    const existing = getStoredCustomQuizzes();
    const filtered = existing.filter((q) => q.id !== quiz.id && q.code.toUpperCase() !== quiz.code.toUpperCase());
    const updated = [quiz, ...filtered];
    saveStoredCustomQuizzes(updated);
  } catch {
    // ignore
  }
}

export function deleteStoredCustomQuiz(id: string): void {
  try {
    const existing = getStoredCustomQuizzes();
    const updated = existing.filter((q) => q.id !== id);
    saveStoredCustomQuizzes(updated);
  } catch {
    // ignore
  }
}

export function findCustomQuizByCode(rawCode: string): CustomQuiz | undefined {
  if (!rawCode) return undefined;
  const clean = rawCode.trim().toUpperCase().replace(/\s+/g, '');
  const quizzes = getStoredCustomQuizzes();
  return quizzes.find(
    (q) =>
      q.code.toUpperCase() === clean ||
      q.code.toUpperCase().replace(/-/g, '') === clean.replace(/-/g, '')
  );
}

export function recordCustomQuizAttempt(quizIdOrCode: string, attempt: QuizAttemptRecord): void {
  try {
    const quizzes = getStoredCustomQuizzes();
    const clean = quizIdOrCode.trim().toUpperCase().replace(/\s+/g, '');
    const updated = quizzes.map((q) => {
      const isMatch =
        q.id === quizIdOrCode ||
        q.code.toUpperCase() === clean ||
        q.code.toUpperCase().replace(/-/g, '') === clean.replace(/-/g, '');
      if (isMatch) {
        const attemptsList = q.attempts || [];
        return {
          ...q,
          attemptsCount: (q.attemptsCount || 0) + 1,
          attempts: [attempt, ...attemptsList],
        };
      }
      return q;
    });
    saveStoredCustomQuizzes(updated);
  } catch {
    // ignore
  }
}

/**
 * Record quiz completion:
 * Updates stats, history, leaderboard, and evaluates unlocked achievements.
 * Returns any newly unlocked achievements so the UI can celebrate!
 */
export function recordQuizCompletion(result: QuizResult): {
  newlyUnlocked: Achievement[];
  updatedStats: UserStats;
  currentRank: number;
} {
  const profile = getStoredProfile();
  const currentStats = getStoredStats();
  const currentHistory = getStoredHistory();
  const currentAchievements = getStoredAchievements();
  const currentLeaderboard = getStoredLeaderboard();

  // If notes quiz, extract weak topics and save study record
  if (result.isNotesQuiz && result.notesFileName) {
    const wrongQuestions = (result.attemptedQuestions || []).filter((q) => !q.isCorrect);
    const weakTopics = Array.from(
      new Set(
        wrongQuestions
          .map((q) => q.question.topic || '')
          .filter((t) => t.trim().length > 0)
      )
    );

    result.topicsToRevise = weakTopics;

    const studyRecord: StudyQuizRecord = {
      id: `study-record-${Date.now()}`,
      fileName: result.notesFileName,
      fileType: result.notesFileName.split('.').pop()?.toUpperCase() || 'NOTES',
      date: new Date().toISOString(),
      score: result.score,
      accuracy: result.accuracy,
      difficulty: result.difficulty,
      questionsAttempted: result.totalQuestions,
      notesText: result.notesText || '',
      weakTopics: weakTopics,
      questions: (result.attemptedQuestions || []).map((q) => q.question),
    };
    saveStoredStudyQuiz(studyRecord);
  }

  // If custom quiz attempt, record it for author analytics
  if (result.customQuizId || result.customQuizCode) {
    const attempt: QuizAttemptRecord = {
      id: `att-${Date.now()}`,
      quizId: result.customQuizId || result.customQuizCode || '',
      userName: profile.name || profile.username || 'Student',
      score: result.score,
      totalQuestions: result.totalQuestions,
      accuracy: result.accuracy,
      date: new Date().toISOString(),
    };
    recordCustomQuizAttempt(result.customQuizId || result.customQuizCode || '', attempt);
  }

  // 1. Update stats
  const catKey = (result.category in currentStats.categoryStats) ? result.category : 'technology';
  const updatedCategory = {
    ...currentStats.categoryStats[result.category],
    quizzes: (currentStats.categoryStats[result.category]?.quizzes || 0) + 1,
    correct: (currentStats.categoryStats[result.category]?.correct || 0) + result.correctAnswers,
    total: (currentStats.categoryStats[result.category]?.total || 0) + result.totalQuestions,
    points: (currentStats.categoryStats[result.category]?.points || 0) + result.score,
  };

  const updatedStats: UserStats = {
    totalQuizzes: currentStats.totalQuizzes + 1,
    totalQuestionsAnswered: currentStats.totalQuestionsAnswered + result.totalQuestions,
    totalCorrect: currentStats.totalCorrect + result.correctAnswers,
    totalPoints: currentStats.totalPoints + result.score,
    bestStreak: Math.max(currentStats.bestStreak, result.bestStreak),
    categoryStats: {
      ...currentStats.categoryStats,
      [result.category]: updatedCategory,
    },
  };
  saveStoredStats(updatedStats);

  // 2. Append history
  const updatedHistory = [result, ...currentHistory];
  saveStoredHistory(updatedHistory);

  // 3. Update leaderboard
  const existingUserIndex = currentLeaderboard.findIndex((e) => e.isUser);
  const userCatScores: Record<CategoryId, number> = {
    technology: updatedStats.categoryStats.technology.points,
    science: updatedStats.categoryStats.science.points,
    general: updatedStats.categoryStats.general.points,
    movies: updatedStats.categoryStats.movies.points,
    sports: updatedStats.categoryStats.sports.points,
    coding: updatedStats.categoryStats.coding.points,
  };

  const updatedUserEntry: LeaderboardEntry = {
    id: 'current-user',
    rank: 1,
    name: profile.name,
    username: profile.username,
    avatarColor: profile.avatarColor,
    score: updatedStats.totalPoints,
    accuracy: Math.round((updatedStats.totalCorrect / updatedStats.totalQuestionsAnswered) * 100),
    quizzesPlayed: updatedStats.totalQuizzes,
    bestStreak: updatedStats.bestStreak,
    categoryScores: userCatScores,
    isUser: true,
  };

  let newLeaderboardWithoutRanks: Omit<LeaderboardEntry, 'rank'>[];
  if (existingUserIndex >= 0) {
    const copy = [...currentLeaderboard];
    copy[existingUserIndex] = updatedUserEntry;
    newLeaderboardWithoutRanks = copy;
  } else {
    newLeaderboardWithoutRanks = [...currentLeaderboard, updatedUserEntry];
  }

  // Re-sort overall
  const sorted = newLeaderboardWithoutRanks.sort((a, b) => b.score - a.score);
  const rankedLeaderboard: LeaderboardEntry[] = sorted.map((item, idx) => ({
    ...item,
    rank: idx + 1,
  }));
  saveStoredLeaderboard(rankedLeaderboard);

  const currentUserRank = rankedLeaderboard.find((e) => e.isUser)?.rank || rankedLeaderboard.length;

  // 4. Check achievements
  const playedCategories = Object.keys(updatedStats.categoryStats).filter(
    (k) => updatedStats.categoryStats[k as CategoryId].quizzes > 0
  );

  const newlyUnlocked: Achievement[] = [];
  const now = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const updatedAchievements = currentAchievements.map((ach) => {
    if (ach.isUnlocked) return ach;
    let shouldUnlock = false;
    let currentProgress = ach.progress?.current || 0;

    switch (ach.id) {
      case 'first_step':
        currentProgress = updatedStats.totalQuizzes;
        if (updatedStats.totalQuizzes >= 1) shouldUnlock = true;
        break;
      case 'perfect_score':
        if (result.accuracy === 100) {
          shouldUnlock = true;
          currentProgress = 1;
        }
        break;
      case 'on_fire':
        currentProgress = Math.max(currentProgress, result.bestStreak);
        if (result.bestStreak >= 5 || updatedStats.bestStreak >= 5) shouldUnlock = true;
        break;
      case 'quiz_explorer':
        currentProgress = playedCategories.length;
        if (playedCategories.length >= 3) shouldUnlock = true;
        break;
      case 'knowledge_hunter':
        currentProgress = updatedStats.totalQuizzes;
        if (updatedStats.totalQuizzes >= 10) shouldUnlock = true;
        break;
      case 'top_10':
        if (currentUserRank <= 10) {
          shouldUnlock = true;
          currentProgress = 1;
        }
        break;
      case 'speed_demon':
        if (result.mode === 'timed') {
          shouldUnlock = true;
          currentProgress = 1;
        }
        break;
      case 'century_club':
        currentProgress = Math.max(currentProgress, result.score);
        if (result.score >= 200) shouldUnlock = true;
        break;
    }

    if (shouldUnlock) {
      const unlockedAch: Achievement = {
        ...ach,
        isUnlocked: true,
        unlockedAt: now,
        progress: ach.progress ? { ...ach.progress, current: ach.progress.max } : undefined,
      };
      newlyUnlocked.push(unlockedAch);
      return unlockedAch;
    }

    return {
      ...ach,
      progress: ach.progress ? { ...ach.progress, current: currentProgress } : undefined,
    };
  });

  saveStoredAchievements(updatedAchievements);

  return {
    newlyUnlocked,
    updatedStats,
    currentRank: currentUserRank,
  };
}

export function resetAllData(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
    localStorage.removeItem(STORAGE_KEYS.STATS);
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
    localStorage.removeItem(STORAGE_KEYS.ACHIEVEMENTS);
    localStorage.removeItem(STORAGE_KEYS.LEADERBOARD);
    localStorage.removeItem(STORAGE_KEYS.SOUND_MUTED);
    localStorage.removeItem(STORAGE_KEYS.STUDY_QUIZZES);
    localStorage.removeItem(STORAGE_KEYS.CUSTOM_QUIZZES);
  } catch {
    // ignore
  }
}
