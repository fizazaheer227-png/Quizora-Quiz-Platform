export type CategoryId =
  | 'technology'
  | 'science'
  | 'general'
  | 'movies'
  | 'sports'
  | 'coding';

export type Difficulty = 'easy' | 'medium' | 'hard' | 'mixed';
export type QuizMode = 'classic' | 'timed';
export type QuestionType = 'multiple_choice' | 'true_false' | 'mixed';

export interface Question {
  id: string;
  category: CategoryId;
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation?: string;
  type?: 'multiple_choice' | 'true_false';
  topic?: string;
  sourceExcerpt?: string;
  isFromNotes?: boolean;
  notesFileName?: string;
}

export interface QuizConfig {
  category: CategoryId;
  difficulty: Difficulty;
  questionCount: number;
  mode: QuizMode;
  isNotesQuiz?: boolean;
  notesFileName?: string;
  notesText?: string;
  questionType?: QuestionType;
  customQuizId?: string;
  customQuizCode?: string;
  customQuizTitle?: string;
}

export interface QuizSessionState {
  config: QuizConfig;
  questions: Question[];
  currentIndex: number;
  selectedAnswers: (number | null)[];
  isAnswered: boolean;
  score: number;
  currentStreak: number;
  bestStreakInSession: number;
  startTime: number;
  questionStartTime: number;
  timeLeft: number;
  isTimedOut: boolean;
}

export interface AttemptedQuestionRecord {
  question: Question;
  selectedOption: number | null;
  isCorrect: boolean;
}

export interface QuizResult {
  id: string;
  date: string;
  category: CategoryId;
  categoryName: string;
  difficulty: Difficulty;
  mode: QuizMode;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  accuracy: number;
  bestStreak: number;
  timeTakenSeconds: number;
  isNotesQuiz?: boolean;
  notesFileName?: string;
  notesText?: string;
  topicsToRevise?: string[];
  attemptedQuestions?: AttemptedQuestionRecord[];
  customQuizId?: string;
  customQuizCode?: string;
}

export interface QuizAttemptRecord {
  id: string;
  quizId: string;
  userName: string;
  score: number;
  totalQuestions: number;
  accuracy: number;
  date: string;
}

export interface CustomQuiz {
  id: string;
  code: string; // e.g. "CODE-101" or "QZ-8421"
  title: string;
  description: string;
  category: CategoryId;
  difficulty: Difficulty;
  mode: QuizMode;
  questions: Question[];
  createdAt: string;
  authorName: string;
  isPublished: boolean;
  attemptsCount: number;
  attempts?: QuizAttemptRecord[];
  isNotesDerived?: boolean;
}

export interface StudyQuizRecord {
  id: string;
  fileName: string;
  fileType: string;
  date: string;
  score: number;
  accuracy: number;
  difficulty: Difficulty;
  questionsAttempted: number;
  notesText: string;
  weakTopics: string[];
  questions: Question[];
}

export interface UserProfile {
  name: string;
  username: string;
  avatarColor: string;
  joinedDate: string;
  bio?: string;
}

export interface CategoryStat {
  quizzes: number;
  correct: number;
  total: number;
  points: number;
}

export interface UserStats {
  totalQuizzes: number;
  totalQuestionsAnswered: number;
  totalCorrect: number;
  totalPoints: number;
  bestStreak: number;
  categoryStats: Record<CategoryId, CategoryStat>;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  isUnlocked: boolean;
  unlockedAt?: string;
  progress?: {
    current: number;
    max: number;
  };
}

export interface LeaderboardEntry {
  id: string;
  rank: number;
  name: string;
  username: string;
  avatarColor: string;
  score: number;
  accuracy: number;
  quizzesPlayed: number;
  bestStreak: number;
  categoryScores: Record<CategoryId, number>;
  isUser?: boolean;
}

export type ActiveTab =
  | 'home'
  | 'explore'
  | 'notes'
  | 'create'
  | 'join'
  | 'leaderboard'
  | 'stats'
  | 'my-quizzes'
  | 'achievements'
  | 'profile';

