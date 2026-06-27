"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getIRCTCPrices } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Category = "All" | "Meals" | "Breakfast" | "Beverages" | "Snacks";

interface IRCTCItem {
  name: string;
  category: string;
  maxPrice: number;
}

const CATEGORIES: Category[] = ["All", "Meals", "Breakfast", "Beverages", "Snacks"];

const categoryBadgeClass: Record<string, string> = {
  Meals: "bg-green-pale text-green hover:bg-green-pale",
  Breakfast: "bg-amber-pale text-amber hover:bg-amber-pale",
  Beverages: "bg-sky-50 text-sky-700 hover:bg-sky-50",
  Snacks: "bg-violet-50 text-violet-700 hover:bg-violet-50",
};

function MealsIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="14" cy="16" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path d="M10 8.5 Q11 6 14 6 Q17 6 18 8.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <path d="M11 4.5 Q11.5 3 12 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none" />
      <path d="M14 4.5 Q14.5 3 15 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none" />
      <path d="M17 4.5 Q17.5 3 18 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function BreakfastIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="14" cy="14" r="5" stroke="currentColor" strokeWidth="1.8" />
      <line x1="14" y1="3" x2="14" y2="5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="14" y1="22.5" x2="14" y2="25" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="3" y1="14" x2="5.5" y2="14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="22.5" y1="14" x2="25" y2="14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="6.4" y1="6.4" x2="8.2" y2="8.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="19.8" y1="19.8" x2="21.6" y2="21.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="21.6" y1="6.4" x2="19.8" y2="8.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="8.2" y1="19.8" x2="6.4" y2="21.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function BeveragesIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M8 8h12l-2 14H10L8 8Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M20 10h2a2 2 0 0 1 0 4h-2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 5 Q11 3.5 12 5 Q13 6.5 14 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function SnacksIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="14" cy="14" r="9" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="11" cy="12" r="1.2" fill="currentColor" />
      <circle cx="16" cy="11" r="1" fill="currentColor" />
      <circle cx="14" cy="16" r="1.2" fill="currentColor" />
      <circle cx="10" cy="17" r="0.9" fill="currentColor" />
      <circle cx="18" cy="16" r="1" fill="currentColor" />
    </svg>
  );
}

const categoryIconMap: Record<string, React.ReactNode> = {
  Meals: <MealsIcon />,
  Breakfast: <BreakfastIcon />,
  Beverages: <BeveragesIcon />,
  Snacks: <SnacksIcon />,
};

const categoryIconBg: Record<string, string> = {
  Meals: "bg-green-pale text-green",
  Breakfast: "bg-amber-pale text-amber",
  Beverages: "bg-sky-50 text-sky-700",
  Snacks: "bg-violet-50 text-violet-700",
};

