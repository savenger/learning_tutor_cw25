import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import Container from '../components/Container';
import FlashcardDisplay from '../components/FlashcardDisplay';
import Button from '../components/Button';
import Textarea from '../components/Textarea';
import { Deck, Flashcard } from '../types';
import { getDeckById, recordFlashcardAnswer } from '../api/api';
import { FaArrowLeft, FaArrowRight, FaEye, FaCheck, FaRedo, FaTimesCircle, FaCheckCircle } from 'react-icons/fa';

const DeckPlayPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const deckId = Number(id);

  const [deck, setDeck] = useState<Deck | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
  const [showAnswer, setShowAnswer] = useState<boolean>(false);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [answerStatus, setAnswerStatus] = useState<
    'idle' | 'submitting' | 'submitted' | 'error'
  >('idle');

  const fetchDeck = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await getDeckById(deckId);
    if (data) {
      setDeck(data);
    } else if (error) {
      setError(error);
    }
    setLoading(false);
  }, [deckId]);

  useEffect(() => {
    fetchDeck();
  }, [fetchDeck]);

  const handleNextCard = () => {
    if (deck && deck.Flashcards) {
      setCurrentCardIndex((prevIndex) => (prevIndex + 1) % deck.Flashcards!.length);
      setShowAnswer(false);
      setUserAnswer('');
      setAnswerStatus('idle');
    }
  };

  const handlePrevCard = () => {
    if (deck && deck.Flashcards) {
      setCurrentCardIndex((prevIndex) =>
        prevIndex === 0 ? deck.Flashcards!.length - 1 : prevIndex - 1
      );
      setShowAnswer(false);
      setUserAnswer('');
      setAnswerStatus('idle');
    }
  };

  const handleSubmitAnswer = async () => {
    if (!deck || !deck.Flashcards || deck.Flashcards.length === 0) return;

    setAnswerStatus('submitting');
    const currentTime = new Date().toISOString();
    const { data, error } = await recordFlashcardAnswer(currentTime, userAnswer);

    if (data) {
      setAnswerStatus('submitted');
      // Optionally, you could store the answer locally or update UI based on correctness
    } else if (error) {
      setAnswerStatus('error');
      setError(error);
    }
  };

  if (loading) {
    return (
      <Container className="text-center">
        <p className="text-gray-600 text-lg">Loading deck...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="text-center">
        <p className="text-red-600 text-lg">Error: {error}</p>
        <Button onClick={fetchDeck} className="mt-4">
          Retry
        </Button>
      </Container>
    );
  }

  if (!deck || !deck.Flashcards || deck.Flashcards.length === 0) {
    return (
      <Container className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Deck Not Found or Empty</h1>
        <p className="text-gray-600 text-lg">
          This deck might not exist or does not contain any flashcards yet.
        </p>
        <Button onClick={() => window.history.back()} className="mt-6">
          Go Back to Decks
        </Button>
      </Container>
    );
  }

  const currentFlashcard: Flashcard = deck.Flashcards[currentCardIndex];
  const totalCards = deck.Flashcards.length;

  return (
    <Container>
      <h1 className="text-4xl font-bold text-gray-800 mb-6 text-center">
        Playing: {deck.name}
      </h1>
      <p className="text-gray-600 text-center mb-8">
        Card {currentCardIndex + 1} of {totalCards}
      </p>

      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-xl p-8">
        <FlashcardDisplay flashcard={currentFlashcard} showAnswer={showAnswer} />

        <div className="flex justify-center space-x-4 mt-8">
          <Button
            variant="secondary"
            onClick={handlePrevCard}
            disabled={totalCards <= 1}
            className="flex items-center"
          >
            <FaArrowLeft className="mr-2" /> Previous
          </Button>
          <Button
            variant="primary"
            onClick={() => setShowAnswer(!showAnswer)}
            className="flex items-center"
          >
            <FaEye className="mr-2" /> {showAnswer ? 'Hide Answer' : 'Show Answer'}
          </Button>
          <Button
            variant="secondary"
            onClick={handleNextCard}
            disabled={totalCards <= 1}
            className="flex items-center"
          >
            Next <FaArrowRight className="ml-2" />
          </Button>
        </div>

        <div className="mt-10">
          <Textarea
            id="user-answer"
            label="Your Answer"
            placeholder="Type your answer here..."
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            disabled={answerStatus === 'submitting'}
          />
          <Button
            onClick={handleSubmitAnswer}
            disabled={!userAnswer.trim() || answerStatus === 'submitting'}
            className="w-full flex items-center justify-center mt-4"
          >
            {answerStatus === 'submitting' ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Submitting...
              </>
            ) : (
              <>
                <FaCheck className="mr-2" /> Submit Answer
              </>
            )}
          </Button>
          {answerStatus === 'submitted' && (
            <p className="text-green-600 text-center mt-4 flex items-center justify-center">
              <FaCheckCircle className="mr-2" /> Answer recorded!
            </p>
          )}
          {answerStatus === 'error' && (
            <p className="text-red-600 text-center mt-4 flex items-center justify-center">
              <FaTimesCircle className="mr-2" /> Error recording answer: {error}
            </p>
          )}
        </div>
      </div>
    </Container>
  );
};

export default DeckPlayPage;
