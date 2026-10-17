"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-2xl font-semibold">
          We couldn&apos;t load this page
        </h1>
        <p className="mt-3 text-sm" style={{ color: "var(--text-secondary)" }}>
          Check your connection and try again.
        </p>
        <button
          type="button"
          onClick={reset}
          className="btn-gold mt-6 cursor-pointer rounded-lg px-6 py-2.5 text-sm"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
