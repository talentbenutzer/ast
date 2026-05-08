"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export function Navigation() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const links = [
    { href: "/list", label: "Seriennummern" },
    { href: "/generator", label: "Neue Seriennummer" },
    { href: "/handover", label: "Übergabe" },
    { href: "/intern", label: "Intern" },
    { href: "/employees", label: "Mitarbeiter" },
    { href: "/feedback", label: "Feedback" },
  ];

  return (
    <nav className="w-full relative">
      <div className="px-6 md:px-[90px] pt-8 md:pt-10 pb-6 flex md:grid md:grid-cols-7 items-center md:items-baseline justify-between">
        <div className="md:col-span-1">
          <Link href="/" className="text-2xl md:text-3xl font-bold tracking-tight">
            höllental.
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden p-2 -mr-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {isMenuOpen ? (
              <path d="M18 6L6 18M6 6l12 12" />
            ) : (
              <path d="M3 12h18M3 6h18M3 18h18" />
            )}
          </svg>
        </button>

        {/* Desktop Links */}
        <div className="hidden md:flex md:col-span-6 items-baseline">
          <div className="grid grid-cols-6 w-full">
            {links.map((link) => {
              const isActive = pathname === link.href || (pathname === "/" && link.href === "/list");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm transition-colors duration-150 ${
                    isActive
                      ? "text-foreground font-bold"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile Links Overlay */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-border z-50 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="px-6 py-8 space-y-6">
            {links.map((link) => {
              const isActive = pathname === link.href || (pathname === "/" && link.href === "/list");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block text-lg transition-colors duration-150 ${
                    isActive
                      ? "text-foreground font-bold underline underline-offset-8"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <div className="border-t border-border" />
    </nav>
  );
}
