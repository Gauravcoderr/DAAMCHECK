"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getIRCTCPrices } from "@/lib/api";

// ─── Types ─────────────────────────────────────────────────────────────────────

type Category = "All" | "Meals" | "Breakfast" | "Beverages" | "Snacks";

interface IRCTCItem {
  name: string;
  category: string;
  maxPrice: number;
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const CATEGORIES: Category[] = ["All", "Meals", "Breakfast", "Beverages", "Snacks"];
const CAT_ORDER: Exclude<Category, "All">[] = ["Meals", "Breakfast", "Beverages", "Snacks"];

type CatKey = "Meals" | "Breakfast" | "Beverages" | "Snacks";

const CAT_STYLE: Record<CatKey, {
  accent: string;
  iconBox: string;
  tag: string;
  price: string;
}> = {
  Meals:     { accent: "bg-green",       iconBox: "bg-green-pale text-green",           tag: "bg-green-pale text-[#065F46]",   price: "text-green" },
  Breakfast: { accent: "bg-amber",       iconBox: "bg-amber-pale text-amber",           tag: "bg-amber-pale text-[#92400E]",   price: "text-amber" },
  Beverages: { accent: "bg-[#2563EB]",   iconBox: "bg-[#EFF6FF] text-[#2563EB]",       tag: "bg-[#EFF6FF] text-[#1E40AF]",   price: "text-[#2563EB]" },
  Snacks:    { accent: "bg-[#7C3AED]",   iconBox: "bg-[#F5F3FF] text-[#7C3AED]",       tag: "bg-[#F5F3FF] text-[#5B21B6]",   price: "text-[#7C3AED]" },
};

// ─── Category Icons ────────────────────────────────────────────────────────────

function MealsIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 28 28" fill="none" aria-hidden="true">
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
    <svg width="22" height="22" viewBox="0 0 28 28" fill="none" aria-hidden="true">
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
    <svg width="22" height="22" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <path d="M8 8h12l-2 14H10L8 8Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M20 10h2a2 2 0 0 1 0 4h-2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 5 Q11 3.5 12 5 Q13 6.5 14 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function SnacksIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <circle cx="14" cy="14" r="9" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="11" cy="12" r="1.2" fill="currentColor" />
      <circle cx="16" cy="11" r="1" fill="currentColor" />
      <circle cx="14" cy="16" r="1.2" fill="currentColor" />
      <circle cx="10" cy="17" r="0.9" fill="currentColor" />
      <circle cx="18" cy="16" r="1" fill="currentColor" />
    </svg>
  );
}

const ICONS: Record<CatKey, React.ReactNode> = {
  Meals: <MealsIcon />,
  Breakfast: <BreakfastIcon />,
  Beverages: <BeveragesIcon />,
  Snacks: <SnacksIcon />,
};

// ─── Item Card ──────────────────────────────────────────────────────────────────

