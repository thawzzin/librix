import { afterEach, describe, expect, it, vi } from "vitest";
import { browseBooks, getBookById } from "@/lib/gutendex";
import { browseBooksInBrowser } from "@/lib/gutendex-client";

const book = {
  id: 1342,
  title: "Pride and Prejudice",
  authors: [],
  translators: [],
  subjects: [],
  bookshelves: [],
  languages: ["en"],
  copyright: false,
  media_type: "Text",
  formats: {},
  download_count: 1,
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  delete process.env.GUTENDEX_API_URL;
});

describe("Gutendex server client", () => {
  it("returns validated books and sends explicit API headers", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({ count: 1, next: null, previous: null, results: [book] }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await browseBooks();

    expect(result).toMatchObject({ count: 1, unavailable: false });
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({
      headers: {
        Accept: "application/json",
        "User-Agent": "Librix/1.0 (+https://librixapp.vercel.app)",
      },
    });
  });

  it("retries a forbidden response and reports an upstream outage", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 403 }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await browseBooks();

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result).toEqual({
      count: 0,
      next: null,
      previous: null,
      results: [],
      unavailable: true,
    });
  });

  it("uses the configured server-side API base URL", async () => {
    process.env.GUTENDEX_API_URL = "https://catalog.example.test/api";
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(book), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await getBookById("1342");

    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      "https://catalog.example.test/api/books/1342",
    );
  });
});

describe("Gutendex browser fallback", () => {
  it("fetches and validates the catalog directly from the public API", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({ count: 1, next: null, previous: null, results: [book] }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await browseBooksInBrowser({
      search: "pride",
      topic: "fiction",
      page: 2,
    });

    const requestedUrl = new URL(String(fetchMock.mock.calls[0]?.[0]));
    expect(requestedUrl.origin).toBe("https://gutendex.com");
    expect(requestedUrl.searchParams.get("search")).toBe("pride");
    expect(requestedUrl.searchParams.get("topic")).toBe("fiction");
    expect(requestedUrl.searchParams.get("page")).toBe("2");
    expect(result).toMatchObject({ count: 1, unavailable: false });
  });
});
