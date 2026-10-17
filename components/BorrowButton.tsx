"use client";

import { useState } from "react";
import ConfirmDialog from "@/components/ConfirmDialog";
import {
  useBorrowBookMutation,
  useReturnBookMutation,
} from "@/hooks/use-library-mutations";
import type { GutendexBook } from "@/types/gutendex";
import type { RentalRecord } from "@/types/library";

interface BorrowButtonProps {
  book: GutendexBook;
  rental: RentalRecord | null;
  availableCopies: number;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong";
}

export default function BorrowButton({
  book,
  rental,
  availableCopies,
}: BorrowButtonProps) {
  const [message, setMessage] = useState("");
  const [confirmingReturn, setConfirmingReturn] = useState(false);
  const borrowMutation = useBorrowBookMutation();
  const returnMutation = useReturnBookMutation();

  const isBorrowed = rental?.status === "BORROWED";
  const isUnavailable = availableCopies <= 0 && !isBorrowed;
  const pending = borrowMutation.isPending || returnMutation.isPending;

  const handleBorrow = async () => {
    setMessage("");
    try {
      await borrowMutation.mutateAsync({
        gutendexId: String(book.id),
        title: book.title,
        author:
          book.authors.map((author) => author.name).join(", ") || "Unknown",
        coverImage: book.formats["image/jpeg"] ?? null,
        formats: book.formats,
      });
      setMessage("✓ Borrowed successfully!");
    } catch (error) {
      setMessage(errorMessage(error));
    }
  };

  const handleReturn = async () => {
    if (!rental) return;
    setMessage("");
    try {
      await returnMutation.mutateAsync({ rentalId: rental.id });
      setConfirmingReturn(false);
      setMessage("✓ Returned successfully!");
    } catch (error) {
      setMessage(errorMessage(error));
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {isBorrowed ? (
        <button
          type="button"
          onClick={() => setConfirmingReturn(true)}
          disabled={pending}
          className="cursor-pointer rounded-lg px-6 py-3 text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50"
          style={{
            background: "rgba(139,58,58,0.15)",
            color: "#e07878",
            border: "1px solid rgba(139,58,58,0.4)",
          }}
        >
          ↩ Return Book
        </button>
      ) : (
        <button
          type="button"
          onClick={handleBorrow}
          disabled={pending || isUnavailable}
          className="btn-gold cursor-pointer rounded-lg px-6 py-3 text-sm disabled:cursor-not-allowed"
        >
          {borrowMutation.isPending
            ? "Processing..."
            : isUnavailable
              ? "No Copies Available"
              : "＋ Borrow Book"}
        </button>
      )}

      {message && (
        <p
          role="status"
          className="text-xs font-medium"
          style={{
            color: message.startsWith("✓") ? "#7ecdb0" : "#e07878",
          }}
        >
          {message}
        </p>
      )}

      <ConfirmDialog
        open={confirmingReturn}
        title="Return this book?"
        description={`Return “${book.title}” and add it to your reading history.`}
        confirmLabel="Return book"
        pendingLabel="Returning…"
        pending={returnMutation.isPending}
        onConfirm={handleReturn}
        onClose={() => setConfirmingReturn(false)}
      />
    </div>
  );
}
