import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { LibraryError } from "@/lib/library-service";
import type { ApiFailure, ApiResponse } from "@/types/library";

export function apiSuccess<T>(body: T, status = 200) {
  return NextResponse.json({ success: true, ...body }, { status });
}

export function apiError(error: unknown, context: string) {
  if (error instanceof LibraryError) {
    return NextResponse.json<ApiFailure>(
      { success: false, error: error.message },
      { status: error.status },
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json<ApiFailure>(
      {
        success: false,
        error: error.issues[0]?.message ?? "Invalid request",
      },
      { status: 400 },
    );
  }

  if (error instanceof SyntaxError) {
    return NextResponse.json<ApiFailure>(
      { success: false, error: "Invalid JSON request body" },
      { status: 400 },
    );
  }

  console.error(`${context}:`, error);
  return NextResponse.json<ApiResponse<never>>(
    { success: false, error: "Internal server error" },
    { status: 500 },
  );
}
