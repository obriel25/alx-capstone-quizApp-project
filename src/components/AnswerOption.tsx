"use client";

interface AnswerOptionProps {
  answer: string;
  index: number;
  isSelected: boolean;
  isCorrect?: boolean;
  isRevealed: boolean;
  onSelect: (answer: string) => void;
  disabled: boolean;
}

const optionLabels = ['A', 'B', 'C', 'D'];

export function AnswerOption({
  answer,
  index,
  isSelected,
  isCorrect,
  isRevealed,
  onSelect,
  disabled
}: AnswerOptionProps) {
  const getOptionStyles = () => {
    if (!isRevealed) {
      return isSelected
        ? 'bg-indigo-100 border-indigo-500 dark:bg-indigo-900 dark:border-indigo-400'
        : 'bg-white border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700';
    }
    
    if (isCorrect) {
      return 'bg-green-100 border-green-500 dark:bg-green-900 dark:border-green-400';
    }
    
    if (isSelected && !isCorrect) {
      return 'bg-red-100 border-red-500 dark:bg-red-900 dark:border-red-400';
    }
    
    return 'bg-white border-gray-300 dark:bg-gray-800 dark:border-gray-600 opacity-60';
  };
  
  return (
    <button
      onClick={() => onSelect(answer)}
      disabled={disabled}
      className={`w-full p-4 text-left border-2 rounded-lg transition-all duration-200 flex items-center gap-3 ${getOptionStyles()} ${
        disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:shadow-md'
      }`}
    >
      <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
        isSelected && !isRevealed
          ? 'bg-indigo-500 text-white'
          : isRevealed && isCorrect
          ? 'bg-green-500 text-white'
          : isRevealed && isSelected && !isCorrect
          ? 'bg-red-500 text-white'
          : 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300'
      }`}>
        {optionLabels[index]}
      </span>
      <span className="flex-1 text-gray-800 dark:text-gray-200">{answer}</span>
      {isRevealed && isCorrect && (
        <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )}
      {isRevealed && isSelected && !isCorrect && (
        <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
    </button>
  );
}
