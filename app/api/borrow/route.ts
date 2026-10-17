import type { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api-response";
import { borrowBookRequestSchema } from "@/lib/api-schemas";
import { borrowBook, toRentalDto } from "@/lib/library-service";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const input = borrowBookRequestSchema.parse(await request.json());
    const rental = await borrowBook(input);
    return apiSuccess({ rental: toRentalDto(rental) });
  } catch (error) {
    return apiError(error, "Borrow error");
  }
}
