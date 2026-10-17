import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <div
          className="font-display text-9xl font-bold mb-4"
          style={{ color: "var(--border-medium)" }}
        >
          404
        </div>
        <h2
          className="font-display text-2xl font-semibold mb-2"
          style={{ color: "var(--text-primary)" }}
        >
          Page not found
        </h2>
        <p className="text-sm mb-8" style={{ color: "var(--text-secondary)" }}>
          The page you&rsquo;re looking for doesn&rsquo;t exist.
        </p>
        <Link href="/" className="btn-gold px-6 py-2.5 rounded-lg text-sm">
          Go Home
        </Link>
      </div>
    </div>
  );
}
