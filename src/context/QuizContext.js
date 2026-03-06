"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { QuestionResult, QuizScore, calculateScore } from '@/utils/calculateScore';
import { getCurrentDateISO } from '@/utils/formatDate';

export const QuizHistoryItem = {
  id: '',
  date: '',
  category: '',
  difficulty: '',
  score: null,
  results: []
};

const QuizContext = createContext(undefined);

const HISTORY_KEY = 'quiz_history';

export function QuizProvider({ children }) {
  // Quiz state
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [isQuizComplete, setIsQuizComplete] = useState(false);
  
  // Quiz setup
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [selectedDifficulty, setSelectedDifficulty] = useState('medium');
  const [selectedAmount, setSelectedAmount] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Quiz history
  const [quizHistory, setQuizHistory] = useState([]);
  
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
        difficulty: selectedDifficulty,
        type: 'multiple'
      });
      
      setQuestions(fetchedQuestions);
      setIsQuizActive(true);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to start quiz';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const answerQuestion = (answer) => {
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = answer === currentQuestion.correct_answer;
    
    const result = {
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
      const historyItem = {
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
  
  const value = {
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
