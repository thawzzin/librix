"use client";
import Link from "next/link";
import Image from "next/image";
import StatusBadge from "./StatusBadge";

export default function BookCard({ book, rentalStatus }) {
  const coverUrl =
    book.formats?.["image/jpeg"] ||
    book.coverImage ||
    `https://www.gutenberg.org/cache/epub/${book.id}/pg${book.id}.cover.medium.jpg`;

  const authors = Array.isArray(book.authors)
    ? book.authors.map((a) => a.name).join(", ")
    : book.author || "Unknown Author";

  const title = book.title || "Untitled";

  return (
    <Link
      href={`/books/${book.id || book.gutendexId}`}
      className="book-card block"
    >
      <div
        className="rounded-xl overflow-hidden border"
        style={{
          background: "var(--bg-card)",
          borderColor: "var(--border-subtle)",
        }}
      >
        {/* Cover */}
        <div className="relative" style={{ paddingBottom: "140%" }}>
          <Image
            src={coverUrl}
            alt={title}
            fill
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Fallback cover */}
          <div
            className="absolute inset-0 items-center justify-center p-4 hidden"
            style={{
              background: "linear-gradient(135deg, #1e1a15, #2a221a)",
              display: "none",
            }}
          >
            <div className="text-center">
              <div className="text-4xl mb-2">📚</div>
              <p
                className="font-display text-xs leading-tight"
                style={{ color: "var(--accent-gold)" }}
              >
                {title.slice(0, 40)}
              </p>
            </div>
          </div>
          {/* Gradient overlay */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgba(30,26,21,0.95) 0%, rgba(30,26,21,0.3) 50%, transparent 100%)",
            }}
          />
          {/* Status badge */}
          {rentalStatus && (
            <div className="absolute top-2 right-2">
              <StatusBadge status={rentalStatus} />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          <h3
            className="font-display font-semibold text-sm leading-snug mb-1 line-clamp-2"
            style={{ color: "var(--text-primary)" }}
          >
            {title}
          </h3>
          <p
            className="text-xs truncate"
            style={{ color: "var(--text-secondary)" }}
          >
            {authors}
          </p>
        </div>
      </div>
    </Link>
  );
}
