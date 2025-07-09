module.exports = (sequelize, DataTypes) => {
  const FlashCardAnswer = sequelize.define('FlashCardAnswer', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    userAnswer: {
      type: DataTypes.STRING(1000), // Up to 1000 characters
      allowNull: false,
    },
    flashcardId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Flashcards', // This is the table name
        key: 'id',
      },
    },
    feedback: {
      type: DataTypes.STRING(1000), // Up to 1000 characters for AI feedback
      allowNull: true, // Can be null initially, will be populated after validation
    },
  }, {
    tableName: 'FlashCardAnswers',
    timestamps: true,
  });

  return FlashCardAnswer;
};
