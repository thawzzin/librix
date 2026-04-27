import Link from "next/link";
import BookCard from "@/components/BookCard";

async function getFeaturedBooks() {
  try {
    const res = await fetch(
      "https://gutendex.com/books/?languages=en&mime_type=image%2Fjpeg",
      {
        next: { revalidate: 3600 },
      },
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.results?.slice(0, 12) || [];
  } catch {
    return [];
  }
}

async function getClassicBooks() {
  try {
    const res = await fetch(
      "https://gutendex.com/books/?topic=fiction&languages=en&mime_type=image%2Fjpeg",
      {
        next: { revalidate: 3600 },
      },
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.results?.slice(0, 6) || [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [featured, classics] = await Promise.all([
    getFeaturedBooks(),
    getClassicBooks(),
  ]);

  return (
    <div>
      {/* Hero */}
      <section
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(180deg, #171410 0%, #0f0d0a 100%)",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute -top-20 -right-20 w-96 h-96 rounded-full opacity-5"
            style={{
              background: "radial-gradient(circle, #c9a84c, transparent 70%)",
            }}
          />
          <div
            className="absolute -bottom-10 -left-10 w-64 h-64 rounded-full opacity-5"
            style={{
              background: "radial-gradient(circle, #d4784a, transparent 70%)",
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative">
          <div className="max-w-2xl">
            <p
              className="text-xs font-semibold tracking-widest uppercase mb-4 fade-in"
              style={{ color: "var(--accent-gold)" }}
            >
              Digital Library
            </p>
            <h1
              className="font-display text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 fade-in-delay-1"
              style={{ color: "var(--text-primary)" }}
            >
              Every great story
              <br />
              <em style={{ color: "var(--accent-gold)" }}>awaits you.</em>
            </h1>
            <p
              className="text-lg mb-8 leading-relaxed fade-in-delay-2"
              style={{ color: "var(--text-secondary)" }}
            >
              Borrow from thousands of timeless works. Read classics, discover
              hidden gems, and return when you&rsquo;re done.
            </p>
            <div className="flex flex-wrap gap-4 fade-in-delay-3">
              <Link
                href="/books"
                className="btn-gold px-8 py-3 rounded-lg text-sm font-semibold"
              >
                Browse Collection
              </Link>
              <Link
                href="/library"
                className="px-8 py-3 rounded-lg text-sm font-semibold transition-colors hover-border-accent"
                style={{
                  color: "var(--text-primary)",
                  border: "1px solid var(--border-medium)",
                  background: "transparent",
                }}
              >
                My Library
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div
            className="mt-16 pt-8 border-t flex flex-wrap gap-8"
            style={{ borderColor: "var(--border-subtle)" }}
          >
            {[
              { value: "70,000+", label: "Books Available" },
              { value: "Free", label: "To Read & Borrow" },
              { value: "7 Days", label: "Borrow Period" },
              { value: "3 Books", label: "Max At Once" },
            ].map((stat) => (
              <div key={stat.label}>
                <div
                  className="font-display text-2xl font-bold"
                  style={{ color: "var(--accent-gold)" }}
                >
                  {stat.value}
                </div>
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Books */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p
              className="text-xs font-semibold tracking-widest uppercase mb-1"
              style={{ color: "var(--accent-gold)" }}
            >
              Popular
            </p>
            <h2
              className="font-display text-3xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              Featured Books
            </h2>
          </div>
          <Link
            href="/books"
            className="text-sm font-medium transition-colors nav-link"
            style={{ color: "var(--text-secondary)" }}
          >
            View all →
          </Link>
        </div>

        {featured.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 stagger-children">
            {featured.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p style={{ color: "var(--text-muted)" }}>
              Unable to load books. Please check your connection.
            </p>
          </div>
        )}
      </section>

      {/* Divider */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="deco-line" />
      </div>

      {/* Browse by genre */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-8">
          <p
            className="text-xs font-semibold tracking-widest uppercase mb-1"
            style={{ color: "var(--accent-gold)" }}
          >
            Explore
          </p>
          <h2
            className="font-display text-3xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Browse by Subject
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 stagger-children">
          {[
            { label: "Fiction", icon: "✦", topic: "fiction" },
            { label: "Mystery", icon: "◈", topic: "mystery" },
            { label: "Romance", icon: "♡", topic: "love" },
            { label: "Adventure", icon: "◉", topic: "adventure" },
            { label: "Philosophy", icon: "⟁", topic: "philosophy" },
            { label: "History", icon: "◎", topic: "history" },
            { label: "Science", icon: "⬡", topic: "science" },
            { label: "Poetry", icon: "◈", topic: "poetry" },
          ].map((genre) => (
            <Link
              key={genre.topic}
              href={`/books?topic=${genre.topic}`}
              className="group flex items-center gap-3 p-4 rounded-xl transition-all hover-border-accent"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <span className="text-xl" style={{ color: "var(--accent-gold)" }}>
                {genre.icon}
              </span>
              <span
                className="text-sm font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                {genre.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section
        style={{
          background: "var(--bg-secondary)",
          borderTop: "1px solid var(--border-subtle)",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2
            className="font-display text-3xl font-bold text-center mb-12"
            style={{ color: "var(--text-primary)" }}
          >
            How it works
          </h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Browse & Search",
                desc: "Explore thousands of books across every genre and subject.",
              },
              {
                step: "02",
                title: "Borrow",
                desc: "Borrow up to 3 books at a time. Each loan is for 7 days.",
              },
              {
                step: "03",
                title: "Read & Return",
                desc: "Read online or download. Return when done for someone else.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div
                  className="font-display text-5xl font-bold mb-4"
                  style={{ color: "var(--border-medium)" }}
                >
                  {item.step}
                </div>
                <h3
                  className="font-semibold text-lg mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  {item.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
