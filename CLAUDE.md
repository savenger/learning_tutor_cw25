# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Backend Development
```bash
cd backend
npm run dev          # Start backend in development mode with nodemon
npm start           # Start backend in production mode
npm run seed        # Seed database with sample data
```

### Frontend Development
```bash
cd frontend
npm start           # Start React development server
npm run build       # Build production frontend
npm test           # Run React tests
```

### Full Stack Development
```bash
# Start all services using Docker
./Julius/start_all.sh

# Alternative: Use docker-compose (if available)
docker compose up -d --build

# Stop all services
./Julius/stop_all.sh
```

## Architecture Overview

This is **Learnify**, a full-stack learning tutor application with AI-powered flashcard evaluation built for coding.Waterkant 2025.

### Core Architecture
- **Frontend**: React 18 + TypeScript, Tailwind CSS, served via nginx (port 3000)
- **Backend**: Node.js + Express, Sequelize ORM, PostgreSQL (port 3001)
- **Database**: PostgreSQL 14 (port 5433 for backend, 5432 for N8N)
- **AI Workflows**: N8N automation platform (port 5678)
- **Knowledge Graph**: Neo4j + Graphiti MCP (ports 7474, 8000)

### Key Components

#### Database Schema
- **Decks**: Flashcard collections with name/description
- **Flashcards**: Questions/answers with scoring and tracking
- **FlashCardAnswers**: User responses with timestamps and feedback
- **FlashCardSessions**: Chat-based learning sessions with JSON message history

#### AI Integration Flow
1. Document uploads → Backend → N8N webhook → AI processing → Flashcard generation
2. User answers → N8N evaluation workflow → AI feedback → Response to frontend
3. Learning analytics → Neo4j knowledge graph → Personalized recommendations

#### API Structure
- `/api/decks` - CRUD operations for flashcard decks
- `/api/flashcards` - Individual flashcard management
- `/api/answers` - User answer tracking and evaluation
- `/api/sessions` - Chat session management

## Environment Setup

### Required Environment Variables
Copy `.env.sample` to `.env` and configure:
- `OPENAI_API_KEY` - Required for AI evaluation
- `N8N_API_KEY` - Generated after N8N setup
- `NEO4J_PASSWORD` - Neo4j database password
- `MODEL_NAME` - OpenAI model (default: gpt-4o-mini)

### Service URLs
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- N8N Workflows: http://localhost:5678
- Neo4j Browser: http://localhost:7474
- Graphiti MCP: http://localhost:8000

## Development Workflow

### Database Operations
- Database auto-initializes with `sequelize.sync({ force: true })` on startup
- Seeding happens automatically via `backend/seeders/seed.js`
- Models are located in `backend/models/` with proper associations

### N8N Workflow Setup
1. Access N8N at http://localhost:5678
2. Create user account and generate API key
3. Add API key to `.env` file
4. Restart containers to apply changes
5. Import workflows from `n8n-workflows/` directory

### File Upload Processing
- Frontend uploads to `/api/upload` endpoint
- Backend processes via multer middleware
- Files forwarded to N8N webhook for AI processing
- Results stored as new flashcards in database

## Deployment Notes

### Container Management
All services run in Docker containers with custom network `mynet`:
- Use `Julius/start_all.sh` for complete deployment
- Individual services can be started separately
- Volume persistence for all databases
- Health checks built into container startup

### Database Considerations
- PostgreSQL data persists in Docker volumes
- Sequelize handles table creation and migrations
- Foreign key constraints use CASCADE for data integrity
- JSON fields used for flexible message storage

### AI Model Configuration
- Default model: gpt-4o-mini (configurable via .env)
- OpenAI API key required for all AI features
- N8N workflows handle prompt engineering and response parsing
- Fallback responses implemented for API failures

## Testing

### Frontend Testing
- React Testing Library configured
- Test files follow `*.test.js` convention
- Run tests with `npm test` in frontend directory

### Backend Testing
- No formal test suite currently implemented
- Manual testing via API endpoints
- Database seeding provides test data

## Common Issues

### Database Connection
- Ensure PostgreSQL containers are running before backend
- Check connection strings in `backend/config/config.js`
- Verify environment variables match container configuration

### N8N Integration
- API key must be generated after N8N user creation
- Webhook URLs must match backend expectations
- Check N8N logs for workflow execution errors

### AI Processing
- Verify OpenAI API key is valid and has sufficient credits
- Check model availability and rate limits
- N8N workflows may need adjustment for different models