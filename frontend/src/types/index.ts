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
  flashcardId: number; // Foreign key to Flashcard
  feedback?: string; // AI-generated feedback
  createdAt: string; // ISO 8601 datetime string
  updatedAt: string; // ISO 8601 datetime string
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isCorrect?: boolean; // Only for assistant messages
}

export interface FlashCardSession {
  id: number;
  flashcardId: number;
  sessionId: string;
  messages: ChatMessage[];
  isCompleted: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FlashCardValidationResponse extends FlashCardAnswer {
  sessionId: string;
  isCorrect: boolean;
  correctAnswer?: string; // Only shown when answer is correct
  messages: ChatMessage[];
  isSessionCompleted: boolean;
}
