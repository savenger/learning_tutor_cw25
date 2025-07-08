const router = require('express').Router();
const { FlashCardAnswer } = require('../models');

// POST create a new flashcard answer
router.post('/', async (req, res) => {
  try {
    const newFlashCardAnswer = await FlashCardAnswer.create(req.body);
    res.status(201).json(newFlashCardAnswer);
  } catch (err) {
    console.error(err);
    res.status(400).json(err);
  }
});

// Optionally, add GET routes for FlashCardAnswer if needed for analytics/history
// router.get('/', async (req, res) => { ... });
// router.get('/:id', async (req, res) => { ... });

module.exports = router;
