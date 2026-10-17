"use client";

import { useEffect, useRef } from "react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  pendingLabel: string;
  pending: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  pendingLabel,
  pending,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onCancel={(event) => {
        if (pending) event.preventDefault();
        else onClose();
      }}
      onClose={() => {
        if (open && !pending) onClose();
      }}
      aria-labelledby="return-dialog-title"
      aria-describedby="return-dialog-description"
      className="m-auto w-[min(92vw,28rem)] rounded-xl p-0 backdrop:bg-black/70"
      style={{
        background: "var(--bg-card)",
        color: "var(--text-primary)",
        border: "1px solid var(--border-medium)",
      }}
    >
      <div className="p-6">
        <h2
          id="return-dialog-title"
          className="font-display text-xl font-semibold"
        >
          {title}
        </h2>
        <p
          id="return-dialog-description"
          className="mt-2 text-sm leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          {description}
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            autoFocus
            disabled={pending}
            onClick={onClose}
            className="cursor-pointer rounded-lg px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              color: "var(--text-primary)",
              border: "1px solid var(--border-medium)",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={onConfirm}
            className="min-w-28 cursor-pointer rounded-lg px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              background: "rgba(139,58,58,0.25)",
              color: "#f09999",
              border: "1px solid rgba(139,58,58,0.6)",
            }}
          >
            {pending ? pendingLabel : confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
