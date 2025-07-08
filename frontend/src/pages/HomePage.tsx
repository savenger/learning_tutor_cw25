import React from 'react';
import { Link } from 'react-router-dom';
import Container from '../components/Container';
import Button from '../components/Button';
import { FaBook, FaFileUpload } from 'react-icons/fa';

const HomePage: React.FC = () => {
  return (
    <Container className="text-center py-20">
      <h1 className="text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
        Welcome to <span className="text-blue-600">Learnify</span>!
      </h1>
      <p className="text-xl text-gray-700 mb-10 max-w-2xl mx-auto">
        Your ultimate flashcard companion for effective learning. Create, manage, and master your knowledge with ease.
      </p>
      <div className="flex justify-center space-x-6">
        <Link to="/decks">
          <Button size="lg" variant="primary" className="flex items-center">
            <FaBook className="mr-3 text-2xl" /> Browse Decks
          </Button>
        </Link>
        <Link to="/import">
          <Button size="lg" variant="secondary" className="flex items-center">
            <FaFileUpload className="mr-3 text-2xl" /> Import Document
          </Button>
        </Link>
      </div>
      <div className="mt-16 text-gray-600">
        <p className="text-lg font-semibold mb-4">How it works:</p>
        <ul className="list-disc list-inside text-left inline-block text-md">
          <li className="mb-2">Create new flashcard decks for any topic.</li>
          <li className="mb-2">Add questions and answers to your flashcards.</li>
          <li className="mb-2">Play decks to test your knowledge and track your progress.</li>
          <li>(Coming soon) Import documents to automatically generate flashcards!</li>
        </ul>
      </div>
    </Container>
  );
};

export default HomePage;
