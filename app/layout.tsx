import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import Providers from "@/app/providers";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Librix — Digital Library",
  description: "Borrow, read, and discover books from our digital collection",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <footer
            className="mt-20 border-t py-8 text-center"
            style={{ borderColor: "var(--border-subtle)" }}
          >
            <p
              className="font-display text-sm italic"
              style={{ color: "var(--text-muted)" }}
            >
              Librix — A digital library experience
            </p>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
