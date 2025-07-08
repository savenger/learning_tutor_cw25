const { Sequelize, DataTypes } = require('sequelize');
const config = require(__dirname + '/../config/config.js')[process.env.NODE_ENV || 'development'];

const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  port: config.port,
  dialect: config.dialect,
  logging: config.logging,
});

const db = {};

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Import models
db.Deck = require('./deck')(sequelize, DataTypes);
db.Flashcard = require('./flashcard')(sequelize, DataTypes);
db.FlashCardAnswer = require('./flashcardanswer')(sequelize, DataTypes);

// Define associations
db.Deck.hasMany(db.Flashcard, {
  foreignKey: 'deckId',
  as: 'Flashcards',
  onDelete: 'CASCADE', // If a deck is deleted, its flashcards are also deleted
});
db.Flashcard.belongsTo(db.Deck, {
  foreignKey: 'deckId',
  as: 'Deck',
});

// No direct association specified for FlashCardAnswer, assuming it's independent or linked implicitly via frontend logic.
// If FlashCardAnswer needs to be linked to a Flashcard, add:
// db.Flashcard.hasMany(db.FlashCardAnswer, { foreignKey: 'flashcardId', as: 'Answers' });
// db.FlashCardAnswer.belongsTo(db.Flashcard, { foreignKey: 'flashcardId', as: 'Flashcard' });


module.exports = db;
