// API service for Open Trivia Database

const BASE_URL = 'https://opentdb.com';

/**
 * Fetch available categories from the API
 */
export async function fetchCategories() {
  try {
    const response = await fetch(`${BASE_URL}/api_category.php`);
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }
    const data = await response.json();
    return data.trivia_categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
}

/**
 * Fetch quiz questions based on setup
 */
export async function fetchQuizQuestions(setup) {
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
    const data = await response.json();
    
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
function shuffleArray(array) {
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
export function decodeHtml(html) {
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
}
