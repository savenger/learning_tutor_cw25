import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import DeckListPage from './pages/DeckListPage';
import DeckPlayPage from './pages/DeckPlayPage';
import DocumentImporterPage from './pages/DocumentImporterPage';
import TextHighlightingPage from './pages/TextHighlightingPage';
import FeedbackRecommendationPage from './pages/FeedbackRecommendationPage';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/decks" element={<DeckListPage />} />
          <Route path="/decks/:id/play" element={<DeckPlayPage />} />
          <Route path="/import" element={<DocumentImporterPage />} />
          <Route path="/text-import" element={<TextHighlightingPage />} />
          <Route path="/feedback" element={<FeedbackRecommendationPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
