import { apiError, apiSuccess } from "@/lib/api-response";
import {
  getAllRentalsWithBooks,
  toRentalWithBookDto,
} from "@/lib/library-service";

export const runtime = "nodejs";

export async function GET() {
  try {
    const rentals = await getAllRentalsWithBooks();
    return apiSuccess({ rentals: rentals.map(toRentalWithBookDto) });
  } catch (error) {
    return apiError(error, "Library error");
  }
}
