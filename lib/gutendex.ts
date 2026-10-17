import "server-only";

import { z } from "zod";
import type { GutendexBook, GutendexResponse } from "@/types/gutendex";

const personSchema = z.object({
  name: z.string(),
  birth_year: z.number().nullable().default(null),
  death_year: z.number().nullable().default(null),
});

const bookSchema = z
  .object({
    id: z.number().int(),
    title: z.string(),
    authors: z.array(personSchema).default([]),
    translators: z.array(personSchema).default([]),
    subjects: z.array(z.string()).default([]),
    bookshelves: z.array(z.string()).default([]),
    languages: z.array(z.string()).default([]),
    copyright: z.boolean().nullable().default(null),
    media_type: z.string().default("Text"),
    formats: z.record(z.string(), z.string()).default({}),
    download_count: z.number().default(0),
    summaries: z.array(z.string()).optional(),
  })
  .passthrough();

const responseSchema = z.object({
  count: z.number().int().nonnegative(),
  next: z.string().nullable(),
  previous: z.string().nullable(),
  results: z.array(bookSchema),
});

const EMPTY_RESPONSE: GutendexResponse = {
  count: 0,
  next: null,
  previous: null,
  results: [],
};

export interface BrowseBooksOptions {
  search?: string;
  topic?: string;
  page?: number;
  revalidate?: number;
}

export async function browseBooks({
  search = "",
  topic = "",
  page = 1,
  revalidate = 300,
}: BrowseBooksOptions = {}): Promise<GutendexResponse> {
  const url = new URL("https://gutendex.com/books/");
  url.searchParams.set("languages", "en");
  url.searchParams.set("page", String(page));

  if (search) url.searchParams.set("search", search);
  if (topic) url.searchParams.set("topic", topic);
  if (!search && !topic) url.searchParams.set("mime_type", "image/jpeg");

  try {
    const response = await fetch(url, {
      next: { revalidate },
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) return EMPTY_RESPONSE;

    const parsed = responseSchema.safeParse(await response.json());
    return parsed.success ? parsed.data : EMPTY_RESPONSE;
  } catch {
    return EMPTY_RESPONSE;
  }
}

export async function getBookById(id: string): Promise<GutendexBook | null> {
  try {
    const response = await fetch(`https://gutendex.com/books/${id}`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) return null;

    const parsed = bookSchema.safeParse(await response.json());
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export async function getFeaturedBooks(): Promise<GutendexBook[]> {
  const data = await browseBooks({ revalidate: 3600 });
  return data.results.slice(0, 12);
}

export async function getClassicBooks(): Promise<GutendexBook[]> {
  const data = await browseBooks({ topic: "fiction", revalidate: 3600 });
  return data.results.slice(0, 6);
}
