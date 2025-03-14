# Setting Up Flashcard Progress Tracking Database

This feature requires a database to track user progress with flashcards. Follow these steps to set up the database schema:

## Prerequisites

- PostgreSQL database connection
- Environment variables set up with database connection URL

## Steps to Set Up

1. Ensure your PostgreSQL database is running and accessible
2. Verify your `.env` file contains the database connection URL:

```
DATABASE_URL=postgresql://username:password@hostname:port/database
```

3. Run the database migrations to create the necessary tables:

```bash
pnpm drizzle:push
```

4. Verify the `flashcard_progress` table has been created in your database

## Schema Structure

The `flashcard_progress` table has the following structure:

- `id`: UUID, primary key
- `userId`: UUID, foreign key references users.id
- `flashcardId`: integer, the ID of the flashcard
- `setId`: text, identifier for the flashcard set (e.g., "calculus")
- `difficulty`: varchar(10), one of 'easy', 'medium', 'hard'
- `lastReviewed`: timestamp, when the flashcard was last reviewed
- `nextReviewDate`: timestamp, for future spaced repetition implementation
- `reviewCount`: integer, number of times the flashcard has been reviewed
- `createdAt`: timestamp, when the record was created
- `updatedAt`: timestamp, when the record was last updated

## Fallback Behavior

If the database is not available or the user is not authenticated, the application will fall back to using localStorage to track progress on the client side. This ensures that progress is not lost and can be synchronized to the database when available.
