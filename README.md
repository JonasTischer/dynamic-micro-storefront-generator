# Nextjs Starter Repo

A Next.js starter application with a full functional chat application

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Package Manager**: Bun
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Better Auth with Google OAuth
- **AI**: OpenAI API integration
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn and Radix UI + Custom components

## Prerequisites

- Node.js 18+ or Bun
- PostgreSQL database
- Google OAuth credentials
- OpenAI API key

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd nextjs-starter
```

### 2. Install dependencies

```bash
bun install
```

### 3. Environment Setup

Copy the example environment file and configure your variables:

```bash
cp .env.example .env.local
```

Required environment variables:

- `DATABASE_URL`: PostgreSQL connection string
- `BETTER_AUTH_URL`: Your app URL (http://localhost:3000 for development)
- `GOOGLE_OAUTH2_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_OAUTH2_CLIENT_SECRET`: Google OAuth client secret
- `OPENAI_API_KEY`: OpenAI API key for AI features

### 4. Database Setup

Generate and run database migrations:

```bash
# Generate migration files
bun run db:generate

# Push schema to database
bun run db:push
```

### 5. Run the development server

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Available Scripts

- `bun run dev` - Start development server with Turbopack
- `bun run build` - Build the application for production
- `bun run start` - Start the production server
- `bun run lint` - Run ESLint
- `bun run db:generate` - Generate Drizzle migrations
- `bun run db:push` - Push schema changes to database
- `bun run db:studio` - Launch Drizzle Studio for database management

## Database Management

### Migrations

The project uses Drizzle ORM for database management:

```bash
# After making schema changes in src/db/schema.ts
bun run db:generate

# Apply changes to your database
bun run db:push

# Open Drizzle Studio to view/edit data
bun run db:studio
```

### Schema

The database schema includes:
- User management with authentication
- Session management
- OAuth account linking

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── (auth)/         # Authentication pages
│   ├── (main)/         # Main application pages
│   └── api/            # API routes
├── components/         # Reusable UI components
├── db/                 # Database schema and connection
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and configurations
└── stores/             # Zustand state management
```

## Development

The application uses modern React patterns with:
- Server Components and Client Components
- Custom hooks for state management
- Responsive design with Tailwind CSS
- Type-safe database queries with Drizzle ORM
