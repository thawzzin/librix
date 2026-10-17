"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { href: '/', label: 'Home' },
    { href: '/books', label: 'Browse' },
    { href: '/library', label: 'My Library' },
  ] as const;

  return (
    <nav className="sticky top-0 z-50 border-b" style={{
      background: 'rgba(15,13,10,0.92)',
      backdropFilter: 'blur(16px)',
      borderColor: 'var(--border-subtle)'
    }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded flex items-center justify-center text-sm font-bold" style={{
              background: 'linear-gradient(135deg, #c9a84c, #e4c472)',
              color: '#0f0d0a'
            }}>L</div>
            <span className="font-display text-xl font-semibold tracking-tight" style={{color:'var(--text-primary)'}}>
              Librix
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            {links.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link text-sm font-medium transition-colors ${
                  pathname === link.href ? 'active' : ''
                }`}
                style={{
                  color: pathname === link.href ? 'var(--accent-gold)' : 'var(--text-secondary)'
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            className="md:hidden p-2 rounded"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{color:'var(--text-secondary)'}}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              {menuOpen
                ? <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round"/>
                : <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round"/>
              }
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 flex flex-col gap-3">
            {links.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="text-sm font-medium py-2 px-3 rounded"
                style={{
                  color: pathname === link.href ? 'var(--accent-gold)' : 'var(--text-secondary)',
                  background: pathname === link.href ? 'rgba(201,168,76,0.08)' : 'transparent'
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
