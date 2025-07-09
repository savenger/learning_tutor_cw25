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
db.FlashCardSession = require('./flashcardsession')(sequelize, DataTypes);

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

// Add associations for FlashCardAnswer
db.Flashcard.hasMany(db.FlashCardAnswer, {
  foreignKey: 'flashcardId',
  as: 'Answers',
  onDelete: 'CASCADE', // If a flashcard is deleted, its answers are also deleted
});

db.FlashCardAnswer.belongsTo(db.Flashcard, {
  foreignKey: 'flashcardId',
  as: 'Flashcard',
});

// Add associations for FlashCardSession
db.Flashcard.hasMany(db.FlashCardSession, {
  foreignKey: 'flashcardId',
  as: 'Sessions',
  onDelete: 'CASCADE', // If a flashcard is deleted, its sessions are also deleted
});

db.FlashCardSession.belongsTo(db.Flashcard, {
  foreignKey: 'flashcardId',
  as: 'Flashcard',
});

module.exports = db;
