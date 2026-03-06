"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuiz } from '@/context/QuizContext';
import { useAuth } from '@/context/AuthContext';
import { QuestionCard } from '@/components/QuestionCard';
import { Timer } from '@/components/Timer';
import { Button, Loader, ErrorMessage } from '@/components/ui';

export default function QuizPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const {
    questions,
    currentQuestionIndex,
    answers,
    isQuizActive,
    isQuizComplete,
    categories,
    selectedCategory,
    selectedDifficulty,
    selectedAmount,
    isLoading,
    error,
    setSelectedCategory,
    setSelectedDifficulty,
    setSelectedAmount,
    fetchCategories,
    startQuiz,
    answerQuestion,
    nextQuestion,
    resetQuiz
  } = useQuiz();
  
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [timerKey, setTimerKey] = useState(0);
  
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);
  
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);
  
  // Show loading while checking auth
  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader size="lg" message="Loading..." />
      </div>
    );
  }
  
  const currentQuestion = questions[currentQuestionIndex];
  
  const handleSelectAnswer = (answer) => {
    if (isRevealed) return;
    setSelectedAnswer(answer);
  };
  
  const handleSubmitAnswer = () => {
    if (!selectedAnswer) return;
    answerQuestion(selectedAnswer);
    setIsRevealed(true);
  };
  
  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setIsRevealed(false);
    setTimerKey(prev => prev + 1);
    nextQuestion();
  };
  
  const handleTimeUp = () => {
    if (!selectedAnswer) {
      // Auto-submit with no answer (will be marked wrong)
      answerQuestion('');
      setIsRevealed(true);
    }
  };
  
  const handleFinishQuiz = () => {
    router.push('/');
  };
  
  const handlePlayAgain = () => {
    resetQuiz();
    setSelectedAnswer(null);
    setIsRevealed(false);
    setTimerKey(0);
  };
  
  // Quiz Setup View
  if (!isQuizActive && !isQuizComplete) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              ⚙️ Quiz Setup
            </h1>
            
            {error && <ErrorMessage message={error} onRetry={fetchCategories} />}
            
            {/* Category Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(Number(e.target.value))}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value={0}>All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Difficulty Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Difficulty
              </label>
              <div className="grid grid-cols-3 gap-3">
                {['easy', 'medium', 'hard'].map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setSelectedDifficulty(diff)}
                    className={`p-3 rounded-lg border-2 font-medium transition-all ${
                      selectedDifficulty === diff
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                        : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {diff.charAt(0).toUpperCase() + diff.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Number of Questions */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Number of Questions: {selectedAmount}
              </label>
              <input
                type="range"
                min="5"
                max="20"
                step="5"
                value={selectedAmount}
                onChange={(e) => setSelectedAmount(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>5</span>
                <span>10</span>
                <span>15</span>
                <span>20</span>
              </div>
            </div>
            
            {/* Start Button */}
            <Button
              onClick={startQuiz}
              isLoading={isLoading}
              className="w-full text-lg"
              size="lg"
            >
              {isLoading ? 'Loading Questions...' : 'Start Quiz 🚀'}
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader size="lg" message="Loading your quiz questions..." />
      </div>
    );
  }
  
  // Quiz Active View
  if (isQuizActive && currentQuestion) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Progress and Timer */}
          <div className="flex justify-between items-center mb-6">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Score: <span className="font-bold text-indigo-600 dark:text-indigo-400">{answers.filter(a => a.isCorrect).length}</span> / {answers.length}
            </div>
            <Timer
              key={timerKey}
              initialTime={30}
              onTimeUp={handleTimeUp}
              isActive={!isRevealed}
            />
          </div>
          
          {/* Question Card */}
          <QuestionCard
            question={currentQuestion}
            currentIndex={currentQuestionIndex}
            totalQuestions={questions.length}
            selectedAnswer={selectedAnswer}
            isRevealed={isRevealed}
            onSelectAnswer={handleSelectAnswer}
          />
          
          {/* Action Buttons */}
          <div className="mt-6 flex justify-center gap-4">
            {!isRevealed ? (
              <Button
                onClick={handleSubmitAnswer}
                disabled={!selectedAnswer}
                size="lg"
              >
                Submit Answer
              </Button>
            ) : (
              <Button
                onClick={handleNextQuestion}
                size="lg"
              >
                {currentQuestionIndex < questions.length - 1 ? 'Next Question →' : 'Finish Quiz'}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  // Quiz Complete View
  if (isQuizComplete) {
    const score = answers.filter(a => a.isCorrect).length;
    const percentage = Math.round((score / questions.length) * 100);
    
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">
              {percentage >= 70 ? '🎉' : percentage >= 50 ? '👍' : '💪'}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Quiz Complete!
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {percentage >= 90 ? 'Outstanding performance!' : 
               percentage >= 70 ? 'Great job!' : 
               percentage >= 50 ? 'Good effort!' : 'Keep practicing!'}
            </p>
            
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-6 mb-8">
              <div className="text-5xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
                {percentage}%
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                {score} out of {questions.length} correct
              </div>
            </div>
            
            <div className="flex gap-4 justify-center">
              <Button onClick={handlePlayAgain} variant="outline" size="lg">
                Play Again
              </Button>
              <Button onClick={handleFinishQuiz} size="lg">
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return null;
}
