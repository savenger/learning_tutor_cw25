require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
const routes = require('./routes');
const seedDatabase = require('./seeders/seed');

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for all origins
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.use('/api', routes);

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection to the database has been established successfully.');

    // Sync models (create tables if they don't exist)
    // In production, you might use migrations instead of `sync({ force: true })` or `sync({ alter: true })`
    await sequelize.sync({ force: true }); // Use force: true for development to drop and re-create tables
    console.log('Database synchronized.');

    // Seed the database with initial data
    await seedDatabase();
    console.log('Database seeded successfully.');

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database or start server:', error);
  }
};

startServer();
