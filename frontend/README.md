# Learnify Frontend

Learnify is a flashcard application designed to help users create, manage, and learn with flashcards effectively. This repository contains the frontend code for the Learnify application.

## Table of Contents

- [Learnify Frontend](#learnify-frontend)
  - [Table of Contents](#table-of-contents)
  - [Purpose](#purpose)
  - [Technologies Used](#technologies-used)
  - [Design and Style](#design-and-style)
  - [Components and Their Purpose](#components-and-their-purpose)
  - [Pages and Their Purpose](#pages-and-their-purpose)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
    - [Running the Frontend](#running-the-frontend)

## Purpose

The Learnify frontend provides a user interface for interacting with flashcard decks. Users can:
- View a list of all their flashcard decks.
- Create new decks and add descriptions.
- Play through a deck, viewing flashcards and submitting answers.
- (Placeholder) Import documents to potentially generate flashcards automatically.

## Technologies Used

- **React**: A JavaScript library for building user interfaces.
- **TypeScript**: A typed superset of JavaScript that compiles to plain JavaScript, enhancing code quality and maintainability.
- **Tailwind CSS**: A utility-first CSS framework for rapidly building custom designs.
- **React Router DOM**: For declarative routing in React applications.
- **React Icons**: A library for including popular icon packs in React projects.

## Design and Style

The Learnify frontend adopts a clean, modern, and intuitive design.
- **Color Palette**: Utilizes a primary blue (`#3B82F6`) and purple (`#8B5CF6`) gradient for the navigation bar, conveying a sense of learning and creativity. Neutral grays are used for backgrounds and text to ensure readability and focus on content.
- **Typography**: Employs clear, sans-serif fonts for easy readability.
- **Layout**: Uses a responsive design with `Container` components to ensure content is well-aligned and readable across various screen sizes.
- **Components**: Reusable UI components are designed with consistent styling, including subtle shadows, rounded corners, and hover effects to provide visual feedback.
- **Icons**: `react-icons` are integrated to enhance user experience and provide quick visual cues for actions and navigation.

## Components and Their Purpose

- **`Navbar.tsx`**: The main navigation bar at the top of the application, allowing users to navigate between Home, My Decks, and Import Document pages.
- **`Container.tsx`**: A simple wrapper component to provide consistent maximum width and padding for page content, ensuring a clean layout.
- **`Button.tsx`**: A versatile, reusable button component with different variants (primary, secondary, danger, success) and sizes (sm, md, lg) for consistent interactive elements.
- **`Input.tsx`**: A reusable input field component with optional label, designed for consistent form styling.
- **`Textarea.tsx`**: A reusable textarea component with optional label, for multi-line text input.
- **`DeckCard.tsx`**: Component to display a single flashcard deck with its name, description, and actions (Play, Edit, Delete).
- **`FlashcardDisplay.tsx`**: Renders a single flashcard, showing either the question or the answer based on the `showAnswer` prop.

## Pages and Their Purpose

- **`HomePage.tsx`**: The landing page of the application, providing a welcoming message and quick links to browse decks or import documents.
- **`DeckListPage.tsx`**: Displays a list of all available flashcard decks. Users can create new decks, edit existing ones, and delete decks from this page. Each deck is represented by a `DeckCard` component.
- **`DeckPlayPage.tsx`**: The interactive page where users can play through a selected flashcard deck. It displays flashcards one by one, allows users to reveal answers, navigate between cards, and submit their own answers (which are recorded via the backend).
- **`DocumentImporterPage.tsx`**: A page designed for uploading documents. This feature is currently a placeholder, demonstrating the UI for file selection and a simulated processing status. In a future iteration, it would integrate with backend logic to parse documents and generate flashcards.

## Getting Started

Follow these instructions to get the Learnify frontend up and running on your local machine.

### Prerequisites

- Node.js (LTS version recommended)
- npm or Yarn

### Installation

1.  **Clone the repository (if not already done by the generation process):**
    ```bash
    git clone <repository-url>
    cd learnify-frontend/frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

### Running the Frontend

1.  **Start the development server:**
    ```bash
    npm start
    # or
    yarn start
    ```

    This will start the React development server, typically on `http://localhost:3000`. The application will automatically open in your default web browser.

2.  **Ensure Backend is Running**:
    The frontend expects the backend API to be running on `http://localhost:3001`. Please ensure your backend service is active for full functionality.
