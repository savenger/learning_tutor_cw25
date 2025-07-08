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
  }, {
    tableName: 'FlashCardAnswers',
    timestamps: true,
  });

  return FlashCardAnswer;
};
