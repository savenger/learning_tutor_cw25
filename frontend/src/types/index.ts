export interface Deck {
  id: number;
  name: string;
  description: string;
  createdAt: string; // ISO 8601 datetime string
  updatedAt: string; // ISO 8601 datetime string
  Flashcards?: Flashcard[]; // Optional, only included when fetching a single deck by ID
}

export interface Flashcard {
  id: number;
  question: string;
  answer: string;
  deckId: number; // Foreign key to Deck
  createdAt: string; // ISO 8601 datetime string
  updatedAt: string; // ISO 8601 datetime string
}

export interface FlashCardAnswer {
  id: number;
  time: string; // ISO 8601 datetime string
  userAnswer: string;
  createdAt: string; // ISO 8601 datetime string
  updatedAt: string; // ISO 8601 datetime string
}
