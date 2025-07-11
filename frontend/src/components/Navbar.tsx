import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaBook, FaFileUpload, FaLightbulb, FaRedo, FaProjectDiagram } from 'react-icons/fa';
import { resetFlashcardsSeen } from '../api/api';

const Navbar: React.FC = () => {
  const handleResetCards = async () => {
    try {
      const result = await resetFlashcardsSeen();
      if (result.error) {
        alert('Error resetting cards: ' + result.error);
      } else {
        alert(`Successfully reset ${result.data?.affectedRows || 0} flashcards!`);
      }
    } catch (error) {
      alert('Error resetting cards: ' + error);
    }
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-purple-700 p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-white text-3xl font-bold tracking-wide">
          Learnify
        </Link>
        <div className="flex items-center space-x-6">
          <ul className="flex space-x-6">
            <li>
              <Link
                to="/"
                className="text-white hover:text-blue-200 transition duration-300 flex items-center text-lg"
              >
                <FaHome className="mr-2" /> Home
              </Link>
            </li>
            <li>
              <Link
                to="/decks"
                className="text-white hover:text-blue-200 transition duration-300 flex items-center text-lg"
              >
                <FaBook className="mr-2" /> My Decks
              </Link>
            </li>
            <li>
              <Link
                to="/import"
                className="text-white hover:text-blue-200 transition duration-300 flex items-center text-lg"
              >
                <FaFileUpload className="mr-2" /> Import Document
              </Link>
            </li>
            <li>
              <Link
                to="/text-import"
                className="text-white hover:text-blue-200 transition duration-300 flex items-center text-lg"
              >
                <FaFileUpload className="mr-2" /> Import From Text
              </Link>
            </li>
            <li>
              <Link
                to="/feedback"
                className="text-white hover:text-blue-200 transition duration-300 flex items-center text-lg"
              >
                <FaLightbulb className="mr-2" /> Feedback
              </Link>
            </li>
            <li>
              <Link
                to="/graph"
                className="text-white hover:text-blue-200 transition duration-300 flex items-center text-lg"
              >
                <FaProjectDiagram className="mr-2" /> Graph
              </Link>
            </li>
          </ul>
          <button
            onClick={handleResetCards}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition duration-300 flex items-center text-sm font-medium"
          >
            <FaRedo className="mr-2" /> Reset Cards
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
