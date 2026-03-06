"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Question, Category, QuizSetup } from '@/services/triviaApi';
import { QuestionResult, QuizScore } from '@/utils/calculateScore';
import { getCurrentDateISO } from '@/utils/formatDate';

export interface QuizHistoryItem {
  id: string;
  date: string;
  category: string;
  difficulty: string;
  score: QuizScore;
  results: QuestionResult[];
}

interface QuizContextType {
  // Quiz state
  questions: Question[];
  currentQuestionIndex: number;
  answers: QuestionResult[];
  isQuizActive: boolean;
  isQuizComplete: boolean;
  
  // Quiz setup
  categories: Category[];
  selectedCategory: number;
  selectedDifficulty: string;
  selectedAmount: number;
  isLoading: boolean;
  error: string | null;
  
  // Quiz history
  quizHistory: QuizHistoryItem[];
  
  // Actions
  setSelectedCategory: (category: number) => void;
  setSelectedDifficulty: (difficulty: string) => void;
  setSelectedAmount: (amount: number) => void;
  fetchCategories: () => Promise<void>;
  startQuiz: () => Promise<void>;
  answerQuestion: (answer: string) => void;
  nextQuestion: () => void;
  resetQuiz: () => void;
  clearHistory: () => void;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

const HISTORY_KEY = 'quiz_history';

export function QuizProvider({ children }: { children: ReactNode }) {
  // Quiz state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuestionResult[]>([]);
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [isQuizComplete, setIsQuizComplete] = useState(false);
  
  // Quiz setup
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [selectedDifficulty, setSelectedDifficulty] = useState('medium');
  const [selectedAmount, setSelectedAmount] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Quiz history
  const [quizHistory, setQuizHistory] = useState<QuizHistoryItem[]>([]);
  
  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem(HISTORY_KEY);
    if (savedHistory) {
      try {
        setQuizHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to load quiz history:', e);
      }
    }
  }, []);
  
  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(quizHistory));
  }, [quizHistory]);
  
  const fetchCategories = async () => {
    try {
      const { fetchCategories: fetchCats } = await import('@/services/triviaApi');
      const cats = await fetchCats();
      setCategories(cats);
    } catch (e) {
      console.error('Failed to fetch categories:', e);
      setError('Failed to load categories');
    }
  };
  
  const startQuiz = async () => {
    setIsLoading(true);
    setError(null);
    setAnswers([]);
    setCurrentQuestionIndex(0);
    setIsQuizComplete(false);
    
    try {
      const { fetchQuizQuestions } = await import('@/services/triviaApi');
      const fetchedQuestions = await fetchQuizQuestions({
        amount: selectedAmount,
        category: selectedCategory,
        difficulty: selectedDifficulty as 'easy' | 'medium' | 'hard',
        type: 'multiple'
      });
      
      setQuestions(fetchedQuestions);
      setIsQuizActive(true);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to start quiz';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const answerQuestion = (answer: string) => {
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = answer === currentQuestion.correct_answer;
    
    const result: QuestionResult = {
      question: currentQuestion.question,
      userAnswer: answer,
      correctAnswer: currentQuestion.correct_answer,
      isCorrect
    };
    
    setAnswers(prev => [...prev, result]);
  };
  
  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Quiz complete - save to history
      const { calculateScore } = require('@/utils/calculateScore');
      const score = calculateScore(answers);
      
      const category = categories.find(c => c.id === selectedCategory);
      const historyItem: QuizHistoryItem = {
        id: Date.now().toString(),
        date: getCurrentDateISO(),
        category: category?.name || 'Mixed',
        difficulty: selectedDifficulty,
        score,
        results: answers
      };
      
      setQuizHistory(prev => [historyItem, ...prev]);
      setIsQuizComplete(true);
      setIsQuizActive(false);
    }
  };
  
  const resetQuiz = () => {
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setIsQuizActive(false);
    setIsQuizComplete(false);
    setError(null);
  };
  
  const clearHistory = () => {
    setQuizHistory([]);
    localStorage.removeItem(HISTORY_KEY);
  };
  
  const value: QuizContextType = {
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
    quizHistory,
    setSelectedCategory,
    setSelectedDifficulty,
    setSelectedAmount,
    fetchCategories,
    startQuiz,
    answerQuestion,
    nextQuestion,
    resetQuiz,
    clearHistory
  };
  
  return (
    <QuizContext.Provider value={value}>
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz() {
  const context = useContext(QuizContext);
  if (context === undefined) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
}
