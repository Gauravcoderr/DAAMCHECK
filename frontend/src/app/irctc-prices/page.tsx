"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

type Category = "All" | "Meals" | "Breakfast" | "Beverages" | "Snacks";

interface IRCTCItem {
  name: string;
  category: string;
  maxPrice: number;
}

const ITEMS: IRCTCItem[] = [
  { name: "Veg Thali", category: "Meals", maxPrice: 110 },
  { name: "Non-Veg Thali", category: "Meals", maxPrice: 135 },
  { name: "Dal Makhani + Roti (4 pcs)", category: "Meals", maxPrice: 80 },
  { name: "Rajma Chawal", category: "Meals", maxPrice: 80 },
  { name: "Veg Fried Rice", category: "Meals", maxPrice: 75 },
  { name: "Chole Bhature", category: "Meals", maxPrice: 70 },
  { name: "Idli (4 pcs)", category: "Breakfast", maxPrice: 30 },
  { name: "Vada (2 pcs)", category: "Breakfast", maxPrice: 30 },
  { name: "Upma 250g", category: "Breakfast", maxPrice: 30 },
  { name: "Poha 250g", category: "Breakfast", maxPrice: 25 },
  { name: "Masala Dosa", category: "Breakfast", maxPrice: 50 },
  { name: "Bread Toast (4 slices)", category: "Breakfast", maxPrice: 25 },
  { name: "Tea 150ml", category: "Beverages", maxPrice: 10 },
  { name: "Coffee 150ml", category: "Beverages", maxPrice: 15 },
  { name: "Milk 200ml", category: "Beverages", maxPrice: 18 },
  { name: "Mineral Water 1L", category: "Beverages", maxPrice: 15 },
  { name: "Packaged Juice 200ml", category: "Beverages", maxPrice: 35 },
  { name: "Omelette (2 eggs)", category: "Snacks", maxPrice: 35 },
  { name: "Samosa (2 pcs)", category: "Snacks", maxPrice: 20 },
  { name: "Bread Pakoda (2 pcs)", category: "Snacks", maxPrice: 20 },
  { name: "Veg Puff", category: "Snacks", maxPrice: 18 },
  { name: "Cookies 100g", category: "Snacks", maxPrice: 25 },
];

const CATEGORIES: Category[] = ["All", "Meals", "Breakfast", "Beverages", "Snacks"];

const categoryBadgeClass: Record<string, string> = {
  Meals: "bg-green-pale text-green",
  Breakfast: "bg-amber-pale text-amber",
  Beverages: "bg-sky-50 text-sky-700",
  Snacks: "bg-violet-50 text-violet-700",
};

function MealsIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="14" cy="16" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M10 8.5 Q11 6 14 6 Q17 6 18 8.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M11 4.5 Q11.5 3 12 4.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M14 4.5 Q14.5 3 15 4.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M17 4.5 Q17.5 3 18 4.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

function BreakfastIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
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
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M8 8h12l-2 14H10L8 8Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M20 10h2a2 2 0 0 1 0 4h-2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 5 Q11 3.5 12 5 Q13 6.5 14 5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

function SnacksIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
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

  const filtered = useMemo<IRCTCItem[]>(() => {
    return ITEMS.filter((item) => {
      const matchesCategory =
        activeCategory === "All" || item.category === activeCategory;
      const matchesSearch =
        search.trim() === "" ||
        item.name.toLowerCase().includes(search.trim().toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [search, activeCategory]);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Page Header */}
      <section className="bg-green-pale border-b border-line">
        <div className="max-w-5xl mx-auto px-4 py-8 sm:py-10">
          {/* Back link */}
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-ink-2 hover:text-green transition-colors mb-5"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M11 14l-5-5 5-5"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Back to home
          </Link>

          {/* Badge */}
          <span className="inline-flex items-center gap-1.5 bg-green text-white text-xs font-semibold px-3 py-1 rounded-full mb-3 tracking-wide uppercase">
            <svg
              width="13"
              height="13"
              viewBox="0 0 13 13"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M6.5 1.5l1.3 2.6 2.9.4-2.1 2 .5 2.9-2.6-1.4L4 9.4l.5-2.9-2.1-2 2.9-.4L6.5 1.5Z"
                fill="white"
              />
            </svg>
            Official IRCTC Caps
          </span>

          <h1 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight2 mb-2">
            Train Food Maximum Prices
          </h1>

          <p className="text-sm sm:text-base text-ink-2 max-w-2xl mb-3">
            Vendors on Indian Railways cannot legally charge above these
            amounts. Source: IRCTC Menu Rate Card.
          </p>

          <a
            href="https://www.irctc.co.in"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-green underline underline-offset-2 hover:text-green-dark transition-colors"
          >
            irctc.co.in
            <svg
              width="13"
              height="13"
              viewBox="0 0 13 13"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M5 2.5H2.5a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V9"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
              <path
                d="M7.5 2.5h3v3"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <line
                x1="10.5"
                y1="2.5"
                x2="5.5"
                y2="7.5"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
            </svg>
          </a>
        </div>
      </section>

      {/* Search + Filter */}
      <section className="max-w-5xl mx-auto w-full px-4 pt-6 pb-2">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-4 pointer-events-none">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <circle
                  cx="7"
                  cy="7"
                  r="4.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <line
                  x1="10.5"
                  y1="10.5"
                  x2="14"
                  y2="14"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search food item..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-line rounded-xl pl-10 pr-4 py-3 text-[14px] text-ink bg-white outline-none focus:ring-2 focus:ring-green/30 focus:border-green transition-all"
            />
          </div>

          {/* Category pills */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all ${
                  activeCategory === cat
                    ? "bg-green text-white shadow-sm"
                    : "bg-white border border-line text-ink-2 hover:border-green hover:text-green"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Count */}
        <p className="mt-3 text-xs text-ink-3">
          Showing{" "}
          <span className="font-semibold text-ink-2">{filtered.length}</span>{" "}
          item{filtered.length !== 1 ? "s" : ""}
        </p>
      </section>

      {/* Card Grid */}
      <section className="max-w-5xl mx-auto w-full px-4 pt-4 pb-10 flex-1">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="text-4xl mb-4">🔍</span>
            <p className="text-ink-2 font-medium text-base mb-1">
              No items found
            </p>
            <p className="text-ink-4 text-sm">
              Try a different search term or category.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filtered.map((item) => (
              <article
                key={item.name}
                className="bg-white border border-line rounded-2xl p-5 hover:-translate-y-1 hover:shadow-lg hover:border-green transition-all duration-200 flex flex-col gap-3"
              >
                {/* Icon + Category badge row */}
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${categoryIconBg[item.category] ?? "bg-bg-line-2 text-ink-3"}`}
                  >
                    {categoryIconMap[item.category]}
                  </span>
                  <span
                    className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full ${categoryBadgeClass[item.category] ?? "bg-bg-line-2 text-ink-3"}`}
                  >
                    {item.category}
                  </span>
                </div>

                {/* Item name */}
                <p className="font-semibold text-ink text-[15px] leading-snug">
                  {item.name}
                </p>

                {/* Price block */}
                <div className="mt-auto">
                  <p className="text-[11px] text-ink-3 mb-0.5 font-medium uppercase tracking-wide">
                    Max price
                  </p>
                  <p className="text-2xl font-bold text-green tabular-nums tracking-tight2">
                    &#x20B9;{item.maxPrice}
                  </p>
                  <p className="text-[11px] text-ink-4 mt-0.5">
                    Vendor cannot charge above this
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Footer info strip */}
      <footer className="bg-green-pale border-t border-line">
        <div className="max-w-5xl mx-auto px-4 py-5">
          <p className="text-[13px] text-ink-2 leading-relaxed">
            <span className="font-semibold text-ink">Note:</span> These prices
            are official caps per Railway Board / IRCTC circular. If charged
            more, report to IRCTC Helpline:{" "}
            <a
              href="tel:18001100139"
              className="font-semibold text-green hover:underline"
            >
              1800-110-139
            </a>{" "}
            or file a complaint at the{" "}
            <a
              href="https://consumerhelpline.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-green hover:underline"
            >
              NCH Portal
            </a>
            .
          </p>
        </div>
      </footer>
    </div>
  );
}
