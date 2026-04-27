import { NextResponse } from "next/server";
import { getAllRentalsWithBooks } from "@/lib/db";

export async function GET() {
  try {
    const rentals = await getAllRentalsWithBooks();
    return NextResponse.json({ success: true, rentals });
  } catch (error) {
    console.error("Library error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
