const router = require('express').Router();
const { Deck, Flashcard } = require('../models');
const { Op } = require('sequelize'); // Import Op for operators if needed

// GET all decks
router.get('/', async (req, res) => {
  try {
    const decks = await Deck.findAll();
    res.status(200).json(decks);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

// GET a single deck by id, including its flashcards
router.get('/:id', async (req, res) => {
  try {
    const deckData = await Deck.findByPk(req.params.id, {
      include: [{ model: Flashcard, as: 'Flashcards' }],
    });

    if (!deckData) {
      res.status(404).json({ message: 'No deck found with this id!' });
      return;
    }

    res.status(200).json(deckData);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

// POST create a new deck
router.post('/', async (req, res) => {
  try {
    const newDeck = await Deck.create(req.body);
    res.status(201).json(newDeck);
  } catch (err) {
    console.error(err);
    res.status(400).json(err);
  }
});

// PUT update a deck by id
router.put('/:id', async (req, res) => {
  try {
    const [affectedRows] = await Deck.update(req.body, {
      where: {
        id: req.params.id,
      },
    });

    if (affectedRows === 0) {
      res.status(404).json({ message: 'No deck found with this id to update!' });
      return;
    }

    const updatedDeck = await Deck.findByPk(req.params.id);
    res.status(200).json(updatedDeck);
  } catch (err) {
    console.error(err);
    res.status(400).json(err);
  }
});

// DELETE a deck by id
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Deck.destroy({
      where: {
        id: req.params.id,
      },
    });

    if (!deleted) {
      res.status(404).json({ message: 'No deck found with this id to delete!' });
      return;
    }

    res.status(200).json({ message: 'Deck deleted successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

module.exports = router;
