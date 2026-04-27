import { NextResponse } from "next/server";
import { returnRental, incrementCopies, getRentals } from "@/lib/db";

export async function POST(request) {
  try {
    const { rentalId } = await request.json();

    if (!rentalId) {
      return NextResponse.json(
        { success: false, error: "Rental ID is required" },
        { status: 400 },
      );
    }

    // Find rental to get gutendexId
    const rentals = await getRentals();
    const rental = rentals.find((r) => r.id === rentalId);
    if (!rental) {
      return NextResponse.json(
        { success: false, error: "Rental not found" },
        { status: 404 },
      );
    }
    if (rental.status === "RETURNED") {
      return NextResponse.json(
        { success: false, error: "Book already returned" },
        { status: 400 },
      );
    }

    const updated = await returnRental(rentalId);
    await incrementCopies(rental.gutendexId);

    return NextResponse.json({ success: true, rental: updated });
  } catch (error) {
    console.error("Return error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
