module.exports = (sequelize, DataTypes) => {
  const Deck = sequelize.define('Deck', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING(1000), // Up to 1000 characters
      allowNull: true,
    },
  }, {
    tableName: 'Decks',
    timestamps: true,
  });

  return Deck;
};
