import { Deck, Flashcard, FlashCardAnswer, FlashCardValidationResponse, FlashCardSession } from "../types";

const BASE_URL = 'http://localhost:3001/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

async function fetchData<T>(
  url: string,
  method: string = 'GET',
  body?: any
): Promise<ApiResponse<T>> {
  try {
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const errorData = await response.json();
      return { error: errorData.message || 'An error occurred' };
    }

    const data = await response.json();
    return { data };
  } catch (error: any) {
    return { error: error.message || 'Network error' };
  }
}

// Deck Management
export const getAllDecks = async () => {
  return fetchData<Deck[]>(`${BASE_URL}/decks`);
};

export const getDeckById = async (id: number) => {
  return fetchData<Deck>(`${BASE_URL}/decks/${id}`);
};

export const createDeck = async (name: string, description: string) => {
  return fetchData<Deck>(`${BASE_URL}/decks`, 'POST', { name, description });
};

export const updateDeck = async (id: number, updates: Partial<Deck>) => {
  return fetchData<Deck>(`${BASE_URL}/decks/${id}`, 'PUT', updates);
};

export const deleteDeck = async (id: number) => {
  return fetchData<{ message: string }>(`${BASE_URL}/decks/${id}`, 'DELETE');
};

// Get next unseen card from a deck
export const getNextUnseenCard = async (deckId: number) => {
  return fetchData<Flashcard>(`${BASE_URL}/decks/${deckId}/next-card`);
};

// Reset all cards in a deck to unseen
export const resetDeckCards = async (deckId: number) => {
  return fetchData<{ message: string; affectedRows: number }>(`${BASE_URL}/decks/${deckId}/reset-cards`, 'POST');
};

// Get count of unseen cards in a deck
export const getUnseenCardCount = async (deckId: number) => {
  return fetchData<{ unseenCount: number; totalCount: number; seenCount: number }>(`${BASE_URL}/decks/${deckId}/unseen-count`);
};

// Flashcard Management
export const getAllFlashcards = async () => {
  return fetchData<Flashcard[]>(`${BASE_URL}/flashcards`);
};

export const getFlashcardById = async (id: number) => {
  return fetchData<Flashcard>(`${BASE_URL}/flashcards/${id}`);
};

export const createFlashcard = async (
  question: string,
  answer: string,
  deckId: number
) => {
  return fetchData<Flashcard>(`${BASE_URL}/flashcards`, 'POST', {
    question,
    answer,
    deckId,
  });
};

export const updateFlashcard = async (
  id: number,
  updates: Partial<Flashcard>
) => {
  return fetchData<Flashcard>(`${BASE_URL}/flashcards/${id}`, 'PUT', updates);
};

export const deleteFlashcard = async (id: number) => {
  return fetchData<{ message: string }>(
    `${BASE_URL}/flashcards/${id}`,
    'DELETE'
  );
};

export const resetFlashcardsSeen = async () => {
  return fetchData<{ message: string; affectedRows: number }>(
    `${BASE_URL}/flashcards/reset-seen`,
    'POST'
  );
};

// FlashCardAnswer Management
export const validateFlashcardAnswer = async (
  flashcardId: number,
  userAnswer: string,
  time: string
) => {
  return fetchData<FlashCardValidationResponse>(`${BASE_URL}/flashcardanswers/validate`, 'POST', {
    flashcardId,
    userAnswer,
    time,
  });
};

export const getFlashcardSession = async (sessionId: string) => {
  return fetchData<FlashCardSession>(`${BASE_URL}/flashcardanswers/session/${sessionId}`);
};

export const recordFlashcardAnswer = async (
  flashcardId: number,
  userAnswer: string,
  time: string
) => {
  return fetchData<FlashCardAnswer>(`${BASE_URL}/flashcardanswers`, 'POST', {
    flashcardId,
    userAnswer,
    time,
  });
};

export const skipFlashcard = async (
  flashcardId: number,
  time: string
) => {
  return fetchData<{ message: string; flashcardId: number; time: string; timestamp: string }>(`${BASE_URL}/flashcardanswers/skip`, 'POST', {
    flashcardId,
    time,
  });
};

// Document Processing
export const processDocument = async (file?: File) => {
  // This endpoint is a placeholder. In a real scenario, it would likely accept a file upload.
  // For now, we'll send a simple JSON body or an empty body.
  // If a file was to be sent, it would typically be via FormData.
  if (file) {
    const formData = new FormData();
    formData.append('document', file);
    // Note: When sending FormData, do NOT set 'Content-Type': 'application/json'
    try {
      const response = await fetch(`${BASE_URL}/processDocument`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json();
        return { error: errorData.message || 'Failed to process document' };
      }
      const data = await response.json();
      return { data };
    } catch (error: any) {
      return { error: error.message || 'Network error during file upload' };
    }
  } else {
    return fetchData<{ result: string; message: string }>(
      `${BASE_URL}/processDocument`,
      'POST',
      {}
    );
  }
};

// Feedback & Recommendations
export const getFeedbackRecommendations = async () => {
  return fetchData<{ feedback: string }>(`${BASE_URL}/feedback`);
};
