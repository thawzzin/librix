import CatalogResults from "@/components/CatalogResults";
import SearchBar from "@/components/SearchBar";
import Link from "next/link";
import { connection } from "next/server";
import { browseBooks } from "@/lib/gutendex";
import { getActiveRentals } from "@/lib/library-service";

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

interface BooksPageProps {
  searchParams: Promise<{
    search?: string | string[];
    topic?: string | string[];
    page?: string | string[];
  }>;
}

function firstValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export default async function BooksPage({ searchParams }: BooksPageProps) {
  await connection();
  const params = await searchParams;
  const search = firstValue(params.search).trim();
  const topic = firstValue(params.topic).trim();
  const requestedPage = Number.parseInt(firstValue(params.page) || "1", 10);
  const page = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  const [data, activeRentals] = await Promise.all([
    browseBooks({ search, topic, page }),
    getActiveRentals(),
  ]);

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

      <CatalogResults
        initialData={data}
        rentals={activeRentals}
        search={search}
        topic={topic}
        page={page}
      />
    </div>
  );
}
