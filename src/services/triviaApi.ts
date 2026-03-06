// API service for Open Trivia Database

const BASE_URL = 'https://opentdb.com';

export interface Category {
  id: number;
  name: string;
}

export interface Question {
  category: string;
  type: string;
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
  all_answers?: string[];
}

export interface QuizSetup {
  amount: number;
  category: number;
  difficulty: 'easy' | 'medium' | 'hard';
  type: 'multiple' | 'boolean';
}

export interface ApiResponse {
  response_code: number;
  results: Question[];
}

export interface CategoryResponse {
  trivia_categories: Category[];
}

/**
 * Fetch available categories from the API
 */
export async function fetchCategories(): Promise<Category[]> {
  try {
    const response = await fetch(`${BASE_URL}/api_category.php`);
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }
    const data: CategoryResponse = await response.json();
    return data.trivia_categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
}

/**
 * Fetch quiz questions based on setup
 */
export async function fetchQuizQuestions(setup: QuizSetup): Promise<Question[]> {
  const { amount, category, difficulty, type } = setup;
  
  let url = `${BASE_URL}/api.php?amount=${amount}&type=${type}`;
  
  if (category !== 0) {
    url += `&category=${category}`;
  }
  
  if (difficulty) {
    url += `&difficulty=${difficulty}`;
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch questions');
    }
    const data: ApiResponse = await response.json();
    
    if (data.response_code !== 0) {
      if (data.response_code === 1) {
        throw new Error('Not enough questions available for this category and difficulty');
      }
      throw new Error('Failed to fetch questions. Please try again.');
    }
    
    // Add shuffled answers to each question
    return data.results.map(question => ({
      ...question,
      all_answers: shuffleArray([...question.incorrect_answers, question.correct_answer])
    }));
  } catch (error) {
    console.error('Error fetching quiz questions:', error);
    throw error;
  }
}

/**
 * Shuffle array using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Decode HTML entities in API response
 */
export function decodeHtml(html: string): string {
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
}
