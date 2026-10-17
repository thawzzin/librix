"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import BookGrid from "@/components/BookGrid";
import { browseBooksInBrowser } from "@/lib/gutendex-client";
import type { GutendexBrowseResult } from "@/types/gutendex";
import type { RentalRecord } from "@/types/library";

interface CatalogResultsProps {
  initialData: GutendexBrowseResult;
  rentals: RentalRecord[];
  search: string;
  topic: string;
  page: number;
}

function booksHref(search: string, topic: string, page?: number): string {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (topic) params.set("topic", topic);
  if (page) params.set("page", String(page));
  const query = params.toString();
  return query ? `/books?${query}` : "/books";
}

export default function CatalogResults({
  initialData,
  rentals,
  search,
  topic,
  page,
}: CatalogResultsProps) {
  const useBrowserFallback = initialData.unavailable;
  const query = useQuery<GutendexBrowseResult>({
    queryKey: ["gutendex", "browser-fallback", search, topic, page],
    queryFn: () => browseBooksInBrowser({ search, topic, page }),
    enabled: useBrowserFallback,
    initialData: useBrowserFallback ? undefined : initialData,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
  const data = query.data ?? initialData;
  const books = data.results;

  if (useBrowserFallback && query.isPending) {
    return (
      <div className="py-24 text-center" role="status">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-current border-t-transparent" />
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Loading the catalog…
        </p>
      </div>
    );
  }

  if (useBrowserFallback && query.isError) {
    return (
      <div className="py-24 text-center" role="alert">
        <div className="mb-4 text-6xl" aria-hidden="true">📚</div>
        <h3 className="font-display mb-2 text-xl font-semibold">
          Book catalog is temporarily unavailable
        </h3>
        <p className="mb-6 text-sm" style={{ color: "var(--text-secondary)" }}>
          Gutendex could not be reached. Please try again shortly.
        </p>
        <button
          type="button"
          className="btn-gold cursor-pointer rounded-lg px-6 py-2.5 text-sm"
          onClick={() => query.refetch()}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="py-24 text-center">
        <div className="mb-4 text-6xl" aria-hidden="true">🔍</div>
        <h3 className="font-display mb-2 text-xl font-semibold">No books found</h3>
        <p className="mb-6 text-sm" style={{ color: "var(--text-secondary)" }}>
          Try a different search term or browse all books.
        </p>
        <Link href="/books" className="btn-gold rounded-lg px-6 py-2.5 text-sm">
          Browse All Books
        </Link>
      </div>
    );
  }

  return (
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
            {data.count.toLocaleString()} results
          </p>
          <Link
            href="/books"
            className="rounded px-2 py-0.5 text-xs"
            style={{
              color: "var(--accent-gold)",
              border: "1px solid var(--accent-gold-dim)",
            }}
          >
            Clear
          </Link>
        </div>
      )}

      <BookGrid books={books} rentals={rentals} />

      <div className="mt-12 flex items-center justify-center gap-4">
        {data.previous && (
          <Link
            href={booksHref(search, topic, page - 1)}
            className="rounded-lg px-5 py-2 text-sm font-medium transition-all"
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
            href={booksHref(search, topic, page + 1)}
            className="rounded-lg px-5 py-2 text-sm font-medium"
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
  );
}
