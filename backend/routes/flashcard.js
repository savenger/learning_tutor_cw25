const router = require('express').Router();
const { Flashcard, Deck } = require('../models');
const { Op } = require('sequelize');
const axios = require('axios');

// GET all flashcards
router.get('/', async (req, res) => {
  try {
    const flashcards = await Flashcard.findAll({
      include: [{ model: Deck, as: 'Deck' }],
    });
    res.status(200).json(flashcards);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

// GET a single flashcard by id
router.get('/:id', async (req, res) => {
  try {
    const flashcardData = await Flashcard.findByPk(req.params.id, {
      include: [{ model: Deck, as: 'Deck' }],
    });

    if (!flashcardData) {
      res.status(404).json({ message: 'No flashcard found with this id!' });
      return;
    }

    res.status(200).json(flashcardData);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

// POST create a new flashcard
router.post('/', async (req, res) => {
  try {
    const newFlashcard = await Flashcard.create(req.body);
    res.status(201).json(newFlashcard);
  } catch (err) {
    console.error(err);
    res.status(400).json(err);
  }
});

// PUT update a flashcard by id
router.put('/:id', async (req, res) => {
  try {
    const [affectedRows] = await Flashcard.update(req.body, {
      where: {
        id: req.params.id,
      },
    });

    if (affectedRows === 0) {
      res.status(404).json({ message: 'No flashcard found with this id to update!' });
      return;
    }

    const updatedFlashcard = await Flashcard.findByPk(req.params.id);
    res.status(200).json(updatedFlashcard);
  } catch (err) {
    console.error(err);
    res.status(400).json(err);
  }
});

// DELETE a flashcard by id
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Flashcard.destroy({
      where: {
        id: req.params.id,
      },
    });

    if (!deleted) {
      res.status(404).json({ message: 'No flashcard found with this id to delete!' });
      return;
    }

    res.status(200).json({ message: 'Flashcard deleted successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

// POST store weakness
router.post('/:id/weakness', async (req, res) => {
  try {
    const cardId = req.params.id;
    var { messages } = req.body;

    const flashcardData = await Flashcard.findByPk(req.params.id, {
      include: [{ model: Deck, as: 'Deck' }],
    });

    const initial_question = {
      "role": "assistant",
      "content": flashcardData.question 
    }
    messages = [initial_question, ...messages];

    const data = {'id': cardId, 'messages': messages, 'solution': flashcardData.answer};

    // store current result
    const webhookUrl = 'http://n8n:5678/webhook/weakness';
    
    console.log('Forwarding chat to webhook...');
    console.log(data);
    const response = await axios.post(webhookUrl, data, {
      timeout: 30000 // 30 second timeout
    });

    console.log('Webhook response:', response.status, response.data);
    res.status(200);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

// POST reset all flashcards' seen status to false
router.post('/reset-seen', async (req, res) => {
  try {
    const [affectedRows] = await Flashcard.update(
      { seen: false },
      { where: {} } // Update all flashcards
    );

    res.status(200).json({ 
      message: 'All flashcards reset successfully!',
      affectedRows 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

module.exports = router;
