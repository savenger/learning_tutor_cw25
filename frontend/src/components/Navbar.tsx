import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaBook, FaFileUpload } from 'react-icons/fa';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-gradient-to-r from-blue-600 to-purple-700 p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-white text-3xl font-bold tracking-wide">
          Learnify
        </Link>
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
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
