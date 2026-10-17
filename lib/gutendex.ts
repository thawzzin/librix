import "server-only";

import { z } from "zod";
import type {
  GutendexBook,
  GutendexBrowseResult,
} from "@/types/gutendex";

const DEFAULT_API_URL = "https://gutendex.com";
const REQUEST_TIMEOUT_MS = 12_000;
const MAX_ATTEMPTS = 2;

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

const EMPTY_RESPONSE: GutendexBrowseResult = {
  count: 0,
  next: null,
  previous: null,
  results: [],
  unavailable: true,
};

class GutendexRequestError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "GutendexRequestError";
  }
}

function getApiUrl(path: string): URL {
  const baseUrl = process.env.GUTENDEX_API_URL || DEFAULT_API_URL;
  return new URL(path, baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`);
}

async function fetchGutendex(url: URL, revalidate: number): Promise<Response> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
          "User-Agent": "Librix/1.0 (+https://librixapp.vercel.app)",
        },
        next: { revalidate },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });

      if (response.ok || response.status === 404) return response;

      lastError = new GutendexRequestError(
        `Gutendex returned HTTP ${response.status}`,
        response.status,
      );

      if (response.status < 500 && response.status !== 403 && response.status !== 429) {
        break;
      }
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new GutendexRequestError("Gutendex request failed");
}

function reportGutendexError(operation: string, error: unknown): void {
  const details =
    error instanceof GutendexRequestError
      ? { message: error.message, status: error.status }
      : {
          message: error instanceof Error ? error.message : "Unknown error",
          name: error instanceof Error ? error.name : undefined,
        };

  console.error(`[Gutendex] ${operation} failed`, details);
}

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
}: BrowseBooksOptions = {}): Promise<GutendexBrowseResult> {
  const url = getApiUrl("books/");
  url.searchParams.set("languages", "en");
  url.searchParams.set("page", String(page));

  if (search) url.searchParams.set("search", search);
  if (topic) url.searchParams.set("topic", topic);
  if (!search && !topic) url.searchParams.set("mime_type", "image/jpeg");

  try {
    const response = await fetchGutendex(url, revalidate);
    if (!response.ok) throw new GutendexRequestError("Books were not found", 404);

    const parsed = responseSchema.safeParse(await response.json());
    if (!parsed.success) {
      throw new GutendexRequestError(
        `Gutendex response validation failed: ${z.prettifyError(parsed.error)}`,
      );
    }

    return { ...parsed.data, unavailable: false };
  } catch (error) {
    reportGutendexError("browse", error);
    return EMPTY_RESPONSE;
  }
}

export async function getBookById(id: string): Promise<GutendexBook | null> {
  try {
    const response = await fetchGutendex(getApiUrl(`books/${id}`), 3600);
    if (response.status === 404) return null;

    const parsed = bookSchema.safeParse(await response.json());
    if (!parsed.success) {
      throw new GutendexRequestError(
        `Gutendex book validation failed: ${z.prettifyError(parsed.error)}`,
      );
    }

    return parsed.data;
  } catch (error) {
    reportGutendexError(`book ${id}`, error);
    throw error;
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
