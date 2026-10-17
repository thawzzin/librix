import type { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api-response";
import { returnBookRequestSchema } from "@/lib/api-schemas";
import { returnBook, toRentalDto } from "@/lib/library-service";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const { rentalId } = returnBookRequestSchema.parse(await request.json());
    const rental = await returnBook(rentalId);
    return apiSuccess({ rental: toRentalDto(rental) });
  } catch (error) {
    return apiError(error, "Return error");
  }
}
