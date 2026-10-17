import { describe, expect, it } from "vitest";
import {
  borrowBookRequestSchema,
  returnBookRequestSchema,
} from "@/lib/api-schemas";

describe("API request schemas", () => {
  it("normalizes numeric Gutendex identifiers", () => {
    expect(
      borrowBookRequestSchema.parse({
        gutendexId: 1342,
        title: "Pride and Prejudice",
        author: "Jane Austen",
      }),
    ).toMatchObject({
      gutendexId: "1342",
      coverImage: null,
      formats: {},
    });
  });

  it("rejects an empty rental identifier", () => {
    expect(() => returnBookRequestSchema.parse({ rentalId: "  " })).toThrow();
  });
});
