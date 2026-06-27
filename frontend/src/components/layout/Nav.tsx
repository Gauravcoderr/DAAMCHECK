"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/Logo";

const links = [
  { href: "/", label: "Home" },
  { href: "/gst-checker", label: "GST Checker" },
  { href: "/irctc-prices", label: "IRCTC Prices" },
  { href: "/scan-bill", label: "Scan Bill" },
];

export default function Nav() {
  const path = usePathname();
  if (path === "/chat") return null;

  return (
    <header className="sticky top-0 z-50 bg-white/94 backdrop-blur-md border-b border-line">
      <div className="max-w-6xl mx-auto px-6 md:px-10 flex items-center h-[62px] gap-8">
        {/* Brand */}
        <Link href="/" className="flex-shrink-0 transition-opacity hover:opacity-90">
          <Logo />
        </Link>

        {/* Desktop links */}
        <nav className="hidden md:flex gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-[15px] font-semibold px-3.5 py-1.5 rounded-[7px] transition-colors tracking-[-0.1px] ${
                path === l.href
                  ? "text-green bg-green-pale"
                  : "text-ink-2 hover:bg-line-2 hover:text-ink"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <div className="ml-auto">
          <Link
            href="/scan-bill"
            className="inline-flex items-center gap-2 bg-green text-white text-[14px] font-bold rounded-full px-5 py-2.5 transition-colors hover:bg-green-dark"
          >
            Scan a bill
          </Link>
        </div>
      </div>
    </header>
  );
}
