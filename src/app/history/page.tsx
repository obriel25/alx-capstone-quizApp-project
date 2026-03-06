"use client";

import { useQuiz } from '@/context/QuizContext';
import { formatDate, calculateAverageScore, getBestScore } from '@/utils';
import { Button } from '@/components/ui';

export default function HistoryPage() {
  const { quizHistory, clearHistory } = useQuiz();
  
  const scores = quizHistory.map(h => h.score.percentage);
  const averageScore = calculateAverageScore(scores);
  const bestScore = getBestScore(scores);
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            📊 Quiz History
          </h1>
          {quizHistory.length > 0 && (
            <Button onClick={clearHistory} variant="danger" size="sm">
              Clear History
            </Button>
          )}
        </div>
        
        {/* Stats Overview */}
        {quizHistory.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Quizzes</div>
              <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                {quizHistory.length}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Average Score</div>
              <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                {averageScore}%
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Best Score</div>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {bestScore}%
              </div>
            </div>
          </div>
        )}
        
        {/* History List */}
        {quizHistory.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Quiz History Yet
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Take your first quiz to see your history here!
            </p>
            <Button onClick={() => window.location.href = '/quiz'}>
              Start Quiz
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {quizHistory.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {item.category}
                      </h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        item.difficulty === 'easy' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                        item.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                      }`}>
                        {item.difficulty}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(item.date)}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${
                        item.score.percentage >= 70 ? 'text-green-600 dark:text-green-400' :
                        item.score.percentage >= 50 ? 'text-yellow-600 dark:text-yellow-400' :
                        'text-red-600 dark:text-red-400'
                      }`}>
                        {item.score.percentage}%
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Score
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                        {item.score.correctAnswers}/{item.score.totalQuestions}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Correct
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="mt-4 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      item.score.percentage >= 70 ? 'bg-green-500' :
                      item.score.percentage >= 50 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${item.score.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
