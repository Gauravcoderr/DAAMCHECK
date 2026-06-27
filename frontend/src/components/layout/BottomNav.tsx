"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  {
    href: "/",
    label: "Home",
    icon: (
      <path
        d="M10 3L3 9v9h5v-5h4v5h5V9z"
        strokeLinejoin="round"
      />
    ),
  },
  {
    href: "/gst-checker",
    label: "GST",
    icon: (
      <>
        <rect x="4" y="2" width="12" height="16" rx="2" />
        <line x1="7" y1="7" x2="13" y2="7" />
        <line x1="7" y1="10" x2="13" y2="10" />
        <line x1="7" y1="13" x2="10" y2="13" />
      </>
    ),
  },
  {
    href: "/irctc-prices",
    label: "IRCTC",
    icon: (
      <>
        <rect x="4" y="3" width="12" height="11" rx="2" />
        <line x1="4" y1="9" x2="16" y2="9" />
        <line x1="8" y1="14" x2="6" y2="18" />
        <line x1="12" y1="14" x2="14" y2="18" />
        <circle cx="8" cy="11.5" r="1" />
        <circle cx="12" cy="11.5" r="1" />
      </>
    ),
  },
  {
    href: "/scan-bill",
    label: "Scan",
    icon: (
      <>
        <path d="M3 7V4h3M14 4h3v3M3 13v3h3M14 16h3v-3" />
        <line x1="2" y1="10" x2="18" y2="10" />
      </>
    ),
  },
];

export default function BottomNav() {
  const path = usePathname();
  if (path === "/chat") return null;

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/96 backdrop-blur border-t border-line flex"
      aria-label="Main navigation"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0)" }}
    >
      {items.map((item) => {
        const active = path === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 flex flex-col items-center py-2 gap-1 border-t-2 transition-colors ${
              active ? "border-green text-green" : "border-transparent text-ink-4"
            }`}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {item.icon}
            </svg>
            <span className="text-[10px] font-semibold uppercase tracking-wider">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