function ItemCard({ item }: { item: IRCTCItem }) {
  const cat = item.category as CatKey;
  const s = CAT_STYLE[cat] ?? CAT_STYLE.Meals;

  return (
    <div className="relative bg-white border-[1.5px] border-line rounded-2xl p-4 flex items-center gap-3.5 overflow-hidden hover:border-green hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(5,150,105,.1)] transition-all duration-200">
      {/* left accent */}
      <div className={`absolute left-0 top-0 bottom-0 w-[3px] rounded-[2px] ${s.accent}`} />

      {/* icon */}
      <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center flex-shrink-0 ${s.iconBox}`}>
        {ICONS[cat]}
      </div>

      {/* text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-ink leading-snug mb-2">{item.name}</p>
        <div className="flex items-center justify-between gap-2">
          <span className={`text-[10px] font-bold uppercase tracking-[.06em] px-2 py-[2px] rounded ${s.tag}`}>
            {item.category}
          </span>
          <span className={`flex items-baseline gap-[2px] ${s.price}`}>
            <span className="text-[9px] font-semibold uppercase tracking-[.06em] opacity-70 mr-0.5">max</span>
            <span className="text-[15px] font-black tracking-tight2 font-tabular">₹{item.maxPrice}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Category Section ──────────────────────────────────────────────────────────

function CategorySection({ cat, items }: { cat: CatKey; items: IRCTCItem[] }) {
  const s = CAT_STYLE[cat];
  if (items.length === 0) return null;

  return (
    <div>
      {/* section header */}
      <div className="flex items-center gap-3 border-b-2 border-line mb-[18px] pb-[14px]">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${s.iconBox}`}>
          {ICONS[cat]}
        </div>
        <span className="text-lg font-extrabold text-ink">{cat}</span>
        <span className="text-xs font-semibold bg-line-2 px-2.5 py-1 rounded-full text-ink-4 ml-1">{items.length} items</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
        {items.map((item) => (
          <ItemCard key={item.name} item={item} />
        ))}
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function IRCTCPricesPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category>("All");

  const { data, isLoading, isError } = useQuery<{ prices: IRCTCItem[] }>({
    queryKey: ["irctc-prices"],
    queryFn: () => getIRCTCPrices() as Promise<{ prices: IRCTCItem[] }>,
    staleTime: 60 * 60 * 1000,
  });

  const grouped = useMemo<Record<CatKey, IRCTCItem[]>>(() => {
    const items = data?.prices ?? [];
    const q = search.trim().toLowerCase();
    return CAT_ORDER.reduce((acc, cat) => {
      acc[cat] = items.filter((item) => {
        const catMatch = activeCategory === "All" || item.category === activeCategory;
        const searchMatch = !q || item.name.toLowerCase().includes(q);
        return item.category === cat && catMatch && searchMatch;
      });
      return acc;
    }, {} as Record<CatKey, IRCTCItem[]>);
  }, [data, search, activeCategory]);

  const totalShowing = CAT_ORDER.reduce((n, cat) => n + grouped[cat].length, 0);

  return (
    <div className="min-h-screen bg-[#faf9f5]">
      <div className="max-w-[1160px] mx-auto px-6 md:px-10 py-12">

        <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-3 hover:text-ink transition mb-5">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="8,2 4,6 8,10" />
          </svg>
          Back
        </Link>

        {/* heading */}
        <div className="mb-8">
          <h1 className="text-[clamp(28px,4vw,42px)] font-black tracking-tight3 text-ink leading-[1.1] mb-2">IRCTC Food Price Caps</h1>
          <p className="text-[17px] text-ink-3">Official maximum prices. Any vendor charging more is violating Railway Board rules.</p>
        </div>

        {/* dark helpline banner */}
        <div className="bg-ink rounded-xl px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
          <p className="text-white text-[15px]">Overcharged on a train? Call IRCTC at <strong className="font-extrabold">1800-110-139</strong></p>
          <a href="tel:18001100139" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold text-sm rounded-full px-5 py-2.5 transition shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.81a16 16 0 0 0 6.29 6.29l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            Call helpline
          </a>
        </div>

        {/* search */}
        <div className="relative mb-4">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-ink-4">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <circle cx="7" cy="7" r="4.5" />
              <line x1="10.5" y1="10.5" x2="14" y2="14" />
            </svg>
          </span>
          <input
            type="search"
            placeholder="Search — Veg Thali, Tea, Samosa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border-[1.5px] border-line rounded-full pl-11 pr-5 py-3 text-base text-ink outline-none focus:border-green focus:shadow-[0_0_0_3px_rgba(5,150,105,.12)] transition-all"
          />
        </div>

        {/* category pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-[18px] py-2 rounded-full text-sm font-bold border-[1.5px] transition-all ${
                activeCategory === cat
                  ? "bg-ink text-white border-ink"
                  : "bg-white text-ink-2 border-line hover:bg-line-2"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* states */}
        {isLoading && (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-green border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-ink font-bold text-lg mb-1">Could not load prices</p>
            <p className="text-ink-3 text-sm">Check your connection and try again.</p>
          </div>
        )}

        {!isLoading && !isError && totalShowing === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-ink font-bold text-lg mb-1">No items match</p>
            <p className="text-ink-3 text-sm">Try a different search or category.</p>
          </div>
        )}

        {!isLoading && !isError && totalShowing > 0 && (
          <div>
            {CAT_ORDER.map((cat) => (
              <CategorySection key={cat} cat={cat} items={grouped[cat]} />
            ))}
          </div>
        )}

        {/* footer note */}
        {!isLoading && !isError && (
          <div className="mt-4 pt-6 border-t border-line">
            <p className="text-xs text-ink-4">
              Source: IRCTC Menu Rate Card · <a href="https://menurates.irctc.co.in" target="_blank" rel="noopener noreferrer" className="underline hover:text-ink-2">menurates.irctc.co.in</a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
