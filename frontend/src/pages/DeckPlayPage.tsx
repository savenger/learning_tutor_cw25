import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import Container from '../components/Container';
import FlashcardDisplay from '../components/FlashcardDisplay';
import FlashcardChat from '../components/FlashcardChat';
import Button from '../components/Button';
import { Deck, Flashcard, ChatMessage } from '../types';
import { getDeckById, validateFlashcardAnswer, skipFlashcard } from '../api/api';
import { FaArrowRight, FaRedo, FaTimesCircle, FaForward, FaCheck } from 'react-icons/fa';

const DeckPlayPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const deckId = Number(id);

  const [deck, setDeck] = useState<Deck | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

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

  const resetCardState = () => {
    setChatMessages([]);
    setIsValidating(false);
    setIsCompleted(false);
    setCurrentSessionId(null);
  };

  const handleNextCard = () => {
    if (deck && deck.Flashcards) {
      const nextIndex = (currentCardIndex + 1) % deck.Flashcards.length;
      
      // If we're at the last card and trying to go to next, show completion
      if (currentCardIndex === deck.Flashcards.length - 1) {
        //alert('Deck completed! You can now return to the deck list.');
        //window.history.back();
      } else {
        setCurrentCardIndex(nextIndex);
        resetCardState();
      }
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!deck || !deck.Flashcards || deck.Flashcards.length === 0) return;

    const currentFlashcard = deck.Flashcards[currentCardIndex];
    setIsValidating(true);
    setError(null);
    
    const currentTime = new Date().toISOString();
    
    const { data, error } = await validateFlashcardAnswer(
      currentFlashcard.id,
      message,
      currentTime,
      currentSessionId || undefined
    );

    if (data) {
      setChatMessages(data.messages);
      setCurrentSessionId(data.sessionId);
      setIsCompleted(data.isSessionCompleted);
    } else if (error) {
      setError(error);
    }
    
    setIsValidating(false);
  };

  const handleTryAgain = () => {
    resetCardState();
  };

  const handleSkipCard = async () => {
    if (!deck || !deck.Flashcards || deck.Flashcards.length === 0) return;

    const currentFlashcard = deck.Flashcards[currentCardIndex];
    setError(null);
    
    const currentTime = new Date().toISOString();
    
    const { error } = await skipFlashcard(currentFlashcard.id, currentTime);

    if (error) {
      setError(error);
    }
    
    // If this is the last card, show completion message
    if (currentCardIndex === deck.Flashcards.length - 1) {
      //alert('Deck completed! You can now return to the deck list.');
      //window.history.back();
    } else {
      // Move to next card if not the last card
      handleNextCard();
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

      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Flashcard Display */}
          <div className="bg-white rounded-lg shadow-xl p-8">
            <FlashcardDisplay flashcard={currentFlashcard} />
            
            <div className="flex justify-center space-x-4 mt-8">
              <Button
                variant="secondary"
                onClick={handleSkipCard}
                className="flex items-center"
              >
                {currentCardIndex === totalCards - 1 ? (
                  <>
                    <FaCheck className="mr-2" /> Finish
                  </>
                ) : (
                  <>
                    <FaForward className="mr-2" /> Skip
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Chat Interface */}
          <div className="bg-white rounded-lg shadow-xl p-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Answer & Get Feedback
            </h3>
            
            <FlashcardChat
              messages={chatMessages}
              onSendMessage={handleSendMessage}
              isLoading={isValidating}
              isCompleted={isCompleted}
            />
            
            {isCompleted && (
              <div className="flex justify-center space-x-4 mt-6">
                <Button
                  onClick={handleTryAgain}
                  variant="secondary"
                  className="flex items-center"
                >
                  <FaRedo className="mr-2" /> Try Again
                </Button>
                <Button
                  onClick={handleNextCard}
                  variant="primary"
                  className="flex items-center"
                >
                  Next Card <FaArrowRight className="ml-2" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-6 text-center">
            <p className="text-red-600 flex items-center justify-center">
              <FaTimesCircle className="mr-2" /> Error: {error}
            </p>
          </div>
        )}
      </div>
    </Container>
  );
};

export default DeckPlayPage;
