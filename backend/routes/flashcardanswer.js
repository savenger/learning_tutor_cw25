const router = require('express').Router();
const { FlashCardAnswer, Flashcard } = require('../models');
const axios = require('axios');

// POST validate a flashcard answer
router.post('/validate', async (req, res) => {
  try {
    const { flashcardId, userAnswer, time } = req.body;
    
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

    // Get previous flashcard answers for this flashcard to build conversation history
    const previousAnswers = await FlashCardAnswer.findAll({
      where: { flashcardId },
      order: [['time', 'ASC']]
    });

    // Build conversation history from previous answers
    const conversationMessages = [];
    
    // Always start with the flashcard question
    conversationMessages.push({
      role: 'assistant',
      type: 'question',
      message: flashcard.question
    });

    conversationMessages.push({
      role: 'assistant',
      type: 'solution',
      message: flashcard.answer
    });

    // Add previous user answers and assistant feedback
    previousAnswers.forEach(answer => {
      conversationMessages.push({
        role: 'user',
        type: 'answer',
        message: answer.userAnswer
      });
      
      if (answer.feedback) {
        conversationMessages.push({
          role: 'assistant',
          type: 'hint',
          message: answer.feedback
        });
      }
    });

    // Add current user answer
    conversationMessages.push({
      role: 'user',
      type: 'answer',
      message: userAnswer
    });

    // Send to n8n evaluate endpoint
    const conversationHistory = {
      messages: conversationMessages
    };

    const feedbackResponse = await axios.post('http://n8n/webhook/evaluate', conversationHistory);
    
    // Extract evaluation result
    const evaluationResult = feedbackResponse.data;
    const isCorrect = evaluationResult.type === 'success';
    const feedback = evaluationResult.message;

    // Create the answer record for tracking
    const newFlashCardAnswer = await FlashCardAnswer.create({
      flashcardId,
      userAnswer,
      time,
      feedback
    });

    // Return the validation result
    res.status(201).json({
      ...newFlashCardAnswer.toJSON(),
      isCorrect,
      evaluationType: evaluationResult.type, // 'success' or 'hint'
      correctAnswer: isCorrect ? flashcard.answer : null // Only show correct answer when they get it right
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message || 'Failed to validate answer' });
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
