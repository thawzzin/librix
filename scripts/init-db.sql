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

CREATE TABLE IF NOT EXISTS rentals (
  id TEXT PRIMARY KEY,
  book_id TEXT REFERENCES books(id),
  gutendex_id TEXT NOT NULL,
  borrowed_at TIMESTAMPTZ NOT NULL,
  due_date TIMESTAMPTZ NOT NULL,
  returned_at TIMESTAMPTZ,
  status TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS rentals_status_idx ON rentals(status);
CREATE INDEX IF NOT EXISTS rentals_gutendex_idx ON rentals(gutendex_id);
