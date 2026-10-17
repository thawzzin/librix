"use client";

import { useState } from "react";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useReturnBookMutation } from "@/hooks/use-library-mutations";

interface ReturnButtonProps {
  rentalId: string;
  bookTitle: string;
}

export default function ReturnButton({ rentalId, bookTitle }: ReturnButtonProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const mutation = useReturnBookMutation();

  const handleReturn = async () => {
    setError("");
    try {
      await mutation.mutateAsync({ rentalId });
      setOpen(false);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Unable to return book",
      );
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={mutation.isPending}
        className="cursor-pointer rounded px-3 py-1.5 text-xs font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50"
        style={{
          background: "rgba(139,58,58,0.15)",
          color: "#e07878",
          border: "1px solid rgba(139,58,58,0.3)",
        }}
      >
        Return
      </button>
      {error && (
        <p role="alert" className="mt-2 text-xs" style={{ color: "#e07878" }}>
          {error}
        </p>
      )}
      <ConfirmDialog
        open={open}
        title="Return this book?"
        description={`Return “${bookTitle}” and add it to your reading history.`}
        confirmLabel="Return book"
        pendingLabel="Returning…"
        pending={mutation.isPending}
        onConfirm={handleReturn}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
