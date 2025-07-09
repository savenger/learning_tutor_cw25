const router = require('express').Router();
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const deckRoutes = require('./deck');
const flashcardRoutes = require('./flashcard');
const flashcardAnswerRoutes = require('./flashcardanswer');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// API routes
router.use('/decks', deckRoutes);
router.use('/flashcards', flashcardRoutes);
router.use('/flashcardanswers', flashcardAnswerRoutes);

// Feedback & Recommendations route
router.get('/feedback', async (req, res) => {
  try {
    // Mock feedback data - in a real app, this would analyze user's learning patterns
    const mockFeedback = [
      "Great job on your recent study sessions! You've been consistently practicing your flashcards, which is key to long-term retention.",
      "I noticed you're spending more time on certain topics. Consider breaking down complex concepts into smaller, more manageable flashcards.",
      "Your accuracy has improved by 15% over the past week. Keep up the excellent work!",
      "You tend to study better in the evening hours. Try to maintain this schedule for optimal learning.",
      "Consider reviewing cards you got wrong more frequently. Spaced repetition of challenging material will help reinforce your memory.",
      "You're doing well with factual recall. Try adding more conceptual questions to deepen your understanding.",
      "Your study streak is impressive! Consistency is one of the most important factors in successful learning.",
      "I recommend taking short breaks between study sessions to help consolidate your memory.",
      "You might benefit from creating flashcards that connect different topics together to build stronger knowledge networks.",
      "Your performance suggests you're ready to tackle more advanced material in your strongest subjects."
    ];

    // Select a random feedback message
    const randomFeedback = mockFeedback[Math.floor(Math.random() * mockFeedback.length)];
    
    res.json({ 
      feedback: randomFeedback,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error generating feedback:', error);
    res.status(500).json({ 
      error: 'Failed to generate feedback recommendations' 
    });
  }
});

// Custom controller routes
router.post('/processDocument', upload.single('document'), async (req, res) => {
  try {
    console.log('Received request to process document.');
    
    if (!req.file) {
      return res.status(400).json({ 
        result: 'error', 
        message: 'No file uploaded' 
      });
    }

    console.log('File received:', req.file.originalname, 'Size:', req.file.size);

    // Create FormData to send to webhook
    const formData = new FormData();
    formData.append('file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });
    
    // Add additional metadata that n8n might find useful
    formData.append('originalName', req.file.originalname);
    formData.append('mimeType', req.file.mimetype);
    formData.append('size', req.file.size.toString());

    // Forward to webhook
    const webhookUrl = 'https://julmar.app.n8n.cloud/webhook-test/ffd828f4-3bb5-465c-9b5e-b76bd8facf19';
    
    console.log('Forwarding file to webhook...');
    const response = await axios.post(webhookUrl, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      timeout: 30000 // 30 second timeout
    });

    console.log('Webhook response:', response.status, response.data);

    res.json({ 
      result: 'success', 
      message: 'Document processed successfully',
      webhookResponse: response.data
    });

  } catch (error) {
    console.error('Error processing document:', error.message);
    
    if (error.response) {
      // Webhook returned an error response
      console.error('Webhook error:', error.response.status, error.response.data);
      res.status(error.response.status).json({
        result: 'error',
        message: 'Webhook processing failed',
        error: error.response.data
      });
    } else if (error.request) {
      // Network error reaching webhook
      console.error('Network error:', error.request);
      res.status(500).json({
        result: 'error',
        message: 'Failed to reach webhook service'
      });
    } else {
      // Other error
      res.status(500).json({
        result: 'error',
        message: 'Internal server error during document processing'
      });
    }
  }
});

module.exports = router;
