import BookGrid from "@/components/BookGrid";
import SearchBar from "@/components/SearchBar";
import Link from "next/link";
import { getActiveRentals } from "@/lib/db";

const TOPICS = [
  { label: "All", value: "" },
  { label: "Fiction", value: "fiction" },
  { label: "Mystery", value: "mystery" },
  { label: "Adventure", value: "adventure" },
  { label: "Romance", value: "love" },
  { label: "History", value: "history" },
  { label: "Science", value: "science" },
  { label: "Philosophy", value: "philosophy" },
  { label: "Poetry", value: "poetry" },
  { label: "Drama", value: "drama" },
  { label: "Horror", value: "horror" },
];

async function fetchBooks(search, topic, page = 1) {
  let url = `https://gutendex.com/books/?languages=en&page=${page}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  if (topic) url += `&topic=${encodeURIComponent(topic)}`;
  if (!search && !topic) url += "&mime_type=image%2Fjpeg";

  try {
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) return { results: [], count: 0, next: null, previous: null };
    return res.json();
  } catch {
    return { results: [], count: 0, next: null, previous: null };
  }
}

export default async function BooksPage({ searchParams }) {
  const params = await searchParams;
  const search = params?.search || "";
  const topic = params?.topic || "";
  const page = parseInt(params?.page || "1");

  const [data, activeRentals] = await Promise.all([
    fetchBooks(search, topic, page),
    getActiveRentals(),
  ]);

  const books = data.results || [];

  const rentalMap = {};
  activeRentals.forEach((r) => {
    rentalMap[r.gutendexId] = r;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1
          className="font-display text-4xl font-bold mb-2"
          style={{ color: "var(--text-primary)" }}
        >
          Browse Collection
        </h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          {data.count
            ? `${data.count.toLocaleString()} books available`
            : "Explore our library"}
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <SearchBar initialValue={search} />
      </div>

      {/* Topic Filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        {TOPICS.map((t) => {
          const isActive = topic === t.value;
          return (
            <Link
              key={t.value}
              href={`/books?${search ? `search=${encodeURIComponent(search)}&` : ""}${t.value ? `topic=${t.value}` : ""}`}
              className="px-4 py-1.5 rounded-full text-xs font-medium transition-all"
              style={{
                background: isActive ? "var(--accent-gold)" : "var(--bg-card)",
                color: isActive ? "#0f0d0a" : "var(--text-secondary)",
                border: `1px solid ${isActive ? "var(--accent-gold)" : "var(--border-medium)"}`,
              }}
            >
              {t.label}
            </Link>
          );
        })}
      </div>

      {/* Results */}
      {books.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-6xl mb-4">🔍</div>
          <h3
            className="font-display text-xl font-semibold mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            No books found
          </h3>
          <p
            className="text-sm mb-6"
            style={{ color: "var(--text-secondary)" }}
          >
            Try a different search term or browse all books.
          </p>
          <Link
            href="/books"
            className="btn-gold px-6 py-2.5 rounded-lg text-sm"
          >
            Browse All Books
          </Link>
        </div>
      ) : (
        <>
          {(search || topic) && (
            <div className="mb-4 flex items-center gap-2">
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {search && (
                  <>
                    <span style={{ color: "var(--accent-gold)" }}>
                      &ldquo;{search}&rdquo;
                    </span>{" "}
                    ·{" "}
                  </>
                )}
                {data.count?.toLocaleString()} results
              </p>
              <Link
                href="/books"
                className="text-xs px-2 py-0.5 rounded"
                style={{
                  color: "var(--accent-gold)",
                  border: "1px solid var(--accent-gold-dim)",
                }}
              >
                Clear
              </Link>
            </div>
          )}

          <BookGrid books={books} rentals={activeRentals} />

          {/* Pagination */}
          <div className="flex items-center justify-center gap-4 mt-12">
            {data.previous && (
              <Link
                href={`/books?${search ? `search=${encodeURIComponent(search)}&` : ""}${topic ? `topic=${topic}&` : ""}page=${page - 1}`}
                className="px-5 py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: "var(--bg-card)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border-medium)",
                }}
              >
                ← Previous
              </Link>
            )}
            <span className="text-sm" style={{ color: "var(--text-muted)" }}>
              Page {page}
            </span>
            {data.next && (
              <Link
                href={`/books?${search ? `search=${encodeURIComponent(search)}&` : ""}${topic ? `topic=${topic}&` : ""}page=${page + 1}`}
                className="px-5 py-2 rounded-lg text-sm font-medium"
                style={{
                  background: "var(--bg-card)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border-medium)",
                }}
              >
                Next →
              </Link>
            )}
          </div>
        </>
      )}
    </div>
  );
}
