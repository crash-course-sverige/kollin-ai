# Modern Next.js Application

A modern, type-safe Next.js 15 application with role-based authentication, responsive design, and a feature-based architecture.

## Tech Stack

- **Next.js 15** (App Router)
- **TypeScript** (strict mode)
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **Drizzle ORM** for database operations
- **PostgreSQL** as the database
- **NextAuth.js** for authentication

## Features

- **Authentication** with role-based access control
- **Responsive Dashboard** that works on mobile, tablet, and desktop
- **Dark/Light Theme** support
- **User Management** with sorting, filtering, and pagination
- **Settings** management

## Project Structure

The project follows a feature-based architecture, inspired by Bulletproof React:

```
src/
├── app/                  # Next.js App Router pages
├── components/           # Shared UI components
│   ├── ui/               # shadcn/ui components
│   └── common/           # Common components used across features
├── features/             # Feature-based modules
│   ├── auth/             # Authentication-related components
│   ├── dashboard/        # Dashboard-related components
│   ├── users/            # User management components
│   └── settings/         # Settings-related components
├── lib/                  # Shared utility libraries
│   ├── db/               # Database schema and queries
│   └── auth.ts           # Authentication configuration
├── hooks/                # Custom React hooks
└── types/                # TypeScript type definitions
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- PostgreSQL database

### Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Setup environment variables by copying `.env.local.example` to `.env.local` and filling in the values:
   ```bash
   cp .env.local.example .env.local
   ```
4. Initialize the database:
   ```bash
   pnpm drizzle-kit push:pg
   ```
5. Start the development server:
   ```bash
   pnpm dev
   ```
6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Database Migrations

To generate and run migrations:

```bash
# Generate migrations based on schema changes
pnpm drizzle-kit generate

# Apply migrations
pnpm drizzle-kit push:pg
```

## Development Commands

```bash
# Start the development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linting
pnpm lint
```

## Deployment

This application can be deployed to Vercel, Netlify, or any other platform that supports Next.js applications.

When deploying, make sure to set up the appropriate environment variables for your database connection and authentication.
