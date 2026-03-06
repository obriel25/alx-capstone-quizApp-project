"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchCategories } from '@/services/triviaApi';
import { useQuiz } from '@/context/QuizContext';
import { Button, Loader, ErrorMessage } from '@/components/ui';

export default function HomePage() {
  const { quizHistory } = useQuiz();
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await fetchCategories();
        setCategories(cats);
      } catch (e) {
        setError('Failed to load categories');
      } finally {
        setIsLoading(false);
      }
    };
    loadCategories();
  }, []);
  
  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const recentQuizzes = quizHistory.slice(0, 3);
  
  const getDifficultyColor = (difficulty) => {
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            🧠 QuizMaster
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Test your knowledge with fun quizzes on various topics!
          </p>
          <Link href="/quiz">
            <Button
              size="lg"
              className="bg-white text-indigo-600 hover:bg-gray-100 px-8 py-4 text-lg"
            >
              Start Playing 🎮
            </Button>
          </Link>
        </div>
      </section>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Recent Activity */}
        {recentQuizzes.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              📈 Recent Activity
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentQuizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {quiz.category}
                    </h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(quiz.difficulty)}`}>
                      {quiz.difficulty}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(quiz.date).toLocaleDateString()}
                    </span>
                    <span className={`text-lg font-bold ${
                      quiz.score.percentage >= 70 ? 'text-green-600 dark:text-green-400' :
                      quiz.score.percentage >= 50 ? 'text-yellow-600 dark:text-yellow-400' :
                      'text-red-600 dark:text-red-400'
                    }`}>
                      {quiz.score.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
        
        {/* Categories Section */}
        <section>
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              📚 Available Categories
            </h2>
            
            {/* Search Bar */}
            <div className="relative w-full md:w-80">
              <input
                type="text"
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader message="Loading categories..." />
            </div>
          ) : error ? (
            <ErrorMessage message={error} />
          ) : filteredCategories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">
                No categories found matching &quot;{searchQuery}&quot;
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredCategories.map((category) => (
                <Link
                  key={category.id}
                  href={`/quiz?category=${category.id}`}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200"
                >
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {category.name}
                  </h3>
                  <p className="text-sm text-indigo-600 dark:text-indigo-400">
                    Click to play →
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>
        
        {/* Features Section */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            ✨ Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Multiple Topics
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Choose from various categories including Science, History, Sports, and more!
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">⏱️</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Timed Questions
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Challenge yourself with timed questions to test your knowledge under pressure.
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Track Progress
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                View your quiz history and track your improvement over time.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
