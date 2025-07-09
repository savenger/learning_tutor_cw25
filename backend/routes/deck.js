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

// GET next unseen card from a deck
router.get('/:id/next-card', async (req, res) => {
  try {
    const deckId = req.params.id;
    
    // Check if deck exists
    const deck = await Deck.findByPk(deckId);
    if (!deck) {
      res.status(404).json({ message: 'No deck found with this id!' });
      return;
    }

    // Find the first unseen card in this deck
    const unseenCard = await Flashcard.findOne({
      where: {
        deckId: deckId,
        seen: false
      },
      order: [['id', 'ASC']] // Get cards in order
    });

    if (!unseenCard) {
      res.status(404).json({ message: 'No unseen cards remaining in this deck!' });
      return;
    }

    // Return the card with deck information
    const cardWithDeck = await Flashcard.findByPk(unseenCard.id, {
      include: [{ model: Deck, as: 'Deck' }],
    });

    res.status(200).json(cardWithDeck);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

// GET count of unseen cards in a deck
router.get('/:id/unseen-count', async (req, res) => {
  try {
    const deckId = req.params.id;
    
    // Check if deck exists
    const deck = await Deck.findByPk(deckId);
    if (!deck) {
      res.status(404).json({ message: 'No deck found with this id!' });
      return;
    }

    // Count unseen cards
    const unseenCount = await Flashcard.count({
      where: {
        deckId: deckId,
        seen: false
      }
    });

    // Count total cards
    const totalCount = await Flashcard.count({
      where: {
        deckId: deckId
      }
    });

    res.status(200).json({
      unseenCount,
      totalCount,
      seenCount: totalCount - unseenCount
    });
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

// POST reset all cards in a deck to unseen
router.post('/:id/reset-cards', async (req, res) => {
  try {
    const deckId = req.params.id;
    
    // Check if deck exists
    const deck = await Deck.findByPk(deckId);
    if (!deck) {
      res.status(404).json({ message: 'No deck found with this id!' });
      return;
    }

    // Reset all cards in this deck to unseen
    const [affectedRows] = await Flashcard.update(
      { seen: false },
      { where: { deckId: deckId } }
    );

    res.status(200).json({ 
      message: 'All cards in deck reset successfully!',
      affectedRows 
    });
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
