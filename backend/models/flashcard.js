module.exports = (sequelize, DataTypes) => {
  const Flashcard = sequelize.define('Flashcard', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    question: {
      type: DataTypes.STRING(1000), // Up to 1000 characters
      allowNull: false,
    },
    answer: {
      type: DataTypes.STRING(1000), // Up to 1000 characters
      allowNull: false,
    },
    deckId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Decks', // This is the table name
        key: 'id',
      },
    },
    seen: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
    },
  }, {
    tableName: 'Flashcards',
    timestamps: true,
  });

  return Flashcard;
};