export default function IRCTCPricesPage() {
  const [search, setSearch] = useState<string>("");
  const [activeCategory, setActiveCategory] = useState<Category>("All");

  const { data, isLoading, isError } = useQuery<{ prices: IRCTCItem[] }>({
    queryKey: ["irctc-prices"],
    queryFn: () => getIRCTCPrices() as Promise<{ prices: IRCTCItem[] }>,
    staleTime: 60 * 60 * 1000,
  });

  const filtered = useMemo<IRCTCItem[]>(() => {
    const items = data?.prices ?? [];
    return items.filter((item) => {
      const matchesCategory = activeCategory === "All" || item.category === activeCategory;
      const matchesSearch = search.trim() === "" || item.name.toLowerCase().includes(search.trim().toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [data, search, activeCategory]);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Page Header */}
      <section className="bg-green-pale border-b border-line">
        <div className="max-w-5xl mx-auto px-4 py-8 sm:py-10">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-ink-2 hover:text-green transition-colors mb-5">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M11 14l-5-5 5-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to home
          </Link>

          <span className="inline-flex items-center gap-1.5 bg-green text-white text-xs font-semibold px-3 py-1 rounded-full mb-3 tracking-wide uppercase">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M6.5 1.5l1.3 2.6 2.9.4-2.1 2 .5 2.9-2.6-1.4L4 9.4l.5-2.9-2.1-2 2.9-.4L6.5 1.5Z" fill="white" />
            </svg>
            Official IRCTC Caps
          </span>

          <h1 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight2 mb-2">Train Food Maximum Prices</h1>

          <p className="text-sm sm:text-base text-ink-2 max-w-2xl mb-3">
            Vendors on Indian Railways cannot legally charge above these amounts. Source: IRCTC Menu Rate Card.
          </p>

          <a href="https://www.irctc.co.in" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-green underline underline-offset-2 hover:text-green-dark transition-colors">
            irctc.co.in
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M5 2.5H2.5a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              <path d="M7.5 2.5h3v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="10.5" y1="2.5" x2="5.5" y2="7.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
          </a>
        </div>
      </section>

      {/* Search + Filter */}
      <section className="max-w-5xl mx-auto w-full px-4 pt-6 pb-2">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <div className="relative flex-1 max-w-sm">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-4 pointer-events-none">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
                <line x1="10.5" y1="10.5" x2="14" y2="14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </span>
            <Input
              type="text"
              placeholder="Search food item..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <Button
                key={cat}
                variant={activeCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(cat)}
                className={
                  activeCategory === cat
                    ? "bg-green text-white hover:bg-green-dark rounded-full px-3.5"
                    : "rounded-full px-3.5 border-line text-ink-2 hover:border-green hover:text-green"
                }
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        <p className="mt-3 text-xs text-ink-3">
          Showing <span className="font-semibold text-ink-2">{filtered.length}</span> item{filtered.length !== 1 ? "s" : ""}
        </p>
      </section>

      {/* Card Grid */}
      <section className="max-w-5xl mx-auto w-full px-4 pt-4 pb-10 flex-1">
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-green border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-ink-2 font-medium text-base mb-1">Failed to load prices</p>
            <p className="text-ink-4 text-sm">Check your connection and try again.</p>
          </div>
        )}

        {!isLoading && !isError && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="text-4xl mb-4">🔍</span>
            <p className="text-ink-2 font-medium text-base mb-1">No items found</p>
            <p className="text-ink-4 text-sm">Try a different search term or category.</p>
          </div>
        )}

        {!isLoading && !isError && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filtered.map((item) => (
              <Card key={item.name} className="hover:-translate-y-1 hover:shadow-lg hover:border-green transition-all duration-200 flex flex-col">
                <CardContent className="pt-5 flex flex-col gap-3 flex-1">
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${categoryIconBg[item.category] ?? "bg-line-2 text-ink-3"}`}>
                      {categoryIconMap[item.category]}
                    </span>
                    <Badge className={categoryBadgeClass[item.category] ?? "bg-line-2 text-ink-3"}>
                      {item.category}
                    </Badge>
                  </div>

                  <p className="font-semibold text-ink text-[15px] leading-snug">{item.name}</p>

                  <div className="mt-auto">
                    <p className="text-[11px] text-ink-3 mb-0.5 font-medium uppercase tracking-wide">Max price</p>
                    <p className="text-2xl font-bold text-green tabular-nums tracking-tight2">&#x20B9;{item.maxPrice}</p>
                    <p className="text-[11px] text-ink-4 mt-0.5">Vendor cannot charge above this</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Footer info strip */}
      <footer className="bg-green-pale border-t border-line">
        <div className="max-w-5xl mx-auto px-4 py-5">
          <p className="text-[13px] text-ink-2 leading-relaxed">
            <span className="font-semibold text-ink">Note:</span> These prices are official caps per Railway Board / IRCTC circular. If charged more, report to IRCTC Helpline:{" "}
            <a href="tel:18001100139" className="font-semibold text-green hover:underline">1800-110-139</a>{" "}
            or file a complaint at the{" "}
            <a href="https://consumerhelpline.gov.in" target="_blank" rel="noopener noreferrer" className="font-semibold text-green hover:underline">NCH Portal</a>.
          </p>
        </div>
      </footer>
    </div>
  );
}
