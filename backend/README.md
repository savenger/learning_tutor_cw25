# Learnify Backend

This is the backend service for the Learnify Flashcard App. It provides a RESTful API for managing decks, flashcards, and flashcard answers.

## Purpose

The purpose of this backend is to:
- Manage flashcard decks and individual flashcards.
- Provide API endpoints for creating, reading, updating, and deleting decks and flashcards.
- Handle the processing of documents (placeholder for future functionality).
- Store user answers to flashcards.

## Technologies Used

- **Node.js**: JavaScript runtime environment.
- **Express.js**: Web application framework for Node.js.
- **PostgreSQL**: Relational database.
- **Sequelize**: ORM (Object-Relational Mapper) for Node.js and PostgreSQL.
- **Docker**: For containerization and easy deployment.
- **dotenv**: To manage environment variables.

## Database Schema

The database consists of three main tables:

### `Decks`
- `id`: INTEGER, PRIMARY KEY, AUTO_INCREMENT
- `name`: STRING (VARCHAR), NOT NULL
- `description`: TEXT (VARCHAR(1000)), NULLABLE
- `createdAt`: DATETIME
- `updatedAt`: DATETIME

### `Flashcards`
- `id`: INTEGER, PRIMARY KEY, AUTO_INCREMENT
- `question`: TEXT (VARCHAR(1000)), NOT NULL
- `answer`: TEXT (VARCHAR(1000)), NOT NULL
- `deckId`: INTEGER, FOREIGN KEY (references `Decks.id`), NOT NULL
- `createdAt`: DATETIME
- `updatedAt`: DATETIME

### `FlashCardAnswers`
- `id`: INTEGER, PRIMARY KEY, AUTO_INCREMENT
- `time`: DATETIME, NOT NULL
- `userAnswer`: TEXT (VARCHAR(1000)), NOT NULL
- `createdAt`: DATETIME
- `updatedAt`: DATETIME

### Relationships
- A `Deck` can have many `Flashcards` (One-to-Many relationship: `Deck` hasMany `Flashcard`).
- A `Flashcard` belongs to one `Deck` (Many-to-One relationship: `Flashcard` belongsTo `Deck`).

## API Routes

All API routes are prefixed with `/api`.

### Decks

- **`GET /api/decks`**: Get all decks.
  - **Response**: `Array<Deck>`
- **`GET /api/decks/:id`**: Get a specific deck by ID, including its flashcards.
  - **Parameters**: `id` (integer) - The ID of the deck.
  - **Response**: `Deck` object with nested `Flashcards` array.
- **`POST /api/decks`**: Create a new deck.
  - **Request Body**: `{ "name": "string", "description": "string" }`
  - **Response**: `Deck` object
- **`PUT /api/decks/:id`**: Update an existing deck.
  - **Parameters**: `id` (integer) - The ID of the deck.
  - **Request Body**: `{ "name": "string", "description": "string" }` (partial updates allowed)
  - **Response**: `Deck` object
- **`DELETE /api/decks/:id`**: Delete a deck and its associated flashcards.
  - **Parameters**: `id` (integer) - The ID of the deck.
  - **Response**: `{ "message": "Deck deleted successfully" }`

### Flashcards

- **`GET /api/flashcards`**: Get all flashcards.
  - **Response**: `Array<Flashcard>`
- **`GET /api/flashcards/:id`**: Get a specific flashcard by ID.
  - **Parameters**: `id` (integer) - The ID of the flashcard.
  - **Response**: `Flashcard` object
- **`POST /api/flashcards`**: Create a new flashcard.
  - **Request Body**: `{ "question": "string", "answer": "string", "deckId": "integer" }`
  - **Response**: `Flashcard` object
- **`PUT /api/flashcards/:id`**: Update an existing flashcard.
  - **Parameters**: `id` (integer) - The ID of the flashcard.
  - **Request Body**: `{ "question": "string", "answer": "string", "deckId": "integer" }` (partial updates allowed)
  - **Response**: `Flashcard` object
- **`DELETE /api/flashcards/:id`**: Delete a flashcard.
  - **Parameters**: `id` (integer) - The ID of the flashcard.
  - **Response**: `{ "message": "Flashcard deleted successfully" }`

### FlashCardAnswers

- **`POST /api/flashcardanswers`**: Record a user's answer to a flashcard.
  - **Request Body**: `{ "time": "datetime", "userAnswer": "string" }`
  - **Response**: `FlashCardAnswer` object

### Document Processing

- **`POST /api/processDocument`**: Placeholder endpoint for processing uploaded documents (e.g., PDF).
  - **Request Body**: (Expected to be a file upload, but currently a placeholder)
  - **Response**: `{ "result": "success|error", "message": "string" }`

## Authentication and Authorization Logic

This backend currently does not implement any authentication or authorization logic. All API endpoints are publicly accessible. For a production application, it is highly recommended to add proper authentication (e.g., JWT) and authorization (e.g., role-based access control).

## Data Flow

1.  **Client Request**: A frontend application (e.g., React app) sends an HTTP request to the backend API.
2.  **Express Router**: The request is received by the Express server and routed to the appropriate controller function based on the URL and HTTP method.
3.  **Controller Logic**: The controller function handles the request, performs validation, and interacts with the database via Sequelize.
4.  **Sequelize ORM**: Sequelize translates JavaScript object operations into SQL queries, which are then executed against the PostgreSQL database.
5.  **PostgreSQL Database**: Stores and retrieves data.
6.  **Sequelize ORM**: Results from the database are converted back into JavaScript objects by Sequelize.
7.  **Controller Response**: The controller formats the data and sends an HTTP response back to the client.

## How to Run the Backend

### Prerequisites

- Docker and Docker Compose installed.

### Steps

1.  **Clone the repository** (if applicable, otherwise navigate to the `backend` directory).
2.  **Navigate to the `backend` directory**:
    ```bash
    cd backend
    ```
3.  **Build and run the Docker containers**:
    ```bash
    docker-compose up --build
    ```
    This command will:
    - Build the Node.js application image.
    - Start a PostgreSQL database container.
    - Start the Node.js backend application container.
    - The backend will automatically run database migrations (if any) and seed initial data on startup.

4.  **Access the API**:
    The backend server will be running on `http://localhost:3001`. You can test the API endpoints using tools like Postman, Insomnia, or `curl`.

### Running Locally (without Docker for development)

1.  **Install Node.js and npm**.
2.  **Install PostgreSQL** and ensure it's running.
3.  **Create a database** named `postgres` (or whatever you configure in `.env`).
4.  **Navigate to the `backend` directory**:
    ```bash
    cd backend
    ```
5.  **Install dependencies**:
    ```bash
    npm install
    ```
6.  **Create a `.env` file** in the `backend` directory with the following content:
    ```
    PORT=3001
    POSTGRES_HOST=localhost
    POSTGRES_PORT=5432
    POSTGRES_USER=postgres
    POSTGRES_PASSWORD=postgres
    POSTGRES_DB=postgres
    ```
7.  **Run the application in development mode**:
    ```bash
    npm run dev
    ```
    This will use `nodemon` to automatically restart the server on code changes.

    To run once and exit:
    ```bash
    npm start
    ```
