import React, { useState, useEffect, useRef } from 'react';
import {
  Flame,
  Volume2,
  VolumeX,
  Clock,
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
  X,
  HelpCircle,
} from 'lucide-react';
import { Question, QuizConfig, QuizResult } from '../types/quiz.ts';
import { CATEGORIES } from '../data/questions.ts';
import { soundEffects } from '../utils/sound.ts';

interface QuizScreenProps {
  config: QuizConfig;
  questions: Question[];
  isMuted: boolean;
  setIsMuted: React.Dispatch<React.SetStateAction<boolean>>;
  onFinishQuiz: (result: QuizResult) => void;
  onExitQuiz: () => void;
}

const QUESTION_TIME_LIMIT = 15; // 15 seconds for timed mode

export const QuizScreen: React.FC<QuizScreenProps> = ({
  config,
  questions,
  isMuted,
  setIsMuted,
  onFinishQuiz,
  onExitQuiz,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isTimedOut, setIsTimedOut] = useState(false);
  const [score, setScore] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [streakBonusNotice, setStreakBonusNotice] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME_LIMIT);
  const [confirmExit, setConfirmExit] = useState(false);

  // Tracking answers for results breakdown
  const [userAnswers, setUserAnswers] = useState<
    { questionId: string; selected: number | null; correct: number; isCorrect: boolean }[]
  >([]);

  const quizStartTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentQuestion = questions[currentIndex];
  const categoryMeta = CATEGORIES.find((c) => c.id === config.category) || CATEGORIES[0];
  const isLastQuestion = currentIndex === questions.length - 1;

  // Question points based on difficulty
  const basePoints = config.difficulty === 'easy' ? 10 : config.difficulty === 'medium' ? 20 : 30;

  // Timer loop for timed mode
  useEffect(() => {
    if (config.mode !== 'timed' || isAnswered || isTimedOut) return;

    setTimeLeft(QUESTION_TIME_LIMIT);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleTimeout();
          return 0;
        }
        if (prev <= 4) {
          soundEffects.playTick(isMuted);
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, isAnswered, isTimedOut, config.mode, isMuted]);

  // Handle question timeout
  const handleTimeout = () => {
    setIsTimedOut(true);
    setIsAnswered(true);
    setSelectedOption(null);
    setCurrentStreak(0);
    soundEffects.playIncorrect(isMuted);

    setUserAnswers((prev) => [
      ...prev,
      {
        questionId: currentQuestion.id,
        selected: null,
        correct: currentQuestion.correctAnswerIndex,
        isCorrect: false,
      },
    ]);
  };

  // Handle option selection
  const handleSelectOption = (index: number) => {
    if (isAnswered) return;
    if (timerRef.current) clearInterval(timerRef.current);

    setSelectedOption(index);
    setIsAnswered(true);

    const isCorrect = index === currentQuestion.correctAnswerIndex;
    let newScore = score;
    let newStreak = currentStreak;
    let newBestStreak = bestStreak;
    let bonusText: string | null = null;

    if (isCorrect) {
      newStreak = currentStreak + 1;
      if (newStreak > newBestStreak) {
        newBestStreak = newStreak;
        setBestStreak(newBestStreak);
      }
      setCurrentStreak(newStreak);

      let earnedPoints = basePoints;

      // Streak Bonus calculations:
      // 3 in a row = +10 bonus
      // 5 in a row = +20 bonus
      if (newStreak === 3) {
        earnedPoints += 10;
        bonusText = '+10 Streak Bonus!';
        soundEffects.playStreak(isMuted);
      } else if (newStreak >= 5 && newStreak % 5 === 0) {
        earnedPoints += 20;
        bonusText = '+20 Mega Streak Bonus!';
        soundEffects.playStreak(isMuted);
      } else {
        soundEffects.playCorrect(isMuted);
      }

      newScore = score + earnedPoints;
      setScore(newScore);
      setStreakBonusNotice(bonusText);
    } else {
      newStreak = 0;
      setCurrentStreak(0);
      setStreakBonusNotice(null);
      soundEffects.playIncorrect(isMuted);
    }

    setUserAnswers((prev) => [
      ...prev,
      {
        questionId: currentQuestion.id,
        selected: index,
        correct: currentQuestion.correctAnswerIndex,
        isCorrect,
      },
    ]);
  };

  // Next Question or Finish Quiz
  const handleNextQuestion = () => {
    setStreakBonusNotice(null);
    if (isLastQuestion) {
      // Calculate final results
      const totalTimeSeconds = Math.max(1, Math.round((Date.now() - quizStartTimeRef.current) / 1000));
      const correctCount = userAnswers.filter((a) => a.isCorrect).length;
      const wrongCount = questions.length - correctCount;
      const accuracy = Math.round((correctCount / questions.length) * 100);

      const attemptedQuestions = userAnswers.map((ua, idx) => ({
        question: questions[idx],
        selectedOption: ua.selected,
        isCorrect: ua.isCorrect,
      }));

      const result: QuizResult = {
        id: `quiz-${Date.now()}`,
        date: new Date().toISOString(),
        category: config.category,
        categoryName: config.customQuizTitle || (config.isNotesQuiz ? (config.notesFileName || 'My Study Notes') : categoryMeta.name),
        difficulty: config.difficulty,
        mode: config.mode,
        score,
        totalQuestions: questions.length,
        correctAnswers: correctCount,
        wrongAnswers: wrongCount,
        accuracy,
        bestStreak: Math.max(bestStreak, currentStreak),
        timeTakenSeconds: totalTimeSeconds,
        isNotesQuiz: config.isNotesQuiz,
        notesFileName: config.notesFileName,
        notesText: config.notesText,
        customQuizId: config.customQuizId,
        customQuizCode: config.customQuizCode,
        attemptedQuestions,
      };

      onFinishQuiz(result);
    } else {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setIsTimedOut(false);
      setTimeLeft(QUESTION_TIME_LIMIT);
    }
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (confirmExit) return;

      if (!isAnswered) {
        if (e.key === '1' || e.key.toLowerCase() === 'a') handleSelectOption(0);
        if (e.key === '2' || e.key.toLowerCase() === 'b') handleSelectOption(1);
        if (e.key === '3' || e.key.toLowerCase() === 'c') handleSelectOption(2);
        if (e.key === '4' || e.key.toLowerCase() === 'd') handleSelectOption(3);
      } else {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleNextQuestion();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const progressPercent = ((currentIndex + 1) / questions.length) * 100;
  const isCurrentCorrect = selectedOption === currentQuestion.correctAnswerIndex;

  return (
    <div className="min-h-[85vh] flex flex-col justify-between max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Top HUD Area */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
          {/* Category & Difficulty */}
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400 font-medium">
            <span className="text-white font-semibold">
              {config.customQuizTitle || (config.isNotesQuiz ? (config.notesFileName || 'Study Notes') : categoryMeta.name)}
            </span>
            <span aria-hidden="true">·</span>
            <span className="capitalize text-indigo-400">{config.difficulty}</span>
            <span aria-hidden="true">·</span>
            <span className="capitalize">{config.mode}</span>
          </div>

          {/* Quick HUD controls: Streak, Sound, Exit */}
          <div className="flex items-center gap-3">
            {/* Streak Counter */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold font-mono-tabular transition-all ${
                currentStreak >= 3
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-400'
              }`}
              title="Current consecutive correct answer streak"
            >
              <Flame className={`w-3.5 h-3.5 ${currentStreak >= 3 ? 'text-amber-400 fill-amber-400' : 'text-slate-500'}`} />
              <span>{currentStreak} Streak</span>
            </div>

            {/* Score Display */}
            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-950/60 border border-indigo-500/30 text-xs font-bold font-mono-tabular text-indigo-300">
              <span>{score}</span>
              <span className="text-[10px] text-indigo-400 font-normal">pts</span>
            </div>

            {/* Sound Toggle */}
            <button
              onClick={() => setIsMuted((prev) => !prev)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
              aria-label="Toggle audio"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>

            {/* Exit Quiz */}
            <button
              onClick={() => setConfirmExit(true)}
              className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
              title="Exit Quiz"
              aria-label="Exit quiz session"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress Bar & Question Counter */}
        <div>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span className="font-semibold text-slate-200">
              Question {currentIndex + 1} of {questions.length}
            </span>
            {config.mode === 'timed' && (
              <div
                className={`flex items-center gap-1.5 font-mono-tabular font-bold text-xs ${
                  timeLeft <= 4 ? 'text-rose-400 animate-pulse' : 'text-slate-300'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{timeLeft}s</span>
              </div>
            )}
          </div>

          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300 ease-out rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Center Question & Options Box */}
      <div className="my-8 sm:my-10 space-y-8">
        {/* Streak bonus banner if triggered */}
        {streakBonusNotice && (
          <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 animate-bounce">
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span>{streakBonusNotice}</span>
          </div>
        )}

        {/* Question Statement */}
        <div className="text-center sm:text-left">
          <h2 className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-white leading-snug">
            {currentQuestion.question}
          </h2>
        </div>

        {/* 4 Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {currentQuestion.options.map((option, idx) => {
            const letter = ['A', 'B', 'C', 'D'][idx];
            const isSelected = selectedOption === idx;
            const isCorrectAnswer = idx === currentQuestion.correctAnswerIndex;

            let buttonStyles =
              'bg-[#111827]/90 border-slate-800 hover:border-indigo-500/60 hover:bg-slate-800/80 text-slate-200';
            let badgeStyles = 'bg-slate-800 text-slate-400 border-slate-700';

            if (isAnswered) {
              if (isCorrectAnswer) {
                // Correct answer is highlighted in emerald
                buttonStyles = 'bg-emerald-950/40 border-emerald-500/70 text-emerald-200 shadow-md shadow-emerald-950/50';
                badgeStyles = 'bg-emerald-500 text-black font-bold border-emerald-400';
              } else if (isSelected && !isCorrectAnswer) {
                // User picked wrong answer
                buttonStyles = 'bg-rose-950/40 border-rose-500/70 text-rose-200 shadow-md shadow-rose-950/50';
                badgeStyles = 'bg-rose-500 text-white font-bold border-rose-400';
              } else {
                // Other unselected options dimmed
                buttonStyles = 'bg-slate-900/40 border-slate-800/50 text-slate-500 opacity-60';
                badgeStyles = 'bg-slate-900 text-slate-600 border-slate-800';
              }
            }

            return (
              <button
                key={idx}
                type="button"
                disabled={isAnswered}
                onClick={() => handleSelectOption(idx)}
                className={`p-4 sm:p-5 rounded-2xl border text-left transition-all duration-150 flex items-start gap-3.5 group relative min-h-[72px] ${buttonStyles}`}
              >
                <div
                  className={`w-7 h-7 rounded-lg border flex items-center justify-center text-xs font-semibold shrink-0 mt-0.5 transition-colors ${badgeStyles}`}
                >
                  {letter}
                </div>
                <div className="text-sm sm:text-base font-medium leading-relaxed pr-6">
                  {option}
                </div>

                {/* State Icons */}
                {isAnswered && isCorrectAnswer && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 absolute right-4 top-1/2 -translate-y-1/2" />
                )}
                {isAnswered && isSelected && !isCorrectAnswer && (
                  <XCircle className="w-5 h-5 text-rose-400 absolute right-4 top-1/2 -translate-y-1/2" />
                )}
              </button>
            );
          })}
        </div>

        {/* Feedback Area After Answering */}
        {isAnswered && (
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800/90 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                {isTimedOut ? (
                  <>
                    <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
                    <span className="font-semibold text-amber-300 text-sm sm:text-base">
                      Time expired!
                    </span>
                  </>
                ) : isCurrentCorrect ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span className="font-semibold text-emerald-300 text-sm sm:text-base">
                      Correct! +{basePoints} pts
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                    <span className="font-semibold text-rose-300 text-sm sm:text-base">
                      Not quite!
                    </span>
                  </>
                )}
              </div>

              {currentQuestion.topic && (
                <div className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-indigo-950/60 border border-indigo-500/30 text-indigo-300">
                  Topic: {currentQuestion.topic}
                </div>
              )}
            </div>

            {/* Why? Explanation */}
            {currentQuestion.explanation && (
              <div className="text-xs sm:text-sm text-slate-300 leading-relaxed pl-7">
                <span className="font-bold text-white mr-1.5">Why?</span>
                <span>{currentQuestion.explanation}</span>
              </div>
            )}

            {/* From your notes: Excerpt */}
            {currentQuestion.sourceExcerpt && (
              <div className="ml-7 p-3 rounded-xl bg-slate-800/60 border-l-2 border-l-indigo-400 text-xs text-slate-300 space-y-1">
                <div className="font-semibold text-indigo-300 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                  <span>From your notes:</span>
                </div>
                <p className="italic text-slate-300 leading-relaxed">
                  &ldquo;{currentQuestion.sourceExcerpt}&rdquo;
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Action Bar */}
      <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
          <span>Shortcuts:</span>
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono-tabular">1-4</kbd>
          <span>to answer</span>
          <span aria-hidden="true">·</span>
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono-tabular">Enter</kbd>
          <span>for next</span>
        </div>

        <div className="w-full sm:w-auto flex justify-end">
          {isAnswered ? (
            <button
              onClick={handleNextQuestion}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm sm:text-base shadow-lg shadow-indigo-600/30 transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>{isLastQuestion ? 'VIEW RESULTS' : 'NEXT QUESTION'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="text-xs text-slate-500 py-3">
              Select an option above to lock in your answer
            </div>
          )}
        </div>
      </div>

      {/* Exit Confirmation Modal */}
      {confirmExit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-white">Exit Challenge?</h3>
              <p className="text-xs text-slate-400 mt-1">
                Your current score and streak in this session will not be saved to the leaderboard.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmExit(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:bg-slate-800"
              >
                Resume Quiz
              </button>
              <button
                type="button"
                onClick={onExitQuiz}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow"
              >
                Exit Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
