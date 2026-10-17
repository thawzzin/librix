"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { borrowBookRequest, returnBookRequest } from "@/lib/api-client";

export function useBorrowBookMutation() {
  const router = useRouter();
  return useMutation({
    mutationFn: borrowBookRequest,
    onSuccess: () => router.refresh(),
  });
}

export function useReturnBookMutation() {
  const router = useRouter();
  return useMutation({
    mutationFn: returnBookRequest,
    onSuccess: () => router.refresh(),
  });
}
