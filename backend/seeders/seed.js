const { Deck, Flashcard, sequelize } = require('../models');

const seedDatabase = async () => {
  try {
    // Clear existing data (optional, for development)
    // await Flashcard.destroy({ truncate: { cascade: true } });
    // await Deck.destroy({ truncate: { cascade: true } });

    console.log('Seeding database...');

    // Create Decks
    const deck1 = await Deck.create({
      name: 'Biology Basics',
      description: 'Fundamental concepts in biology, perfect for beginners.',
    });

    const deck2 = await Deck.create({
      name: 'History of Rome',
      description: 'Key events and figures in ancient Roman history.',
    });

    const deck3 = await Deck.create({
      name: 'JavaScript Fundamentals',
      description: 'Core concepts of JavaScript programming language.',
    });

    // Create Flashcards for Deck 1 (Biology Basics)
    await Flashcard.bulkCreate([
      {
        question: 'What is the powerhouse of the cell?',
        answer: 'Mitochondria',
        deckId: deck1.id,
      },
      {
        question: 'What is the process by which plants make their own food?',
        answer: 'Photosynthesis',
        deckId: deck1.id,
      },
      {
        question: 'What is the basic unit of heredity?',
        answer: 'Gene',
        deckId: deck1.id,
      },
      {
        question: 'What are the four main types of tissue in the human body?',
        answer: 'Epithelial, Connective, Muscle, and Nervous tissue',
        deckId: deck1.id,
      },
      {
        question: 'What is the largest organ in the human body?',
        answer: 'Skin',
        deckId: deck1.id,
      },
    ]);

    // Create Flashcards for Deck 2 (History of Rome)
    await Flashcard.bulkCreate([
      {
        question: 'Who was the first Roman Emperor?',
        answer: 'Augustus',
        deckId: deck2.id,
      },
      {
        question: 'What river runs through Rome?',
        answer: 'Tiber River',
        deckId: deck2.id,
      },
      {
        question: 'When was Rome founded (traditional date)?',
        answer: '753 BC',
        deckId: deck2.id,
      },
      {
        question: 'Who famously crossed the Rubicon?',
        answer: 'Julius Caesar',
        deckId: deck2.id,
      },
    ]);

    // Create Flashcards for Deck 3 (JavaScript Fundamentals)
    await Flashcard.bulkCreate([
      {
        question: 'What is a closure in JavaScript?',
        answer: 'A closure is the combination of a function bundled together (enclosed) with references to its surrounding state (the lexical environment).',
        deckId: deck3.id,
      },
      {
        question: 'What is the difference between `==` and `===`?',
        answer: '`==` performs type coercion, while `===` performs strict equality comparison without type coercion.',
        deckId: deck3.id,
      },
      {
        question: 'What is a promise in JavaScript?',
        answer: 'A Promise is an object representing the eventual completion or failure of an asynchronous operation.',
        deckId: deck3.id,
      },
    ]);

    console.log('Database seeding complete!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

module.exports = seedDatabase;
