import Link from "next/link";
import Image from "next/image";
import StatusBadge from "@/components/StatusBadge";
import { getAllRentalsWithBooks } from "@/lib/db";
import ReturnButton from "./ReturnButton";

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getDaysLeft(dueDate) {
  const diff = new Date(dueDate) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default async function LibraryPage() {
  const allRentals = await getAllRentalsWithBooks();
  const activeRentals = allRentals.filter((r) => r.status === "BORROWED");
  const returnedRentals = allRentals.filter((r) => r.status === "RETURNED");
  const overdueCount = activeRentals.filter((r) => r.isOverdue).length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1
          className="font-display text-4xl font-bold mb-2"
          style={{ color: "var(--text-primary)" }}
        >
          My Library
        </h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          {activeRentals.length} of 3 borrow slots used
          {overdueCount > 0 && (
            <span className="ml-2 badge-overdue" style={{ color: "#e07878" }}>
              · {overdueCount} overdue
            </span>
          )}
        </p>
      </div>

      {/* Borrow limit indicator */}
      <div
        className="rounded-xl p-4 mb-8"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <span
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: "var(--text-muted)" }}
          >
            Borrow Capacity
          </span>
          <span
            className="text-xs font-semibold"
            style={{
              color:
                activeRentals.length >= 3 ? "#e07878" : "var(--accent-gold)",
            }}
          >
            {activeRentals.length} / 3
          </span>
        </div>
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="flex-1 h-1.5 rounded-full"
              style={{
                background:
                  i < activeRentals.length
                    ? activeRentals[i]?.isOverdue
                      ? "#8b3a3a"
                      : "var(--accent-gold)"
                    : "var(--border-medium)",
              }}
            />
          ))}
        </div>
      </div>

      {/* Active Borrows */}
      <section className="mb-12">
        <h2
          className="font-display text-2xl font-semibold mb-6"
          style={{ color: "var(--text-primary)" }}
        >
          Currently Borrowed
        </h2>

        {activeRentals.length === 0 ? (
          <div
            className="rounded-xl py-16 text-center"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <div className="text-5xl mb-4">📚</div>
            <h3
              className="font-display text-lg font-semibold mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              No books borrowed yet
            </h3>
            <p
              className="text-sm mb-6"
              style={{ color: "var(--text-secondary)" }}
            >
              Browse our collection and borrow up to 3 books at a time.
            </p>
            <Link
              href="/books"
              className="btn-gold px-6 py-2.5 rounded-lg text-sm font-medium"
            >
              Browse Books
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {activeRentals.map((rental) => {
              const daysLeft = getDaysLeft(rental.dueDate);
              const coverUrl =
                rental.book?.coverImage ||
                `https://www.gutenberg.org/cache/epub/${rental.gutendexId}/pg${rental.gutendexId}.cover.medium.jpg`;

              return (
                <div
                  key={rental.id}
                  className="rounded-xl overflow-hidden flex"
                  style={{
                    background: "var(--bg-card)",
                    border: `1px solid ${rental.isOverdue ? "rgba(139,58,58,0.5)" : "var(--border-subtle)"}`,
                  }}
                >
                  {/* Cover thumbnail */}
                  <Link
                    href={`/books/${rental.gutendexId}`}
                    className="shrink-0"
                  >
                    <div
                      className="w-20 sm:w-24 h-full relative"
                      style={{ minHeight: "120px" }}
                    >
                      <Image
                        src={coverUrl}
                        alt={rental.book?.title}
                        fill
                        sizes="(max-width: 640px) 80px, 96px"
                        className="w-full h-full object-cover"
                      />
                      <div
                        className="absolute inset-0 items-center justify-center"
                        style={{
                          background: "linear-gradient(135deg,#1e1a15,#2a221a)",
                          display: "none",
                        }}
                      >
                        <span className="text-2xl">📖</span>
                      </div>
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="flex-1 p-4 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="min-w-0">
                        <Link href={`/books/${rental.gutendexId}`}>
                          <h3
                            className="font-display font-semibold text-sm leading-tight line-clamp-2 hover:opacity-80 transition-opacity"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {rental.book?.title || "Unknown Title"}
                          </h3>
                        </Link>
                        <p
                          className="text-xs mt-0.5 truncate"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {rental.book?.author || ""}
                        </p>
                      </div>
                      <StatusBadge
                        status={rental.isOverdue ? "OVERDUE" : "BORROWED"}
                      />
                    </div>

                    <div
                      className="flex flex-wrap gap-x-6 gap-y-1 text-xs mb-3"
                      style={{ color: "var(--text-muted)" }}
                    >
                      <span>Borrowed {formatDate(rental.borrowedAt)}</span>
                      <span
                        style={{
                          color: rental.isOverdue
                            ? "#e07878"
                            : daysLeft <= 2
                              ? "#e09050"
                              : "var(--text-muted)",
                        }}
                      >
                        Due {formatDate(rental.dueDate)}
                        {rental.isOverdue
                          ? " (Overdue!)"
                          : ` · ${daysLeft} day${daysLeft !== 1 ? "s" : ""} left`}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <ReturnButton rentalId={rental.id} />
                      {rental.book?.formats?.["text/html"] && (
                        <a
                          href={rental.book.formats?.["text/html"]}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-medium transition-colors"
                          style={{ color: "var(--accent-gold)" }}
                        >
                          Read →
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* History */}
      {returnedRentals.length > 0 && (
        <section>
          <h2
            className="font-display text-2xl font-semibold mb-6"
            style={{ color: "var(--text-primary)" }}
          >
            Reading History
          </h2>
          <div
            className="rounded-xl overflow-hidden"
            style={{ border: "1px solid var(--border-subtle)" }}
          >
            {returnedRentals.map((rental, i) => {
              const coverUrl =
                rental.book?.coverImage ||
                `https://www.gutenberg.org/cache/epub/${rental.gutendexId}/pg${rental.gutendexId}.cover.medium.jpg`;

              return (
                <div
                  key={rental.id}
                  className="flex items-center gap-4 p-4"
                  style={{
                    background: "var(--bg-card)",
                    borderBottom:
                      i < returnedRentals.length - 1
                        ? "1px solid var(--border-subtle)"
                        : "none",
                    opacity: 0.7,
                  }}
                >
                  <div className="w-10 h-12 rounded overflow-hidden shrink-0">
                    <Image
                      src={coverUrl}
                      alt=""
                      width={40}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/books/${rental.gutendexId}`}>
                      <p
                        className="text-sm font-medium truncate"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {rental.book?.title || "Unknown"}
                      </p>
                    </Link>
                    <p
                      className="text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Returned{" "}
                      {rental.returnedAt ? formatDate(rental.returnedAt) : ""}
                    </p>
                  </div>
                  <StatusBadge status="RETURNED" />
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
