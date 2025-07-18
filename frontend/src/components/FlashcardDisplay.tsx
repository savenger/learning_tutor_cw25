import React from 'react';
import { Flashcard } from '../types';

interface FlashcardDisplayProps {
  flashcard: Flashcard;
}

const FlashcardDisplay: React.FC<FlashcardDisplayProps> = ({
  flashcard,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-xl p-8 min-h-[250px] flex flex-col justify-center items-center text-center border-b-4 border-blue-500">
      <div className="text-gray-700 text-sm font-semibold mb-2">
        Question
      </div>
      <p className="text-3xl font-bold text-gray-900 leading-relaxed">
        {flashcard.question}
      </p>
    </div>
  );
};

export default FlashcardDisplay;
