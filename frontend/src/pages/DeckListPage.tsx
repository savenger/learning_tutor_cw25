import React, { useEffect, useState } from 'react';
import Container from '../components/Container';
import DeckCard from '../components/DeckCard';
import Button from '../components/Button';
import Input from '../components/Input';
import Textarea from '../components/Textarea';
import { Deck } from '../types';
import { getAllDecks, createDeck, updateDeck, deleteDeck } from '../api/api';
import { FaPlusCircle } from 'react-icons/fa';

const DeckListPage: React.FC = () => {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [newDeckName, setNewDeckName] = useState<string>('');
  const [newDeckDescription, setNewDeckDescription] = useState<string>('');
  const [editingDeck, setEditingDeck] = useState<Deck | null>(null);

  const fetchDecks = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await getAllDecks();
    if (data) {
      setDecks(data);
    } else if (error) {
      setError(error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDecks();
  }, []);

  const handleCreateOrUpdateDeck = async () => {
    if (!newDeckName.trim()) {
      alert('Deck name cannot be empty.');
      return;
    }

    if (editingDeck) {
      // Update existing deck
      const { data, error } = await updateDeck(editingDeck.id, {
        name: newDeckName,
        description: newDeckDescription,
      });
      if (data) {
        setDecks(
          decks.map((deck) => (deck.id === data.id ? { ...deck, ...data } : deck))
        );
        setShowModal(false);
        setEditingDeck(null);
        setNewDeckName('');
        setNewDeckDescription('');
      } else if (error) {
        setError(error);
      }
    } else {
      // Create new deck
      const { data, error } = await createDeck(newDeckName, newDeckDescription);
      if (data) {
        setDecks([...decks, data]);
        setShowModal(false);
        setNewDeckName('');
        setNewDeckDescription('');
      } else if (error) {
        setError(error);
      }
    }
  };

  const handleDeleteDeck = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this deck?')) {
      const { message, error } = await deleteDeck(id);
      if (message) {
        setDecks(decks.filter((deck) => deck.id !== id));
      } else if (error) {
        setError(error);
      }
    }
  };

  const handleEditDeck = (deck: Deck) => {
    setEditingDeck(deck);
    setNewDeckName(deck.name);
    setNewDeckDescription(deck.description);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingDeck(null);
    setNewDeckName('');
    setNewDeckDescription('');
    setError(null);
  };

  if (loading) {
    return (
      <Container className="text-center">
        <p className="text-gray-600 text-lg">Loading decks...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="text-center">
        <p className="text-red-600 text-lg">Error: {error}</p>
        <Button onClick={fetchDecks} className="mt-4">
          Retry
        </Button>
      </Container>
    );
  }

  return (
    <Container>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">My Flashcard Decks</h1>
        <Button onClick={() => setShowModal(true)} className="flex items-center">
          <FaPlusCircle className="mr-2" /> Create New Deck
        </Button>
      </div>

      {decks.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <p className="text-gray-600 text-lg mb-4">No decks found. Start by creating a new one!</p>
          <Button onClick={() => setShowModal(true)}>Create First Deck</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {decks.map((deck) => (
            <DeckCard
              key={deck.id}
              deck={deck}
              onDelete={handleDeleteDeck}
              onEdit={handleEditDeck}
            />
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {editingDeck ? 'Edit Deck' : 'Create New Deck'}
            </h2>
            <Input
              id="deck-name"
              label="Deck Name"
              placeholder="e.g., Biology Basics"
              value={newDeckName}
              onChange={(e) => setNewDeckName(e.target.value)}
            />
            <Textarea
              id="deck-description"
              label="Description (Optional)"
              placeholder="A brief description of this deck..."
              value={newDeckDescription}
              onChange={(e) => setNewDeckDescription(e.target.value)}
            />
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <div className="flex justify-end space-x-4 mt-6">
              <Button variant="secondary" onClick={closeModal}>
                Cancel
              </Button>
              <Button onClick={handleCreateOrUpdateDeck}>
                {editingDeck ? 'Save Changes' : 'Create Deck'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
};

export default DeckListPage;
