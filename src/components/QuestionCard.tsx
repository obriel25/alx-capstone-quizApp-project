"use client";

import { Question } from '@/services/triviaApi';
import { AnswerOption } from './AnswerOption';

interface QuestionCardProps {
  question: Question;
  currentIndex: number;
  totalQuestions: number;
  selectedAnswer: string | null;
  isRevealed: boolean;
  onSelectAnswer: (answer: string) => void;
}

export function QuestionCard({
  question,
  currentIndex,
  totalQuestions,
  selectedAnswer,
  isRevealed,
  onSelectAnswer
}: QuestionCardProps) {
  const decodeHtml = (html: string): string => {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  };
  
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'hard':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Question {currentIndex + 1} of {totalQuestions}
        </span>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
          {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
        </span>
      </div>
      
      {/* Category */}
      <div className="mb-4">
        <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium uppercase tracking-wide">
          {decodeHtml(question.category)}
        </span>
      </div>
      
      {/* Question */}
      <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-6">
        {decodeHtml(question.question)}
      </h2>
      
      {/* Answer Options */}
      <div className="space-y-3">
        {question.all_answers?.map((answer, index) => (
          <AnswerOption
            key={index}
            answer={decodeHtml(answer)}
            index={index}
            isSelected={selectedAnswer === answer}
            isCorrect={answer === question.correct_answer}
            isRevealed={isRevealed}
            onSelect={onSelectAnswer}
            disabled={isRevealed}
          />
        ))}
      </div>
    </div>
  );
}
