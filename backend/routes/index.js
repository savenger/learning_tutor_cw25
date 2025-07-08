const router = require('express').Router();
const deckRoutes = require('./deck');
const flashcardRoutes = require('./flashcard');
const flashcardAnswerRoutes = require('./flashcardanswer');

// API routes
router.use('/decks', deckRoutes);
router.use('/flashcards', flashcardRoutes);
router.use('/flashcardanswers', flashcardAnswerRoutes);

// Custom controller routes
router.post('/processDocument', (req, res) => {
  // Placeholder for document processing logic
  console.log('Received request to process document.');
  // In a real application, you would handle file uploads here,
  // parse the document, and create new decks/flashcards.
  // For now, just return a success message.
  res.json({ result: 'success', message: 'Document processing initiated. (Placeholder)' });
});

module.exports = router;
