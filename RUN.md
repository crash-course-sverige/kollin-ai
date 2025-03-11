# Running the Project Locally

Follow these steps to get the project running locally:

## 1. Install Dependencies

```bash
pnpm install
```

## 2. Set up Environment Variables

Copy the `.env.local.example` file to `.env.local`:

```bash
cp .env.local.example .env.local
```

Then edit `.env.local` with your PostgreSQL database credentials and other configuration.

## 3. Set up the Database

Make sure you have a PostgreSQL database running. You can use Docker for an easy setup:

```bash
docker run --name postgres -e POSTGRES_PASSWORD=password -e POSTGRES_USER=postgres -e POSTGRES_DB=nextjs_app -p 5432:5432 -d postgres
```

Then push the schema to your database:

```bash
pnpm drizzle:push
```

## 4. Start the Development Server

```bash
pnpm dev
```

## 5. View the Application

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Additional Commands

- View the database with Drizzle Studio:

  ```bash
  pnpm db:studio
  ```

- Generate migrations:
  ```bash
  pnpm drizzle:generate
  ```

## Testing Authentication

For testing, you can register a new user using the registration form, or directly add users to the database. You can use both password-based authentication and OAuth providers if configured.
