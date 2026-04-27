# 📚 Folio — Digital Library App

A full-stack digital library web app built with Next.js (App Router), Tailwind CSS, and PostgreSQL. Powered by the [Gutendex API](https://gutendex.com/) for real book data from Project Gutenberg.

## Features

- **Browse 70,000+ books** from the Gutenberg catalog
- **Search** by title, author, or subject
- **Filter** by genre/topic (Fiction, Mystery, Romance, etc.)
- **Borrow system** with real constraints:
  - Max 3 books at a time
  - 7-day loan period
  - Limited copies per book (2–5)
- **Read books** online via HTML, EPUB, or plain text
- **Return books** to free up slots
- **My Library** page with due dates, overdue highlighting, and reading history
- Dark, elegant UI with warm gold accents and smooth animations

## Tech Stack

| Layer         | Technology                   |
| ------------- | ---------------------------- |
| Framework     | Next.js 16 (App Router)      |
| Styling       | Tailwind CSS v4              |
| Language      | JavaScript (no TypeScript)   |
| Database      | PostgreSQL                   |
| API           | Gutendex (Project Gutenberg) |
| State         | React `useState`/`useEffect` |
| Data Fetching | Next.js built-in `fetch`     |

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# 1. Clone / unzip the project
cd library-app

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Update DATABASE_URL in .env

# 4. Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Project Structure

```
library-app/
├── app/
│   ├── layout.js              # Root layout with Navbar
│   ├── page.js                # Home page (featured books, hero)
│   ├── globals.css            # Global styles + design tokens
│   ├── not-found.js           # 404 page
│   ├── books/
│   │   ├── page.js            # Browse page (search, filter, pagination)
│   │   └── [id]/
│   │       └── page.js        # Book detail (borrow, read, return)
│   ├── library/
│   │   ├── page.js            # My Library page
│   │   └── ReturnButton.js    # Client component for returns
│   └── api/
│       ├── borrow/route.js    # POST /api/borrow
│       ├── return/route.js    # POST /api/return
│       └── library/route.js   # GET /api/library
├── components/
│   ├── Navbar.js              # Sticky navigation
│   ├── BookCard.js            # Individual book card with cover
│   ├── BookGrid.js            # Responsive grid layout
│   ├── SearchBar.js           # Search with router navigation
│   ├── BorrowButton.js        # Borrow/Return action button
│   ├── StatusBadge.js         # BORROWED / OVERDUE / AVAILABLE badge
│   └── BookSkeleton.js        # Loading skeleton
├── lib/
│   └── db.js                  # PostgreSQL database helpers
└── README.md
```

## Database Schema

The PostgreSQL database stores two tables:

### Books

```json
{
  "id": "book_1234_abc",
  "gutendexId": "1342",
  "title": "Pride and Prejudice",
  "author": "Jane Austen",
  "coverImage": "https://...",
  "formats": {
    "text/html": "https://...",
    "application/epub+zip": "https://..."
  },
  "totalCopies": 3,
  "availableCopies": 2,
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

### Rentals

```json
{
  "id": "rental_1234_xyz",
  "bookId": "book_1234_abc",
  "gutendexId": "1342",
  "borrowedAt": "2025-01-01T00:00:00.000Z",
  "dueDate": "2025-01-08T00:00:00.000Z",
  "returnedAt": null,
  "status": "BORROWED"
}
```

## API Routes

### `POST /api/borrow`

Borrows a book for the user.

**Request body:**

```json
{
  "gutendexId": "1342",
  "title": "Pride and Prejudice",
  "author": "Jane Austen",
  "coverImage": "https://...",
  "formats": {}
}
```

**Validation:**

- Max 3 active rentals
- Book not already borrowed
- Copies available

### `POST /api/return`

Returns a borrowed book.

**Request body:**

```json
{ "rentalId": "rental_1234_xyz" }
```

### `GET /api/library`

Returns all rentals with book details.

## Business Rules

| Rule               | Value                            |
| ------------------ | -------------------------------- |
| Max books per user | 3                                |
| Loan period        | 7 days                           |
| Copies per book    | 2–5 (randomized on first borrow) |
| Overdue threshold  | Past due date                    |
| No waitlist        | ✓ (by design)                    |
| No auth            | Single-user mode                 |

## PostgreSQL Setup

Set the `DATABASE_URL` in your `.env` (see `.env.example`). Tables are created automatically on first run.

## Scripts

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Build for production
npm start        # Start production server
```
