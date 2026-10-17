import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { connection } from "next/server";
import BorrowButton from "@/components/BorrowButton";
import StatusBadge from "@/components/StatusBadge";
import { getBookById } from "@/lib/gutendex";
import { getBook, getRentalByBookId } from "@/lib/library-service";

interface BookDetailPageProps {
  params: Promise<{ id: string }>;
}

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getDaysLeft(dueDate: Date | string) {
  const diff = new Date(dueDate).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function isPastDue(dueDate: Date): boolean {
  return dueDate.getTime() < Date.now();
}

export default async function BookDetailPage({ params }: BookDetailPageProps) {
  await connection();
  const { id } = await params;
  const [book, localBook, rental] = await Promise.all([
    getBookById(id),
    getBook(id),
    getRentalByBookId(id),
  ]);

  if (!book) notFound();

  const isBorrowed = rental?.status === "BORROWED";
  const isOverdue = Boolean(
    isBorrowed && rental && isPastDue(rental.dueDate),
  );
  const daysLeft = isBorrowed && rental ? getDaysLeft(rental.dueDate) : null;

  const coverUrl =
    book.formats?.["image/jpeg"] ||
    `https://www.gutenberg.org/cache/epub/${book.id}/pg${book.id}.cover.medium.jpg`;

  const authors =
    book.authors
      ?.map((a) => {
        let name = a.name;
        // Gutendex format is "Last, First" - reverse it
        if (name.includes(",")) {
          const parts = name.split(",").map((p) => p.trim());
          name = `${parts[1]} ${parts[0]}`;
        }
        return name;
      })
      .join(", ") || "Unknown Author";

  const subjects = book.subjects?.slice(0, 6) || [];
  const bookshelves = book.bookshelves?.slice(0, 4) || [];
  const summaries = Array.isArray(book.summaries)
    ? book.summaries.filter(
        (summary) => typeof summary === "string" && summary.trim().length > 0,
      )
    : [];

  const readUrl =
    book.formats?.["text/html"] ||
    book.formats?.["text/html; charset=utf-8"] ||
    book.formats?.["application/epub+zip"] ||
    null;

  const availableCopies = localBook?.availableCopies ?? 3;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <div
        className="flex items-center gap-2 text-xs mb-8"
        style={{ color: "var(--text-muted)" }}
      >
        <Link
          href="/"
          className="hover:text-current transition-colors"
          style={{ color: "var(--text-muted)" }}
        >
          Home
        </Link>
        <span>›</span>
        <Link
          href="/books"
          className="hover:text-current transition-colors"
          style={{ color: "var(--text-muted)" }}
        >
          Browse
        </Link>
        <span>›</span>
        <span
          style={{ color: "var(--text-secondary)" }}
          className="truncate max-w-48"
        >
          {book.title}
        </span>
      </div>

      <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-10">
        {/* Left: Cover + Actions */}
        <div className="md:col-span-1">
          {/* Book Cover */}
          <div
            className="rounded-xl overflow-hidden shadow-2xl mb-6"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            }}
          >
            <div className="relative" style={{ paddingBottom: "140%" }}>
              <Image
                src={coverUrl}
                alt={book.title}
                fill
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div
                className="absolute inset-0 items-center justify-center p-6"
                style={{
                  background: "linear-gradient(135deg, #1e1a15, #2a221a)",
                  display: "none",
                }}
              >
                <div className="text-center">
                  <div className="text-5xl mb-3">📖</div>
                  <p
                    className="font-display text-sm"
                    style={{ color: "var(--accent-gold)" }}
                  >
                    {book.title}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Availability */}
          <div
            className="rounded-xl p-4 mb-4"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span
                className="text-xs font-medium"
                style={{ color: "var(--text-muted)" }}
              >
                Availability
              </span>
              <StatusBadge
                status={
                  isBorrowed
                    ? isOverdue
                      ? "OVERDUE"
                      : "BORROWED"
                    : availableCopies > 0
                      ? "AVAILABLE"
                      : "UNAVAILABLE"
                }
                size="sm"
              />
            </div>
            <div
              className="text-xs space-y-1"
              style={{ color: "var(--text-secondary)" }}
            >
              <div className="flex justify-between">
                <span>Available copies</span>
                <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                  {availableCopies}
                </span>
              </div>
              {isBorrowed && (
                <>
                  <div className="flex justify-between">
                    <span>Borrowed</span>
                    <span>{formatDate(rental.borrowedAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Due date</span>
                    <span
                      style={{
                        color: isOverdue ? "#e07878" : "var(--text-primary)",
                        fontWeight: 600,
                      }}
                    >
                      {formatDate(rental.dueDate)}
                    </span>
                  </div>
                  {!isOverdue && daysLeft !== null && (
                    <div className="flex justify-between">
                      <span>Days remaining</span>
                      <span
                        style={{
                          color:
                            daysLeft <= 2 ? "#e09050" : "var(--text-primary)",
                          fontWeight: 600,
                        }}
                      >
                        {daysLeft} day{daysLeft !== 1 ? "s" : ""}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <BorrowButton
              book={book}
              rental={rental}
              availableCopies={availableCopies}
            />

            {isBorrowed && readUrl && (
              <a
                href={readUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center px-6 py-3 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: "rgba(201,168,76,0.1)",
                  color: "var(--accent-gold)",
                  border: "1px solid var(--accent-gold-dim)",
                }}
              >
                📖 Read Now
              </a>
            )}

            {!isBorrowed && readUrl && (
              <p
                className="text-xs text-center"
                style={{ color: "var(--text-muted)" }}
              >
                Borrow to unlock reading access
              </p>
            )}
          </div>

          {/* Download formats */}
          {isBorrowed && (
            <div
              className="mt-4 rounded-xl p-4"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <p
                className="text-xs font-semibold mb-3 uppercase tracking-wider"
                style={{ color: "var(--text-muted)" }}
              >
                Formats
              </p>
              <div className="space-y-2">
                {book.formats?.["application/epub+zip"] && (
                  <a
                    href={book.formats["application/epub+zip"]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs py-1.5 transition-colors"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <span style={{ color: "var(--accent-gold)" }}>↓</span> EPUB
                  </a>
                )}
                {book.formats?.["application/x-mobipocket-ebook"] && (
                  <a
                    href={book.formats["application/x-mobipocket-ebook"]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs py-1.5"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <span style={{ color: "var(--accent-gold)" }}>↓</span> MOBI
                  </a>
                )}
                {book.formats?.["text/plain; charset=us-ascii"] && (
                  <a
                    href={book.formats["text/plain; charset=us-ascii"]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs py-1.5"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <span style={{ color: "var(--accent-gold)" }}>↓</span> Plain
                    Text
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right: Book Info */}
        <div className="md:col-span-2 lg:col-span-3">
          <div className="fade-in">
            {/* Title block */}
            <div className="mb-6">
              <h1
                className="font-display text-3xl md:text-4xl font-bold leading-tight mb-3"
                style={{ color: "var(--text-primary)" }}
              >
                {book.title}
              </h1>
              <p className="text-lg" style={{ color: "var(--text-secondary)" }}>
                by{" "}
                <span style={{ color: "var(--accent-gold-light)" }}>
                  {authors}
                </span>
              </p>
              {book.authors?.[0]?.birth_year && (
                <p
                  className="text-sm mt-1"
                  style={{ color: "var(--text-muted)" }}
                >
                  {book.authors[0].birth_year}
                  {book.authors[0].death_year
                    ? ` – ${book.authors[0].death_year}`
                    : ""}
                </p>
              )}
            </div>

            <div className="deco-line mb-6" />

            {/* Stats row */}
            <div className="flex flex-wrap gap-6 mb-8">
              <div>
                <p
                  className="text-xs uppercase tracking-wider mb-1"
                  style={{ color: "var(--text-muted)" }}
                >
                  Downloads
                </p>
                <p
                  className="font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {book.download_count?.toLocaleString() || "—"}
                </p>
              </div>
              <div>
                <p
                  className="text-xs uppercase tracking-wider mb-1"
                  style={{ color: "var(--text-muted)" }}
                >
                  Language
                </p>
                <p
                  className="font-semibold uppercase"
                  style={{ color: "var(--text-primary)" }}
                >
                  {book.languages?.[0] || "EN"}
                </p>
              </div>
              <div>
                <p
                  className="text-xs uppercase tracking-wider mb-1"
                  style={{ color: "var(--text-muted)" }}
                >
                  Copyright
                </p>
                <p
                  className="font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {book.copyright ? "Copyrighted" : "Public Domain"}
                </p>
              </div>
              <div>
                <p
                  className="text-xs uppercase tracking-wider mb-1"
                  style={{ color: "var(--text-muted)" }}
                >
                  Gutenberg ID
                </p>
                <p
                  className="font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  #{book.id}
                </p>
              </div>
            </div>

            {/* Summary */}
            <div className="mb-8">
              <h3
                className="text-sm font-semibold mb-3 uppercase tracking-wider"
                style={{ color: "var(--text-muted)" }}
              >
                Summary
              </h3>

              {summaries.length > 0 ? (
                <div className="space-y-3">
                  {summaries.slice(0, 2).map((summary, index) => (
                    <p
                      key={`${book.id}-summary-${index}`}
                      className="text-sm leading-relaxed"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {summary}
                    </p>
                  ))}
                </div>
              ) : (
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--text-secondary)" }}
                >
                  No summary is available for this title yet.
                </p>
              )}
            </div>

            {/* Subjects */}
            {subjects.length > 0 && (
              <div className="mb-8">
                <h3
                  className="text-sm font-semibold mb-3 uppercase tracking-wider"
                  style={{ color: "var(--text-muted)" }}
                >
                  Subjects
                </h3>
                <div className="flex flex-wrap gap-2">
                  {subjects.map((s) => (
                    <span
                      key={s}
                      className="px-3 py-1 rounded-full text-xs"
                      style={{
                        background: "var(--bg-card)",
                        color: "var(--text-secondary)",
                        border: "1px solid var(--border-medium)",
                      }}
                    >
                      {s.length > 50 ? s.slice(0, 50) + "…" : s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Bookshelves */}
            {bookshelves.length > 0 && (
              <div className="mb-8">
                <h3
                  className="text-sm font-semibold mb-3 uppercase tracking-wider"
                  style={{ color: "var(--text-muted)" }}
                >
                  Bookshelves
                </h3>
                <div className="flex flex-wrap gap-2">
                  {bookshelves.map((shelf) => (
                    <span
                      key={shelf}
                      className="px-3 py-1 rounded-full text-xs"
                      style={{
                        background: "rgba(201,168,76,0.08)",
                        color: "var(--accent-gold)",
                        border: "1px solid rgba(201,168,76,0.2)",
                      }}
                    >
                      {shelf}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Translators */}
            {book.translators?.length > 0 && (
              <div className="mb-8">
                <h3
                  className="text-sm font-semibold mb-2 uppercase tracking-wider"
                  style={{ color: "var(--text-muted)" }}
                >
                  Translators
                </h3>
                <p
                  className="text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {book.translators.map((t) => t.name).join(", ")}
                </p>
              </div>
            )}

            {/* Borrowing notice */}
            {!isBorrowed && availableCopies <= 0 && (
              <div
                className="rounded-xl p-4 mb-6"
                style={{
                  background: "rgba(139,58,58,0.1)",
                  border: "1px solid rgba(139,58,58,0.3)",
                }}
              >
                <p
                  className="text-sm font-semibold mb-1"
                  style={{ color: "#e07878" }}
                >
                  No copies available
                </p>
                <p
                  className="text-xs"
                  style={{ color: "var(--text-secondary)" }}
                >
                  All copies are currently borrowed. Check back later.
                </p>
              </div>
            )}

            {isOverdue && (
              <div
                className="rounded-xl p-4 mb-6"
                style={{
                  background: "rgba(139,58,58,0.1)",
                  border: "1px solid rgba(139,58,58,0.3)",
                }}
              >
                <p
                  className="text-sm font-semibold mb-1"
                  style={{ color: "#e07878" }}
                >
                  ⚠ This book is overdue
                </p>
                <p
                  className="text-xs"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Please return it so others can borrow it.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
