"use client";

import { useQuery } from "@tanstack/react-query";
import BookCard from "@/components/BookCard";
import { browseBooksInBrowser } from "@/lib/gutendex-client";
import type { GutendexBook } from "@/types/gutendex";

export default function FeaturedBooks({ initialBooks }: { initialBooks: GutendexBook[] }) {
  const needsFallback = initialBooks.length === 0;
  const query = useQuery({
    queryKey: ["gutendex", "browser-fallback", "featured"],
    queryFn: () => browseBooksInBrowser({ search: "", topic: "", page: 1 }),
    enabled: needsFallback,
    staleTime: 60 * 60 * 1000,
    retry: 1,
  });
  const books = needsFallback ? query.data?.results.slice(0, 12) : initialBooks;

  if (needsFallback && query.isPending) {
    return (
      <p className="py-16 text-center text-sm" role="status" style={{ color: "var(--text-muted)" }}>
        Loading featured books…
      </p>
    );
  }

  if (!books?.length) {
    return (
      <div className="py-16 text-center">
        <p style={{ color: "var(--text-muted)" }}>
          Unable to load books. Please check your connection.
        </p>
        <button
          type="button"
          onClick={() => query.refetch()}
          className="btn-gold mt-4 cursor-pointer rounded-lg px-5 py-2 text-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="stagger-children grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {books.map((book) => <BookCard key={book.id} book={book} />)}
    </div>
  );
}
