import type {
  ApiResponse,
  BorrowBookInput,
  RentalDto,
  ReturnBookInput,
} from "@/types/library";

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

async function postJson<TResponse, TRequest>(
  url: string,
  body: TRequest,
): Promise<TResponse> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await response.json()) as ApiResponse<TResponse>;

  if (!response.ok || !data.success) {
    throw new ApiClientError(
      data.success ? "Request failed" : data.error,
      response.status,
    );
  }

  return data;
}

export function borrowBookRequest(input: BorrowBookInput) {
  return postJson<{ rental: RentalDto }, BorrowBookInput>(
    "/api/borrow",
    input,
  );
}

export function returnBookRequest(input: ReturnBookInput) {
  return postJson<{ rental: RentalDto }, ReturnBookInput>(
    "/api/return",
    input,
  );
}
