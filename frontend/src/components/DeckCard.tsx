import React from 'react';
import { Deck } from '../types';
import Button from './Button';
import { Link } from 'react-router-dom';
import { FaPlay, FaEdit, FaTrash } from 'react-icons/fa';

interface DeckCardProps {
  deck: Deck;
  onDelete: (id: number) => void;
  onEdit: (deck: Deck) => void;
}

const DeckCard: React.FC<DeckCardProps> = ({ deck, onDelete, onEdit }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col justify-between border border-gray-200 hover:shadow-xl transition-shadow duration-300">
      <div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">{deck.name}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {deck.description || 'No description provided.'}
        </p>
      </div>
      <div className="flex flex-col space-y-2 mt-4">
        <Link to={`/decks/${deck.id}/play`}>
          <Button variant="primary" className="w-full flex items-center justify-center">
            <FaPlay className="mr-2" /> Play Deck
          </Button>
        </Link>
        <Button
          variant="secondary"
          onClick={() => onEdit(deck)}
          className="w-full flex items-center justify-center"
        >
          <FaEdit className="mr-2" /> Edit Deck
        </Button>
        <Button
          variant="danger"
          onClick={() => onDelete(deck.id)}
          className="w-full flex items-center justify-center"
        >
          <FaTrash className="mr-2" /> Delete Deck
        </Button>
      </div>
    </div>
  );
};

export default DeckCard;
