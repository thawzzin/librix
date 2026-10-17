export const RENTAL_STATUSES = ["BORROWED", "RETURNED"] as const;

export type RentalStatus = (typeof RENTAL_STATUSES)[number];

export type BookFormats = Record<string, string>;

export interface BookRecord {
  id: string;
  gutendexId: string;
  title: string;
  author: string;
  coverImage: string | null;
  formats: BookFormats;
  totalCopies: number;
  availableCopies: number;
  createdAt: Date;
}

export interface RentalRecord {
  id: string;
  bookId: string | null;
  gutendexId: string;
  borrowedAt: Date;
  dueDate: Date;
  returnedAt: Date | null;
  status: RentalStatus;
}

export interface RentalWithBook extends RentalRecord {
  book: BookRecord | null;
  isOverdue: boolean;
}

export interface RentalDto
  extends Omit<RentalRecord, "borrowedAt" | "dueDate" | "returnedAt"> {
  borrowedAt: string;
  dueDate: string;
  returnedAt: string | null;
}

export interface RentalWithBookDto
  extends Omit<
    RentalWithBook,
    "borrowedAt" | "dueDate" | "returnedAt" | "book"
  > {
  borrowedAt: string;
  dueDate: string;
  returnedAt: string | null;
  book: (Omit<BookRecord, "createdAt"> & { createdAt: string }) | null;
}

export interface BorrowBookInput {
  gutendexId: string;
  title: string;
  author: string;
  coverImage: string | null;
  formats: BookFormats;
}

export interface ReturnBookInput {
  rentalId: string;
}

export type ApiSuccess<T> = { success: true } & T;
export type ApiFailure = { success: false; error: string };
export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;
