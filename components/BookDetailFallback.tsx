"use client";

import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import BorrowButton from "@/components/BorrowButton";
import StatusBadge from "@/components/StatusBadge";
import { getBookByIdInBrowser } from "@/lib/gutendex-client";
import type { BookRecord, RentalRecord } from "@/types/library";

interface BookDetailFallbackProps {
  id: string;
  localBook: BookRecord | null;
  rental: RentalRecord | null;
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getDaysLeft(dueDate: Date | string, now: number): number {
  return Math.ceil((new Date(dueDate).getTime() - now) / 86_400_000);
}

export default function BookDetailFallback({
  id,
  localBook,
  rental,
}: BookDetailFallbackProps) {
  const query = useQuery({
    queryKey: ["gutendex", "browser-fallback", "book", id],
    queryFn: () => getBookByIdInBrowser(id),
    staleTime: 60 * 60 * 1000,
    retry: 1,
  });

  if (query.isPending) {
    return <p className="py-24 text-center text-sm" role="status">Loading book details…</p>;
  }

  if (query.isError) {
    return (
      <div className="py-24 text-center" role="alert">
        <h1 className="font-display text-2xl font-semibold">Unable to load this book</h1>
        <button type="button" onClick={() => query.refetch()} className="btn-gold mt-6 cursor-pointer rounded-lg px-6 py-2.5 text-sm">
          Try Again
        </button>
      </div>
    );
  }

  const book = query.data;
  const referenceTime = query.dataUpdatedAt;
  const isBorrowed = rental?.status === "BORROWED";
  const isOverdue = Boolean(
    isBorrowed && rental && new Date(rental.dueDate).getTime() < referenceTime,
  );
  const daysLeft = isBorrowed && rental
    ? getDaysLeft(rental.dueDate, referenceTime)
    : null;
  const availableCopies = localBook?.availableCopies ?? 3;
  const coverUrl = book.formats["image/jpeg"] ??
    `https://www.gutenberg.org/cache/epub/${book.id}/pg${book.id}.cover.medium.jpg`;
  const authors = book.authors.map((author) => {
    const [lastName, ...givenNames] = author.name.split(",");
    return givenNames.length
      ? `${givenNames.join(",").trim()} ${lastName.trim()}`
      : author.name;
  }).join(", ") || "Unknown Author";
  const summaries = book.summaries?.filter((summary) => summary.trim()) ?? [];
  const subjects = book.subjects.slice(0, 6);
  const bookshelves = book.bookshelves.slice(0, 4);
  const readUrl = book.formats["text/html"] ??
    book.formats["text/html; charset=utf-8"] ??
    book.formats["application/epub+zip"] ?? null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
        <Link href="/" style={{ color: "var(--text-muted)" }}>Home</Link>
        <span>›</span>
        <Link href="/books" style={{ color: "var(--text-muted)" }}>Browse</Link>
        <span>›</span>
        <span className="max-w-48 truncate" style={{ color: "var(--text-secondary)" }}>{book.title}</span>
      </div>

      <div className="grid gap-10 md:grid-cols-3 lg:grid-cols-4">
        <div className="md:col-span-1">
          <div
            className="mb-6 overflow-hidden rounded-xl shadow-2xl"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            }}
          >
            <div className="relative" style={{ paddingBottom: "140%" }}>
              <Image src={coverUrl} alt={book.title} fill className="object-cover" />
            </div>
          </div>

          <div className="mb-4 rounded-xl p-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Availability</span>
              <StatusBadge
                status={isBorrowed
                  ? isOverdue ? "OVERDUE" : "BORROWED"
                  : availableCopies > 0 ? "AVAILABLE" : "UNAVAILABLE"}
                size="sm"
              />
            </div>
            <div className="space-y-1 text-xs" style={{ color: "var(--text-secondary)" }}>
              <div className="flex justify-between">
                <span>Available copies</span>
                <strong style={{ color: "var(--text-primary)" }}>{availableCopies}</strong>
              </div>
              {isBorrowed && rental && (
                <>
                  <div className="flex justify-between"><span>Borrowed</span><span>{formatDate(rental.borrowedAt)}</span></div>
                  <div className="flex justify-between"><span>Due date</span><strong>{formatDate(rental.dueDate)}</strong></div>
                  {!isOverdue && daysLeft !== null && (
                    <div className="flex justify-between">
                      <span>Days remaining</span><strong>{daysLeft} day{daysLeft === 1 ? "" : "s"}</strong>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <BorrowButton book={book} rental={rental} availableCopies={availableCopies} />
            {isBorrowed && readUrl ? (
              <a
                href={readUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full rounded-lg px-6 py-3 text-center text-sm font-medium"
                style={{ background: "rgba(201,168,76,0.1)", color: "var(--accent-gold)", border: "1px solid var(--accent-gold-dim)" }}
              >
                📖 Read Now
              </a>
            ) : readUrl ? (
              <p className="text-center text-xs" style={{ color: "var(--text-muted)" }}>Borrow to unlock reading access</p>
            ) : null}
          </div>
        </div>

        <div className="md:col-span-2 lg:col-span-3">
          <div className="fade-in">
            <div className="mb-6">
              <h1 className="font-display mb-3 text-3xl font-bold leading-tight md:text-4xl">{book.title}</h1>
              <p className="text-lg" style={{ color: "var(--text-secondary)" }}>
                by <span style={{ color: "var(--accent-gold-light)" }}>{authors}</span>
              </p>
              {book.authors[0]?.birth_year && (
                <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
                  {book.authors[0].birth_year}{book.authors[0].death_year ? ` – ${book.authors[0].death_year}` : ""}
                </p>
              )}
            </div>

            <div className="deco-line mb-6" />

            <div className="mb-8 flex flex-wrap gap-6">
              {[
                ["Downloads", book.download_count.toLocaleString()],
                ["Language", (book.languages[0] ?? "EN").toUpperCase()],
                ["Copyright", book.copyright ? "Copyrighted" : "Public Domain"],
                ["Gutenberg ID", `#${book.id}`],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="mb-1 text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{label}</p>
                  <p className="font-semibold">{value}</p>
                </div>
              ))}
            </div>

            <section className="mb-8">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Summary</h2>
              {summaries.length ? summaries.slice(0, 2).map((summary, index) => (
                <p key={`${book.id}-summary-${index}`} className="mb-3 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{summary}</p>
              )) : (
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>No summary is available for this title yet.</p>
              )}
            </section>

            {subjects.length > 0 && (
              <section className="mb-8">
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Subjects</h2>
                <div className="flex flex-wrap gap-2">
                  {subjects.map((subject) => (
                    <span
                      key={subject}
                      className="rounded-full px-3 py-1 text-xs"
                      style={{ background: "var(--bg-card)", color: "var(--text-secondary)", border: "1px solid var(--border-medium)" }}
                    >
                      {subject.length > 50 ? `${subject.slice(0, 50)}…` : subject}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {bookshelves.length > 0 && (
              <section className="mb-8">
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Bookshelves</h2>
                <div className="flex flex-wrap gap-2">
                  {bookshelves.map((shelf) => (
                    <span
                      key={shelf}
                      className="rounded-full px-3 py-1 text-xs"
                      style={{ background: "rgba(201,168,76,0.08)", color: "var(--accent-gold)", border: "1px solid rgba(201,168,76,0.2)" }}
                    >
                      {shelf}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {!isBorrowed && availableCopies <= 0 && (
              <div className="mb-6 rounded-xl p-4" style={{ background: "rgba(139,58,58,0.1)", border: "1px solid rgba(139,58,58,0.3)" }}>
                <p className="mb-1 text-sm font-semibold" style={{ color: "#e07878" }}>No copies available</p>
                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>All copies are currently borrowed. Check back later.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
