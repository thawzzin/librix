import { NextResponse } from "next/server";
import {
  getBook,
  upsertBook,
  decrementCopies,
  getActiveRentals,
  getRentalByBookId,
  createRental,
} from "@/lib/db";

const MAX_BORROW_LIMIT = 3;

export async function POST(request) {
  try {
    const body = await request.json();
    const { gutendexId, title, author, coverImage, formats } = body;

    if (!gutendexId) {
      return NextResponse.json(
        { success: false, error: "Book ID is required" },
        { status: 400 },
      );
    }

    // Check borrow limit
    const activeRentals = await getActiveRentals();
    if (activeRentals.length >= MAX_BORROW_LIMIT) {
      return NextResponse.json(
        {
          success: false,
          error: `Borrow limit reached. You can have at most ${MAX_BORROW_LIMIT} books at a time.`,
        },
        { status: 400 },
      );
    }

    // Check if already borrowed
    const existingRental = await getRentalByBookId(gutendexId);
    if (existingRental) {
      return NextResponse.json(
        { success: false, error: "You already have this book borrowed." },
        { status: 400 },
      );
    }

    // Upsert book record
    const bookRecord = await upsertBook({
      gutendexId,
      title,
      author,
      coverImage,
      formats,
    });

    // Check availability
    if (bookRecord.availableCopies <= 0) {
      return NextResponse.json(
        { success: false, error: "No copies available at this time." },
        { status: 400 },
      );
    }

    // Decrement copies
    const decremented = await decrementCopies(gutendexId);
    if (!decremented) {
      return NextResponse.json(
        { success: false, error: "No copies available at this time." },
        { status: 400 },
      );
    }

    // Create rental
    const rental = await createRental(gutendexId, bookRecord.id);

    return NextResponse.json({ success: true, rental });
  } catch (error) {
    console.error("Borrow error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
