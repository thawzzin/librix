"use client";

import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import BorrowButton from "@/components/BorrowButton";
import { getBookByIdInBrowser } from "@/lib/gutendex-client";
import type { BookRecord, RentalRecord } from "@/types/library";

interface BookDetailFallbackProps {
  id: string;
  localBook: BookRecord | null;
  rental: RentalRecord | null;
}

export default function BookDetailFallback({ id, localBook, rental }: BookDetailFallbackProps) {
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
  const coverUrl = book.formats["image/jpeg"] ??
    `https://www.gutenberg.org/cache/epub/${book.id}/pg${book.id}.cover.medium.jpg`;
  const authors = book.authors.map((author) => author.name).join(", ") || "Unknown Author";
  const summary = book.summaries?.find((item) => item.trim().length > 0);
  const availableCopies = localBook?.availableCopies ?? 3;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
        <Link href="/books">Browse</Link><span>›</span><span>{book.title}</span>
      </div>
      <div className="grid gap-10 md:grid-cols-3 lg:grid-cols-4">
        <div>
          <div className="relative mb-6 aspect-[5/7] overflow-hidden rounded-xl">
            <Image src={coverUrl} alt={book.title} fill className="object-cover" />
          </div>
          <BorrowButton book={book} rental={rental} availableCopies={availableCopies} />
        </div>
        <div className="md:col-span-2 lg:col-span-3">
          <h1 className="font-display mb-3 text-3xl font-bold md:text-4xl">{book.title}</h1>
          <p className="mb-8 text-lg" style={{ color: "var(--accent-gold-light)" }}>by {authors}</p>
          <div className="mb-8 flex flex-wrap gap-8 text-sm">
            <span>{book.download_count.toLocaleString()} downloads</span>
            <span className="uppercase">{book.languages[0] ?? "en"}</span>
            <span>{book.copyright ? "Copyrighted" : "Public Domain"}</span>
          </div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Summary</h2>
          <p className="mb-8 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            {summary ?? "No summary is available for this title yet."}
          </p>
          <div className="flex flex-wrap gap-2">
            {book.subjects.slice(0, 8).map((subject) => (
              <span key={subject} className="rounded-full border px-3 py-1 text-xs" style={{ borderColor: "var(--border-medium)" }}>
                {subject.length > 50 ? `${subject.slice(0, 50)}…` : subject}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
