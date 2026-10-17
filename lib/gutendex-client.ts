import { bookSchema, responseSchema } from "@/lib/gutendex-schema";
import type { GutendexBook, GutendexBrowseResult } from "@/types/gutendex";

interface BrowserBrowseOptions {
  search: string;
  topic: string;
  page: number;
}

export async function getBookByIdInBrowser(id: string): Promise<GutendexBook> {
  const response = await fetch(`https://gutendex.com/books/${encodeURIComponent(id)}`, {
    signal: AbortSignal.timeout(12_000),
  });
  if (!response.ok) throw new Error(`Gutendex returned HTTP ${response.status}`);
  return bookSchema.parse(await response.json());
}

export async function browseBooksInBrowser({
  search,
  topic,
  page,
}: BrowserBrowseOptions): Promise<GutendexBrowseResult> {
  const url = new URL("https://gutendex.com/books/");
  url.searchParams.set("languages", "en");
  url.searchParams.set("page", String(page));

  if (search) url.searchParams.set("search", search);
  if (topic) url.searchParams.set("topic", topic);
  if (!search && !topic) url.searchParams.set("mime_type", "image/jpeg");

  const response = await fetch(url, { signal: AbortSignal.timeout(12_000) });
  if (!response.ok) throw new Error(`Gutendex returned HTTP ${response.status}`);

  return {
    ...responseSchema.parse(await response.json()),
    unavailable: false,
  };
}
