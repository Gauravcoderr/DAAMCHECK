"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/ui/Logo";

const links = [
  { href: "/", label: "Home" },
  { href: "/gst-checker", label: "GST Checker" },
  { href: "/irctc-prices", label: "IRCTC Prices" },
  { href: "/scan-bill", label: "Scan Bill" },
  { href: "/chat", label: "DaamBot", badge: "AI" },
];

export default function Nav() {
  const path = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (path === "/chat") return null;

  return (
    <header className="sticky top-0 z-50 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.07)]">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center h-[68px] gap-8">

        {/* Logo */}
        <Link href="/" className="flex-shrink-0 hover:opacity-80 transition-opacity">
          <Logo iconSize={30} />
        </Link>

        {/* Desktop nav — centered */}
        <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`inline-flex items-center gap-1.5 text-[14px] px-4 py-[7px] rounded-full transition-colors ${
                path === l.href
                  ? "text-green border border-green bg-[#ECFDF5] font-semibold"
                  : "font-medium text-[#374151] hover:text-ink hover:bg-[#F3F4F6]"
              }`}
            >
              {l.label}
              {l.badge && (
                <span className="inline-flex items-center text-[9px] font-bold bg-green text-white rounded-full px-1.5 py-0.5 leading-none tracking-[.04em]">
                  {l.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3 ml-auto">
          <Link
            href="/chat"
            className="text-[14px] font-medium text-[#374151] hover:text-green transition-colors"
          >
            Ask DaamBot
          </Link>
          <Link
            href="/scan-bill"
            className="inline-flex items-center gap-1.5 bg-green hover:bg-green-dark text-white text-[14px] font-semibold rounded-full px-5 py-[9px] transition-colors shadow-sm"
          >
            Scan a bill
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="13,6 19,12 13,18" />
            </svg>
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="md:hidden ml-auto p-2 rounded-lg text-[#374151] hover:bg-[#F3F4F6] transition-colors"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#E5E7EB] bg-white px-5 py-4 flex flex-col gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              className={`inline-flex items-center gap-2 text-[15px] px-4 py-2.5 rounded-full transition-colors ${
                path === l.href
                  ? "text-green border border-green bg-[#ECFDF5] font-semibold"
                  : "font-medium text-[#374151] hover:text-ink hover:bg-[#F3F4F6]"
              }`}
            >
              {l.label}
              {l.badge && (
                <span className="inline-flex items-center text-[9px] font-bold bg-green text-white rounded-full px-1.5 py-0.5 leading-none">
                  {l.badge}
                </span>
              )}
            </Link>
          ))}
          <div className="border-t border-[#E5E7EB] mt-2 pt-3 flex flex-col gap-2">
            <Link
              href="/chat"
              onClick={() => setMobileOpen(false)}
              className="text-center text-[15px] font-medium text-[#374151] py-2"
            >
              Ask DaamBot
            </Link>
            <Link
              href="/scan-bill"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 bg-green hover:bg-green-dark text-white text-[15px] font-semibold rounded-full px-4 py-3 transition-colors w-full"
            >
              Scan a bill
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
