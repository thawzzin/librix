// PostgreSQL database (pg)
import { Pool } from "pg";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not set. Add it to your environment variables.",
  );
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

let isDbReady = false;

async function initDb() {
  if (isDbReady) return;

  await pool.query(`
    CREATE TABLE IF NOT EXISTS books (
      id TEXT PRIMARY KEY,
      gutendex_id TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      cover_image TEXT,
      formats JSONB DEFAULT '{}'::jsonb,
      total_copies INTEGER NOT NULL,
      available_copies INTEGER NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS rentals (
      id TEXT PRIMARY KEY,
      book_id TEXT REFERENCES books(id),
      gutendex_id TEXT NOT NULL,
      borrowed_at TIMESTAMPTZ NOT NULL,
      due_date TIMESTAMPTZ NOT NULL,
      returned_at TIMESTAMPTZ,
      status TEXT NOT NULL
    );
  `);

  await pool.query(
    "CREATE INDEX IF NOT EXISTS rentals_status_idx ON rentals(status)",
  );
  await pool.query(
    "CREATE INDEX IF NOT EXISTS rentals_gutendex_idx ON rentals(gutendex_id)",
  );

  isDbReady = true;
}

async function dbQuery(text, params = []) {
  await initDb();
  return pool.query(text, params);
}

function mapBookRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    gutendexId: row.gutendex_id,
    title: row.title,
    author: row.author,
    coverImage: row.cover_image,
    formats: row.formats || {},
    totalCopies: row.total_copies,
    availableCopies: row.available_copies,
    createdAt: row.created_at,
  };
}

function mapRentalRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    bookId: row.book_id,
    gutendexId: row.gutendex_id,
    borrowedAt: row.borrowed_at,
    dueDate: row.due_date,
    returnedAt: row.returned_at,
    status: row.status,
  };
}

function mapBookFromJoin(row) {
  if (!row?.book_id) return {};
  return {
    id: row.book_id,
    gutendexId: row.book_gutendex_id,
    title: row.book_title,
    author: row.book_author,
    coverImage: row.book_cover_image,
    formats: row.book_formats || {},
    totalCopies: row.book_total_copies,
    availableCopies: row.book_available_copies,
    createdAt: row.book_created_at,
  };
}

// BOOKS
export async function getBook(gutendexId) {
  const { rows } = await dbQuery(
    "SELECT * FROM books WHERE gutendex_id = $1 LIMIT 1",
    [String(gutendexId)],
  );
  return mapBookRow(rows[0]);
}

export async function upsertBook(bookData) {
  const copies = Math.floor(Math.random() * 4) + 2;
  const newId = `book_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  const { rows } = await dbQuery(
    `
      INSERT INTO books (
        id, gutendex_id, title, author, cover_image, formats, total_copies, available_copies, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $7, NOW())
      ON CONFLICT (gutendex_id) DO UPDATE
      SET title = EXCLUDED.title,
          author = EXCLUDED.author,
          cover_image = EXCLUDED.cover_image,
          formats = EXCLUDED.formats
      RETURNING *
    `,
    [
      newId,
      String(bookData.gutendexId),
      bookData.title || "Unknown Title",
      bookData.author || "Unknown Author",
      bookData.coverImage || null,
      bookData.formats || {},
      copies,
    ],
  );

  return mapBookRow(rows[0]);
}

export async function decrementCopies(gutendexId) {
  const { rows } = await dbQuery(
    `
      UPDATE books
      SET available_copies = available_copies - 1
      WHERE gutendex_id = $1 AND available_copies > 0
      RETURNING id
    `,
    [String(gutendexId)],
  );
  return rows.length > 0;
}

export async function incrementCopies(gutendexId) {
  const { rows } = await dbQuery(
    `
      UPDATE books
      SET available_copies = LEAST(available_copies + 1, total_copies)
      WHERE gutendex_id = $1
      RETURNING id
    `,
    [String(gutendexId)],
  );
  return rows.length > 0;
}

// RENTALS
export async function getRentals() {
  const { rows } = await dbQuery(
    "SELECT * FROM rentals ORDER BY borrowed_at DESC",
  );
  return rows.map(mapRentalRow);
}

export async function getActiveRentals() {
  const { rows } = await dbQuery(
    "SELECT * FROM rentals WHERE status = $1 ORDER BY borrowed_at DESC",
    ["BORROWED"],
  );
  return rows.map(mapRentalRow);
}

export async function getRentalByBookId(gutendexId) {
  const { rows } = await dbQuery(
    "SELECT * FROM rentals WHERE gutendex_id = $1 AND status = $2 LIMIT 1",
    [String(gutendexId), "BORROWED"],
  );
  return mapRentalRow(rows[0]);
}

export async function createRental(gutendexId, bookId) {
  const now = new Date();
  const due = new Date(now);
  due.setDate(due.getDate() + 7);

  const rentalId = `rental_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  const { rows } = await dbQuery(
    `
      INSERT INTO rentals (
        id, book_id, gutendex_id, borrowed_at, due_date, returned_at, status
      ) VALUES ($1, $2, $3, $4, $5, NULL, $6)
      RETURNING *
    `,
    [
      rentalId,
      bookId,
      String(gutendexId),
      now.toISOString(),
      due.toISOString(),
      "BORROWED",
    ],
  );

  return mapRentalRow(rows[0]);
}

export async function returnRental(rentalId) {
  const { rows } = await dbQuery(
    `
      UPDATE rentals
      SET status = $2, returned_at = NOW()
      WHERE id = $1
      RETURNING *
    `,
    [rentalId, "RETURNED"],
  );
  return mapRentalRow(rows[0]);
}

export async function getLibraryWithBooks() {
  const { rows } = await dbQuery(
    `
      SELECT
        r.*, 
        b.id AS book_id,
        b.gutendex_id AS book_gutendex_id,
        b.title AS book_title,
        b.author AS book_author,
        b.cover_image AS book_cover_image,
        b.formats AS book_formats,
        b.total_copies AS book_total_copies,
        b.available_copies AS book_available_copies,
        b.created_at AS book_created_at
      FROM rentals r
      LEFT JOIN books b ON b.gutendex_id = r.gutendex_id
      WHERE r.status = 'BORROWED'
      ORDER BY r.borrowed_at DESC
    `,
  );

  return rows.map((row) => {
    const rental = mapRentalRow(row);
    const isOverdue = new Date(rental.dueDate) < new Date();
    return { ...rental, book: mapBookFromJoin(row), isOverdue };
  });
}

export async function getAllRentalsWithBooks() {
  const { rows } = await dbQuery(
    `
      SELECT
        r.*, 
        b.id AS book_id,
        b.gutendex_id AS book_gutendex_id,
        b.title AS book_title,
        b.author AS book_author,
        b.cover_image AS book_cover_image,
        b.formats AS book_formats,
        b.total_copies AS book_total_copies,
        b.available_copies AS book_available_copies,
        b.created_at AS book_created_at
      FROM rentals r
      LEFT JOIN books b ON b.gutendex_id = r.gutendex_id
      ORDER BY r.borrowed_at DESC
    `,
  );

  return rows.map((row) => {
    const rental = mapRentalRow(row);
    const isOverdue =
      rental.status === "BORROWED" && new Date(rental.dueDate) < new Date();
    return { ...rental, book: mapBookFromJoin(row), isOverdue };
  });
}
