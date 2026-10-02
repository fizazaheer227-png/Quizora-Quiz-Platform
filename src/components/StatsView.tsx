import React from 'react';
import {
  BarChart3,
  Trophy,
  CheckCircle2,
  Flame,
  Target,
  Sparkles,
  TrendingUp,
  Clock,
  BookOpen,
  Trash2,
  RotateCcw,
  FileText,
  UploadCloud,
} from 'lucide-react';
import { QuizResult, StudyQuizRecord, UserStats } from '../types/quiz.ts';
import { CATEGORIES } from '../data/questions.ts';

interface StatsViewProps {
  stats: UserStats;
  history: QuizResult[];
  studyQuizzes: StudyQuizRecord[];
  currentRank: number;
  onExploreQuizzes: () => void;
  onRetakeStudyQuiz?: (record: StudyQuizRecord) => void;
  onDeleteStudyQuiz?: (id: string) => void;
  onOpenNotesUpload?: () => void;
}

export const StatsView: React.FC<StatsViewProps> = ({
  stats,
  history,
  studyQuizzes = [],
  currentRank,
  onExploreQuizzes,
  onRetakeStudyQuiz,
  onDeleteStudyQuiz,
  onOpenNotesUpload,
}) => {
  const averageAccuracy =
    stats.totalQuestionsAnswered > 0
      ? Math.round((stats.totalCorrect / stats.totalQuestionsAnswered) * 100)
      : 0;

  // Recent scores for the sparkline / trend chart (last 8 quizzes)
  const recentHistory = [...history].reverse().slice(-8);

  // Maximum score for category bar scaling
  const maxCategoryPoints = Math.max(
    ...Object.values(stats.categoryStats).map((c) => c.points),
    100
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="mb-8 sm:mb-10">
        <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
          Personal Analytics
        </span>
        <h1 className="mt-1 font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Performance Dashboard
        </h1>
        <p className="mt-1 text-slate-400 text-sm sm:text-base">
          Track your domain mastery, accuracy trends, and recent arena match logs.
        </p>
      </div>

      {/* 6 Core KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 mb-10">
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-4">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">
            Total Quizzes
          </span>
          <div className="mt-2 text-2xl font-display font-extrabold text-white font-mono-tabular">
            {stats.totalQuizzes}
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Challenges cleared</p>
        </div>

        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-4">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">
            Questions
          </span>
          <div className="mt-2 text-2xl font-display font-extrabold text-white font-mono-tabular">
            {stats.totalQuestionsAnswered}
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Answers evaluated</p>
        </div>

        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-4">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">
            Avg. Accuracy
          </span>
          <div className="mt-2 text-2xl font-display font-extrabold text-emerald-400 font-mono-tabular">
            {averageAccuracy}%
          </div>
          <p className="mt-1 text-[11px] text-slate-500">{stats.totalCorrect} correct hits</p>
        </div>

        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-4">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">
            Total Points
          </span>
          <div className="mt-2 text-2xl font-display font-extrabold text-indigo-300 font-mono-tabular">
            {stats.totalPoints}
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Earned in arena</p>
        </div>

        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-4">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">
            Best Streak
          </span>
          <div className="mt-2 text-2xl font-display font-extrabold text-amber-400 font-mono-tabular flex items-center gap-1">
            <Flame className="w-5 h-5 text-amber-400 fill-amber-400" />
            <span>{stats.bestStreak}</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Consecutive correct</p>
        </div>

        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-4">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">
            Current Rank
          </span>
          <div className="mt-2 text-2xl font-display font-extrabold text-purple-400 font-mono-tabular">
            #{currentRank || 13}
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Global standing</p>
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        {/* Chart 1: Performance by Category */}
        <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display font-bold text-lg text-white">Performance by Category</h2>
              <p className="text-xs text-slate-400">Total accumulated score across each arena</p>
            </div>
            <BarChart3 className="w-5 h-5 text-indigo-400" />
          </div>

          <div className="space-y-4">
            {CATEGORIES.map((cat) => {
              const catStat = stats.categoryStats[cat.id] || {
                quizzes: 0,
                correct: 0,
                total: 0,
                points: 0,
              };
              const percentage =
                maxCategoryPoints > 0 ? (catStat.points / maxCategoryPoints) * 100 : 0;
              const accuracy =
                catStat.total > 0 ? Math.round((catStat.correct / catStat.total) * 100) : 0;

              return (
                <div key={cat.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">{cat.name}</span>
                    <div className="flex items-center gap-3 text-slate-400 font-mono-tabular">
                      <span>{catStat.quizzes} plays</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-emerald-400">{accuracy}% acc</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-bold text-indigo-300">{catStat.points} pts</span>
                    </div>
                  </div>

                  <div className="w-full h-2.5 bg-slate-800/80 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(percentage, 4)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Recent Quiz Score Progression */}
        <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="font-display font-bold text-lg text-white">Score Progression</h2>
                <p className="text-xs text-slate-400">Points scored in your recent quiz matches</p>
              </div>
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>

            {recentHistory.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-800 rounded-2xl my-4">
                <Sparkles className="w-8 h-8 text-slate-600 mb-2" />
                <p className="text-xs text-slate-400 font-medium">No quiz activity logged yet.</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Complete your first challenge to generate real performance charts.
                </p>
                <button
                  onClick={onExploreQuizzes}
                  className="mt-3 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                >
                  Play Quiz
                </button>
              </div>
            ) : (
              <div className="mt-6 mb-4">
                {/* SVG Line / Bar Chart */}
                <div className="h-44 flex items-end justify-between gap-2 pt-6 pb-2 px-2 border-b border-slate-800">
                  {recentHistory.map((item, idx) => {
                    const maxScore = Math.max(...recentHistory.map((h) => h.score), 150);
                    const heightPercent = Math.max(10, Math.round((item.score / maxScore) * 100));

                    return (
                      <div
                        key={idx}
                        className="flex-1 flex flex-col items-center gap-1.5 group relative"
                      >
                        {/* Tooltip on hover */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-10 px-2 py-1 bg-slate-900 border border-slate-700 rounded-md text-[10px] text-white whitespace-nowrap z-20 pointer-events-none">
                          {item.categoryName}: {item.score} pts ({item.accuracy}%)
                        </div>

                        <div className="text-[11px] font-mono-tabular font-semibold text-slate-400 group-hover:text-indigo-300">
                          {item.score}
                        </div>

                        <div className="w-full max-w-[36px] bg-slate-800 rounded-t-lg overflow-hidden h-28 flex items-end">
                          <div
                            className="w-full bg-gradient-to-t from-indigo-600 to-purple-500 group-hover:from-indigo-500 group-hover:to-purple-400 transition-all duration-300 rounded-t-lg"
                            style={{ height: `${heightPercent}%` }}
                          />
                        </div>

                        <span className="text-[10px] text-slate-500 truncate max-w-[45px]">
                          {item.categoryName.slice(0, 4)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="text-xs text-slate-500 pt-2 border-t border-slate-800/80 flex items-center justify-between">
            <span>Live local metric evaluation</span>
            <span className="font-mono-tabular">High: {Math.max(...(history.map((h) => h.score) || [0]), 0)} pts</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MY STUDY QUIZZES (Explicit Requirement 8) */}
      {/* ========================================================================= */}
      <div className="mb-14">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Grounded Notes Engine</span>
            </div>
            <h2 className="font-display font-bold text-2xl text-white tracking-tight mt-0.5">
              MY STUDY QUIZZES
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Previous study challenges generated from your uploaded notes and textbooks.
            </p>
          </div>

          {onOpenNotesUpload && (
            <button
              onClick={onOpenNotesUpload}
              className="self-start sm:self-center inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/25 transition-all"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Upload New Notes</span>
            </button>
          )}
        </div>

        {studyQuizzes.length === 0 ? (
          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-base text-white">No Study Quizzes Yet</h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
              Upload your lecture notes, textbook chapters, or PDFs in the Quiz Setup page to generate customized study challenges.
            </p>
            {onOpenNotesUpload && (
              <button
                onClick={onOpenNotesUpload}
                className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload First Notes File</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {studyQuizzes.map((record) => {
              const formattedDate = new Date(record.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              return (
                <div
                  key={record.id}
                  className="bg-[#111827] border border-slate-800 hover:border-indigo-500/40 rounded-3xl p-5 sm:p-6 shadow-xl transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    {/* Header: File info & Delete button */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-display font-bold text-sm sm:text-base text-white truncate max-w-[200px] sm:max-w-xs" title={record.fileName}>
                            {record.fileName}
                          </h4>
                          <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                            <span className="font-mono-tabular">{record.fileType}</span>
                            <span aria-hidden="true">·</span>
                            <span>{formattedDate}</span>
                          </div>
                        </div>
                      </div>

                      {onDeleteStudyQuiz && (
                        <button
                          type="button"
                          onClick={() => onDeleteStudyQuiz(record.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                          title="Delete study quiz record"
                          aria-label="Delete study quiz"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Metrics Row */}
                    <div className="grid grid-cols-3 gap-2 mt-5 p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
                      <div>
                        <div className="text-[10px] uppercase font-medium text-slate-400">Score</div>
                        <div className="font-display font-extrabold text-sm sm:text-base text-white font-mono-tabular mt-0.5">
                          {record.score} <span className="text-[10px] text-slate-400 font-normal">pts</span>
                        </div>
                      </div>

                      <div>
                        <div className="text-[10px] uppercase font-medium text-slate-400">Accuracy</div>
                        <div className="font-mono-tabular font-bold text-sm sm:text-base text-emerald-400 mt-0.5">
                          {record.accuracy}%
                        </div>
                      </div>

                      <div>
                        <div className="text-[10px] uppercase font-medium text-slate-400">Questions</div>
                        <div className="font-display font-extrabold text-sm sm:text-base text-indigo-300 font-mono-tabular mt-0.5">
                          {record.questionsAttempted}
                        </div>
                      </div>
                    </div>

                    {/* Weak topics preview if any */}
                    {record.weakTopics && record.weakTopics.length > 0 && (
                      <div className="mt-4 text-xs">
                        <span className="text-[11px] font-semibold text-amber-400">Topics to review:</span>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {record.weakTopics.slice(0, 3).map((topic, i) => (
                            <span
                              key={i}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 truncate max-w-[160px]"
                            >
                              {topic}
                            </span>
                          ))}
                          {record.weakTopics.length > 3 && (
                            <span className="text-[10px] text-slate-400 self-center">
                              +{record.weakTopics.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer Actions */}
                  <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[11px] capitalize text-slate-400 font-medium">
                      {record.difficulty} difficulty
                    </span>

                    {onRetakeStudyQuiz && (
                      <button
                        type="button"
                        onClick={() => onRetakeStudyQuiz(record)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/25 transition-all active:scale-95"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>RETAKE QUIZ</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Activity List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display font-bold text-xl text-white">RECENT ACTIVITY</h2>
            <p className="text-xs text-slate-400">Detailed breakdown of your completed matches</p>
          </div>
          {history.length > 0 && (
            <span className="text-xs text-slate-500 font-mono-tabular">
              {history.length} matches recorded
            </span>
          )}
        </div>

        {history.length === 0 ? (
          <div className="bg-[#111827] border border-slate-800 rounded-2xl p-8 text-center">
            <p className="text-sm text-slate-400">No recent activity recorded.</p>
            <p className="text-xs text-slate-500 mt-1">
              Start a quiz challenge to log your score and climb the leaderboards!
            </p>
            <button
              onClick={onExploreQuizzes}
              className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30"
            >
              Start First Quiz
            </button>
          </div>
        ) : (
          <div className="bg-[#111827] border border-slate-800 rounded-3xl divide-y divide-slate-800/70 overflow-hidden shadow-xl">
            {history.slice(0, 10).map((item) => {
              const formattedDate = new Date(item.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={item.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-800/30 transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                      <Target className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <div className="font-semibold text-white text-sm sm:text-base flex items-center gap-2">
                        <span>{item.categoryName}</span>
                        <span className="text-[10px] uppercase font-mono-tabular px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/60">
                          {item.difficulty}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                        <span>{item.mode} mode</span>
                        <span aria-hidden="true">·</span>
                        <span>{formattedDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 sm:gap-8 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/50">
                    <div className="text-left sm:text-right">
                      <div className="text-xs text-slate-400">Score</div>
                      <div className="font-display font-extrabold text-sm sm:text-base text-white font-mono-tabular">
                        {item.correctAnswers}/{item.totalQuestions}
                      </div>
                    </div>

                    <div className="text-left sm:text-right">
                      <div className="text-xs text-slate-400">Accuracy</div>
                      <div className="font-mono-tabular font-bold text-sm sm:text-base text-emerald-400">
                        {item.accuracy}%
                      </div>
                    </div>

                    <div className="text-right min-w-[70px]">
                      <div className="text-xs text-slate-400">Points</div>
                      <div className="font-display font-extrabold text-sm sm:text-base text-indigo-300 font-mono-tabular">
                        {item.score} <span className="text-[10px] text-slate-400 font-normal">pts</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
