import React, { useCallback, useEffect, useState } from 'react';
import { FaArrowRight, FaForward, FaRedo, FaSyncAlt, FaTimesCircle } from 'react-icons/fa';
import { useParams } from 'react-router-dom';
import { getDeckById, getNextUnseenCard, getUnseenCardCount, resetDeckCards, skipFlashcard, validateFlashcardAnswer } from '../api/api';
import Button from '../components/Button';
import Container from '../components/Container';
import FlashcardChat from '../components/FlashcardChat';
import FlashcardDisplay from '../components/FlashcardDisplay';
import { ChatMessage, Deck, Flashcard } from '../types';

const DeckPlayPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const deckId = Number(id);

  const [deck, setDeck] = useState<Deck | null>(null);
  const [currentCard, setCurrentCard] = useState<Flashcard | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingNextCard, setLoadingNextCard] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [noMoreCards, setNoMoreCards] = useState<boolean>(false);
  const [cardProgress, setCardProgress] = useState<{ unseenCount: number; totalCount: number; seenCount: number } | null>(null);

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

  const fetchCardProgress = useCallback(async () => {
    const { data, error } = await getUnseenCardCount(deckId);
    if (data) {
      setCardProgress(data);
    } else if (error) {
      console.error('Failed to fetch card progress:', error);
    }
  }, [deckId]);

  const fetchNextCard = useCallback(async () => {
    setLoadingNextCard(true);
    setError(null);
    const { data, error } = await getNextUnseenCard(deckId);
    if (data) {
      setCurrentCard(data);
      setNoMoreCards(false);
      // Update progress after getting a card
      await fetchCardProgress();
    } else if (error) {
      if (error.includes('No unseen cards remaining')) {
        setNoMoreCards(true);
        setCurrentCard(null);
        // Update progress when no more cards
        await fetchCardProgress();
      } else {
        setError(error);
      }
    }
    setLoadingNextCard(false);
  }, [deckId, fetchCardProgress]);

  useEffect(() => {
    fetchDeck();
  }, [fetchDeck]);

  useEffect(() => {
    if (deck) {
      fetchCardProgress();
      fetchNextCard();
    }
  }, [deck, fetchNextCard, fetchCardProgress]);

  const resetCardState = () => {
    setChatMessages([]);
    setIsValidating(false);
    setIsCompleted(false);
    setCurrentSessionId(null);
  };

  const handleNextCard = async () => {
    resetCardState();
    await fetchNextCard();
  };

  const handleSendMessage = async (message: string) => {
    if (!currentCard) return;

    setIsValidating(true);
    setError(null);
    
    const currentTime = new Date().toISOString();
    
    const { data, error } = await validateFlashcardAnswer(
      currentCard.id,
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
    if (!currentCard) return;

    setError(null);
    
    const currentTime = new Date().toISOString();
    
    const { error } = await skipFlashcard(currentCard.id, currentTime);

    if (error) {
      setError(error);
    }
    
    // Move to next card
    await handleNextCard();
  };

  const handleResetDeck = async () => {
    setError(null);
    setLoadingNextCard(true);
    
    const { error } = await resetDeckCards(deckId);
    
    if (error) {
      setError(error);
      setLoadingNextCard(false);
    } else {
      // Reset state and fetch first card
      setNoMoreCards(false);
      resetCardState();
      await fetchNextCard();
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

  if (!deck) {
    return (
      <Container className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Deck Not Found</h1>
        <p className="text-gray-600 text-lg">
          This deck might not exist.
        </p>
        <Button onClick={() => window.history.back()} className="mt-6">
          Go Back to Decks
        </Button>
      </Container>
    );
  }

  if (noMoreCards) {
    return (
      <Container className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Deck Completed!</h1>
        <p className="text-gray-600 text-lg mb-6">
          You've completed all cards in "{deck.name}". Great job!
        </p>
        {cardProgress && (
          <p className="text-gray-500 text-sm mb-6">
            You've seen {cardProgress.totalCount} out of {cardProgress.totalCount} cards
          </p>
        )}
        <div className="flex justify-center space-x-4">
          <Button onClick={handleResetDeck} className="flex items-center">
            <FaSyncAlt className="mr-2" /> Play Again
          </Button>
          <Button onClick={() => window.history.back()} variant="secondary">
            Go Back to Decks
          </Button>
        </div>
      </Container>
    );
  }

  if (loadingNextCard) {
    return (
      <Container className="text-center">
        <p className="text-gray-600 text-lg">Loading next card...</p>
      </Container>
    );
  }

  if (!currentCard) {
    return (
      <Container className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">No Card Available</h1>
        <p className="text-gray-600 text-lg">
          Unable to load the next card.
        </p>
        <Button onClick={fetchNextCard} className="mt-4">
          Try Again
        </Button>
      </Container>
    );
  }

  return (
    <Container>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-4xl font-bold text-gray-800">
            Playing: {deck.name}
          </h1>
          {cardProgress && (
            <p className="text-gray-600 mt-2">
              {cardProgress.unseenCount} cards remaining ({cardProgress.seenCount} of {cardProgress.totalCount} completed)
            </p>
          )}
        </div>
        <Button
          onClick={handleResetDeck}
          variant="secondary"
          className="flex items-center"
        >
          <FaSyncAlt className="mr-2" /> Reset Deck
        </Button>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Flashcard Display */}
          <div className="bg-white rounded-lg shadow-xl p-8">
            <FlashcardDisplay flashcard={currentCard} />
            
            <div className="flex justify-center space-x-4 mt-8">
              <Button
                variant="secondary"
                onClick={handleSkipCard}
                className="flex items-center"
                disabled={loadingNextCard}
              >
                <FaForward className="mr-2" /> Skip
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
                  disabled={loadingNextCard}
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
