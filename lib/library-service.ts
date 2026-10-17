import "server-only";

import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type {
  BookFormats,
  BookRecord,
  BorrowBookInput,
  RentalDto,
  RentalRecord,
  RentalStatus,
  RentalWithBook,
  RentalWithBookDto,
} from "@/types/library";

export const MAX_BORROW_LIMIT = 3;
export const LOAN_PERIOD_DAYS = 7;

const MAX_TRANSACTION_ATTEMPTS = 3;

export type LibraryErrorCode =
  | "BORROW_LIMIT_REACHED"
  | "ALREADY_BORROWED"
  | "NO_COPIES_AVAILABLE"
  | "RENTAL_NOT_FOUND"
  | "ALREADY_RETURNED";

export class LibraryError extends Error {
  constructor(
    public readonly code: LibraryErrorCode,
    message: string,
    public readonly status = 400,
  ) {
    super(message);
    this.name = "LibraryError";
  }
}

function createId(prefix: "book" | "rental"): string {
  return `${prefix}_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;
}

function isRentalStatus(status: string): status is RentalStatus {
  return status === "BORROWED" || status === "RETURNED";
}

function formatsFromJson(value: Prisma.JsonValue): BookFormats {
  if (!value || Array.isArray(value) || typeof value !== "object") return {};

  return Object.fromEntries(
    Object.entries(value).filter(
      (entry): entry is [string, string] => typeof entry[1] === "string",
    ),
  );
}

function toBookRecord(book: {
  id: string;
  gutendexId: string;
  title: string;
  author: string;
  coverImage: string | null;
  formats: Prisma.JsonValue;
  totalCopies: number;
  availableCopies: number;
  createdAt: Date;
}): BookRecord {
  return { ...book, formats: formatsFromJson(book.formats) };
}

function toRentalRecord(rental: {
  id: string;
  bookId: string | null;
  gutendexId: string;
  borrowedAt: Date;
  dueDate: Date;
  returnedAt: Date | null;
  status: string;
}): RentalRecord {
  if (!isRentalStatus(rental.status)) {
    throw new Error(`Unsupported rental status: ${rental.status}`);
  }
  return { ...rental, status: rental.status };
}

function isRetryableTransactionError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2034"
  );
}

async function withSerializableRetry<T>(
  operation: () => Promise<T>,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_TRANSACTION_ATTEMPTS; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (!isRetryableTransactionError(error) || attempt === MAX_TRANSACTION_ATTEMPTS) {
        throw error;
      }
    }
  }

  throw lastError;
}

export async function getBook(gutendexId: string): Promise<BookRecord | null> {
  const book = await prisma.book.findUnique({ where: { gutendexId } });
  return book ? toBookRecord(book) : null;
}

export async function getActiveRentals(): Promise<RentalRecord[]> {
  const rentals = await prisma.rental.findMany({
    where: { status: "BORROWED" },
    orderBy: { borrowedAt: "desc" },
  });
  return rentals.map(toRentalRecord);
}

export async function getRentalByBookId(
  gutendexId: string,
): Promise<RentalRecord | null> {
  const rental = await prisma.rental.findFirst({
    where: { gutendexId, status: "BORROWED" },
    orderBy: { borrowedAt: "desc" },
  });
  return rental ? toRentalRecord(rental) : null;
}

export async function getAllRentalsWithBooks(): Promise<RentalWithBook[]> {
  const rentals = await prisma.rental.findMany({
    include: { book: true },
    orderBy: { borrowedAt: "desc" },
  });
  const now = Date.now();

  return rentals.map((row) => {
    const rental = toRentalRecord(row);
    return {
      ...rental,
      book: row.book ? toBookRecord(row.book) : null,
      isOverdue:
        rental.status === "BORROWED" && rental.dueDate.getTime() < now,
    };
  });
}

export async function borrowBook(input: BorrowBookInput): Promise<RentalRecord> {
  return withSerializableRetry(() =>
    prisma.$transaction(
      async (tx) => {
        const [activeCount, existingRental] = await Promise.all([
          tx.rental.count({ where: { status: "BORROWED" } }),
          tx.rental.findFirst({
            where: { gutendexId: input.gutendexId, status: "BORROWED" },
          }),
        ]);

        if (activeCount >= MAX_BORROW_LIMIT) {
          throw new LibraryError(
            "BORROW_LIMIT_REACHED",
            `Borrow limit reached. You can have at most ${MAX_BORROW_LIMIT} books at a time.`,
          );
        }

        if (existingRental) {
          throw new LibraryError(
            "ALREADY_BORROWED",
            "You already have this book borrowed.",
          );
        }

        const copies = Math.floor(Math.random() * 4) + 2;
        const book = await tx.book.upsert({
          where: { gutendexId: input.gutendexId },
          create: {
            id: createId("book"),
            ...input,
            formats: input.formats,
            totalCopies: copies,
            availableCopies: copies,
          },
          update: {
            title: input.title,
            author: input.author,
            coverImage: input.coverImage,
            formats: input.formats,
          },
        });

        const decrement = await tx.book.updateMany({
          where: { id: book.id, availableCopies: { gt: 0 } },
          data: { availableCopies: { decrement: 1 } },
        });

        if (decrement.count !== 1) {
          throw new LibraryError(
            "NO_COPIES_AVAILABLE",
            "No copies available at this time.",
          );
        }

        const borrowedAt = new Date();
        const dueDate = new Date(borrowedAt);
        dueDate.setDate(dueDate.getDate() + LOAN_PERIOD_DAYS);

        const rental = await tx.rental.create({
          data: {
            id: createId("rental"),
            bookId: book.id,
            gutendexId: input.gutendexId,
            borrowedAt,
            dueDate,
            status: "BORROWED",
          },
        });

        return toRentalRecord(rental);
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    ),
  );
}

export async function returnBook(rentalId: string): Promise<RentalRecord> {
  return withSerializableRetry(() =>
    prisma.$transaction(
      async (tx) => {
        const rental = await tx.rental.findUnique({ where: { id: rentalId } });

        if (!rental) {
          throw new LibraryError(
            "RENTAL_NOT_FOUND",
            "Rental not found",
            404,
          );
        }
        if (rental.status === "RETURNED") {
          throw new LibraryError(
            "ALREADY_RETURNED",
            "Book already returned",
          );
        }

        const book = rental.bookId
          ? await tx.book.findUnique({ where: { id: rental.bookId } })
          : await tx.book.findUnique({
              where: { gutendexId: rental.gutendexId },
            });

        const updated = await tx.rental.update({
          where: { id: rental.id },
          data: { status: "RETURNED", returnedAt: new Date() },
        });

        if (book && book.availableCopies < book.totalCopies) {
          await tx.book.update({
            where: { id: book.id },
            data: { availableCopies: { increment: 1 } },
          });
        }

        return toRentalRecord(updated);
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    ),
  );
}

export function toRentalDto(rental: RentalRecord): RentalDto {
  return {
    ...rental,
    borrowedAt: rental.borrowedAt.toISOString(),
    dueDate: rental.dueDate.toISOString(),
    returnedAt: rental.returnedAt?.toISOString() ?? null,
  };
}

export function toRentalWithBookDto(
  rental: RentalWithBook,
): RentalWithBookDto {
  return {
    ...toRentalDto(rental),
    isOverdue: rental.isOverdue,
    book: rental.book
      ? { ...rental.book, createdAt: rental.book.createdAt.toISOString() }
      : null,
  };
}
