const router = require('express').Router();
const { FlashCardAnswer, Flashcard, FlashCardSession } = require('../models');
const { v4: uuidv4 } = require('uuid');

// POST validate a flashcard answer with chat session support
router.post('/validate', async (req, res) => {
  try {
    const { flashcardId, userAnswer, time, sessionId } = req.body;
    
    // Validate required fields
    if (!flashcardId || !userAnswer || !time) {
      return res.status(400).json({ 
        error: 'Missing required fields: flashcardId, userAnswer, and time are required' 
      });
    }

    // Get the flashcard to compare answers
    const flashcard = await Flashcard.findByPk(flashcardId);
    if (!flashcard) {
      return res.status(404).json({ error: 'Flashcard not found' });
    }

    // Generate sessionId if not provided
    const currentSessionId = sessionId || uuidv4();

    // Find or create session
    let session = await FlashCardSession.findOne({
      where: { sessionId: currentSessionId, flashcardId }
    });

    if (!session) {
      session = await FlashCardSession.create({
        flashcardId,
        sessionId: currentSessionId,
        messages: [],
        isCompleted: false
      });
    }

    // Check if answer is correct
    const isCorrect = userAnswer.toLowerCase().trim() === flashcard.answer.toLowerCase().trim();
    
    // Generate feedback
    let feedback;
    if (isCorrect) {
      feedback = 'Correct! Well done!';
    } else {
      feedback = 'Not quite right. Try again! Think about the key concepts.';
    }

    // Add user message to session
    const userMessage = {
      role: 'user',
      content: userAnswer,
      timestamp: time
    };

    // Add assistant response to session
    const assistantMessage = {
      role: 'assistant',
      content: feedback,
      isCorrect,
      timestamp: new Date().toISOString()
    };

    // Update session messages
    const updatedMessages = [...session.messages, userMessage, assistantMessage];
    
    // If correct, mark session as completed
    if (isCorrect) {
      await session.update({
        messages: updatedMessages,
        isCompleted: true,
        completedAt: new Date()
      });
    } else {
      await session.update({
        messages: updatedMessages
      });
    }

    // Create the answer record for tracking
    const newFlashCardAnswer = await FlashCardAnswer.create({
      flashcardId,
      userAnswer,
      time,
      feedback
    });

    // Return the validation result with session info
    res.status(201).json({
      ...newFlashCardAnswer.toJSON(),
      sessionId: currentSessionId,
      isCorrect,
      correctAnswer: isCorrect ? flashcard.answer : null, // Only show correct answer when they get it right
      messages: updatedMessages,
      isSessionCompleted: isCorrect
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message || 'Failed to validate answer' });
  }
});

// GET session history for a flashcard
router.get('/session/:sessionId', async (req, res) => {
  try {
    const session = await FlashCardSession.findOne({
      where: { sessionId: req.params.sessionId },
      include: [{ model: Flashcard, as: 'Flashcard' }]
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.status(200).json(session);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Failed to fetch session' });
  }
});

// POST create a new flashcard answer (legacy endpoint, updated to require flashcardId)
router.post('/', async (req, res) => {
  try {
    const { flashcardId, userAnswer, time } = req.body;
    
    // Validate required fields
    if (!flashcardId || !userAnswer || !time) {
      return res.status(400).json({ 
        error: 'Missing required fields: flashcardId, userAnswer, and time are required' 
      });
    }

    const newFlashCardAnswer = await FlashCardAnswer.create(req.body);
    res.status(201).json(newFlashCardAnswer);
  } catch (err) {
    console.error(err);
    res.status(400).json(err);
  }
});

// GET all flashcard answers (optional, for analytics)
router.get('/', async (req, res) => {
  try {
    const answers = await FlashCardAnswer.findAll({
      include: [{ model: Flashcard, as: 'Flashcard' }],
    });
    res.status(200).json(answers);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
  });

// POST skip a flashcard
router.post('/skip', async (req, res) => {
  try {
    const { flashcardId, time } = req.body;
    
    // Validate required fields
    if (!flashcardId || !time) {
      return res.status(400).json({ 
        error: 'Missing required fields: flashcardId and time are required' 
      });
    }

    // Get the flashcard to ensure it exists
    const flashcard = await Flashcard.findByPk(flashcardId);
    if (!flashcard) {
      return res.status(404).json({ error: 'Flashcard not found' });
    }

    // For now, we'll just return a success response
    // In the future, this could track skipped cards for analytics
    res.status(200).json({
      message: 'Flashcard skipped successfully',
      flashcardId,
      time,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message || 'Failed to skip flashcard' });
  }
});

module.exports = router;
