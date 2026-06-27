"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ChatBot() {
  const path = usePathname();
  if (path === "/chat") return null;

  return (
    <Link
      href="/chat"
      className="fixed bottom-20 right-5 md:bottom-6 z-50 flex items-center gap-2.5 bg-dark text-white text-[14px] font-semibold px-4 py-3 rounded-full shadow-lg hover:bg-green-dark transition-colors"
      aria-label="Chat with DaamBot"
    >
      <span className="text-[18px]">🤖</span>
      <span>Ask DaamBot</span>
    </Link>
  );
}
