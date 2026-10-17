import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  transaction: vi.fn(),
  rentalCount: vi.fn(),
  rentalFindFirst: vi.fn(),
  rentalFindUnique: vi.fn(),
  rentalCreate: vi.fn(),
  rentalUpdate: vi.fn(),
  bookUpsert: vi.fn(),
  bookUpdateMany: vi.fn(),
  bookFindUnique: vi.fn(),
  bookUpdate: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: { $transaction: mocks.transaction },
}));

import { borrowBook, returnBook } from "@/lib/library-service";

const now = new Date("2026-10-17T00:00:00.000Z");

const transactionClient = {
  rental: {
    count: mocks.rentalCount,
    findFirst: mocks.rentalFindFirst,
    findUnique: mocks.rentalFindUnique,
    create: mocks.rentalCreate,
    update: mocks.rentalUpdate,
  },
  book: {
    upsert: mocks.bookUpsert,
    updateMany: mocks.bookUpdateMany,
    findUnique: mocks.bookFindUnique,
    update: mocks.bookUpdate,
  },
};

describe("library transactions", () => {
  beforeEach(() => {
    mocks.transaction.mockImplementation(
      async (callback: (tx: typeof transactionClient) => Promise<unknown>) =>
        callback(transactionClient),
    );
  });

  it("creates a rental only after reserving a copy", async () => {
    mocks.rentalCount.mockResolvedValue(0);
    mocks.rentalFindFirst.mockResolvedValue(null);
    mocks.bookUpsert.mockResolvedValue({ id: "book-1", availableCopies: 2 });
    mocks.bookUpdateMany.mockResolvedValue({ count: 1 });
    mocks.rentalCreate.mockResolvedValue({
      id: "rental-1",
      bookId: "book-1",
      gutendexId: "1342",
      borrowedAt: now,
      dueDate: new Date("2026-10-24T00:00:00.000Z"),
      returnedAt: null,
      status: "BORROWED",
    });

    const rental = await borrowBook({
      gutendexId: "1342",
      title: "Pride and Prejudice",
      author: "Jane Austen",
      coverImage: null,
      formats: {},
    });

    expect(mocks.bookUpdateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "book-1", availableCopies: { gt: 0 } },
      }),
    );
    expect(rental.status).toBe("BORROWED");
  });

  it("rejects a fourth active rental before touching a book", async () => {
    mocks.rentalCount.mockResolvedValue(3);
    mocks.rentalFindFirst.mockResolvedValue(null);

    await expect(
      borrowBook({
        gutendexId: "84",
        title: "Frankenstein",
        author: "Mary Shelley",
        coverImage: null,
        formats: {},
      }),
    ).rejects.toMatchObject({
      code: "BORROW_LIMIT_REACHED",
    });
    expect(mocks.bookUpsert).not.toHaveBeenCalled();
  });

  it("rejects borrowing the same book twice", async () => {
    mocks.rentalCount.mockResolvedValue(1);
    mocks.rentalFindFirst.mockResolvedValue({ id: "existing-rental" });

    await expect(
      borrowBook({
        gutendexId: "1342",
        title: "Pride and Prejudice",
        author: "Jane Austen",
        coverImage: null,
        formats: {},
      }),
    ).rejects.toMatchObject({ code: "ALREADY_BORROWED" });
    expect(mocks.bookUpsert).not.toHaveBeenCalled();
  });

  it("fails the transaction when no copy can be reserved", async () => {
    mocks.rentalCount.mockResolvedValue(0);
    mocks.rentalFindFirst.mockResolvedValue(null);
    mocks.bookUpsert.mockResolvedValue({ id: "book-1", availableCopies: 0 });
    mocks.bookUpdateMany.mockResolvedValue({ count: 0 });

    await expect(
      borrowBook({
        gutendexId: "84",
        title: "Frankenstein",
        author: "Mary Shelley",
        coverImage: null,
        formats: {},
      }),
    ).rejects.toMatchObject({
      code: "NO_COPIES_AVAILABLE",
    });
    expect(mocks.rentalCreate).not.toHaveBeenCalled();
  });

  it("returns a rental and restores one copy without exceeding capacity", async () => {
    mocks.rentalFindUnique.mockResolvedValue({
      id: "rental-1",
      bookId: "book-1",
      gutendexId: "1342",
      borrowedAt: now,
      dueDate: new Date("2026-10-24T00:00:00.000Z"),
      returnedAt: null,
      status: "BORROWED",
    });
    mocks.bookFindUnique.mockResolvedValue({
      id: "book-1",
      availableCopies: 1,
      totalCopies: 2,
    });
    mocks.rentalUpdate.mockResolvedValue({
      id: "rental-1",
      bookId: "book-1",
      gutendexId: "1342",
      borrowedAt: now,
      dueDate: new Date("2026-10-24T00:00:00.000Z"),
      returnedAt: now,
      status: "RETURNED",
    });

    const rental = await returnBook("rental-1");

    expect(mocks.bookUpdate).toHaveBeenCalledWith({
      where: { id: "book-1" },
      data: { availableCopies: { increment: 1 } },
    });
    expect(rental.status).toBe("RETURNED");
  });

  it("rejects an unknown rental", async () => {
    mocks.rentalFindUnique.mockResolvedValue(null);

    await expect(returnBook("missing")).rejects.toMatchObject({
      code: "RENTAL_NOT_FOUND",
      status: 404,
    });
    expect(mocks.rentalUpdate).not.toHaveBeenCalled();
  });

  it("does not return a rental twice", async () => {
    mocks.rentalFindUnique.mockResolvedValue({
      id: "rental-1",
      status: "RETURNED",
    });

    await expect(returnBook("rental-1")).rejects.toMatchObject({
      code: "ALREADY_RETURNED",
    });
    expect(mocks.rentalUpdate).not.toHaveBeenCalled();
  });
});
