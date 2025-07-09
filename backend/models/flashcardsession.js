module.exports = (sequelize, DataTypes) => {
  const FlashCardSession = sequelize.define('FlashCardSession', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    flashcardId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Flashcards',
        key: 'id',
      },
    },
    sessionId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    messages: {
      type: DataTypes.JSON, // Store conversation history as JSON
      allowNull: false,
      defaultValue: [],
    },
    isCompleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    tableName: 'FlashCardSessions',
    timestamps: true,
  });

  return FlashCardSession;
}; 