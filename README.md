# Librix

Librix is a server-rendered digital library built with Next.js 16, TypeScript, Prisma, PostgreSQL, TanStack Query, and Tailwind CSS. Book metadata comes from the Gutendex API and borrowing history is stored locally.

## Architecture

- Next.js Server Components render catalog, detail, and library data.
- Gutendex requests use Next.js server caching.
- Prisma owns all PostgreSQL reads, writes, schema changes, and transactions.
- TanStack Query owns browser-initiated borrow and return mutations.
- Zod validates API request bodies at runtime.
- Client Components are limited to navigation, search, dialogs, and mutation controls.

## Requirements

- Node.js 20.19 or newer
- PostgreSQL
- A `DATABASE_URL` in `.env`

```bash
cp .env.example .env
npm install
npm run db:deploy
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Existing databases

The initial Prisma migration matches the original `books` and `rentals` tables. Before baselining an existing database, confirm that it has no schema drift:

```bash
npx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --exit-code
```

An empty diff exits with status `0`. After that check, record the existing schema as already applied:

```bash
npx prisma migrate resolve --applied 20261017000000_baseline
```

Do not run a reset against a database whose rentals must be preserved.

## Commands

```bash
npm run dev           # Development server
npm run build         # Production build
npm run lint          # ESLint
npm run typecheck     # Strict TypeScript check
npm test              # Unit tests
npm run db:validate   # Validate the Prisma schema
npm run db:generate   # Generate the Prisma client
npm run db:migrate    # Create/apply a development migration
npm run db:deploy     # Apply committed migrations
npm run db:status     # Show migration status
npm run db:studio     # Open Prisma Studio
```

## API

- `POST /api/borrow` borrows a book, subject to the three-book limit and copy availability.
- `POST /api/return` returns an active rental.
- `GET /api/library` returns rental history with book details.

Borrow and return operations use serializable Prisma transactions so rental state and copy counts commit together.

## Business rules

- One shared, unauthenticated library account
- Maximum three active rentals
- Seven-day loan period
- Two to five copies assigned when a book is first borrowed
- No waitlist
