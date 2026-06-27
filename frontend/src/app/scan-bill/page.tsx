"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { checkIRCTCItems } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

type ManualItem = { name: string; chargedPrice: number };

type CheckResult = {
  name: string;
  chargedPrice: number;
  maxPrice: number | null;
  status: "ok" | "overcharged" | "unknown";
  overcharge: number;
};

type CheckResponse = {
  results: CheckResult[];
  totalOvercharge: number;
  legal: boolean;
  complaintNumber: string;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const IRCTC_ITEMS: string[] = [
  "Veg Thali",
  "Non-Veg Thali",
  "Dal Makhani + Roti (4 pcs)",
  "Rajma Chawal",
  "Veg Fried Rice",
  "Chole Bhature",
  "Idli (4 pcs)",
  "Vada (2 pcs)",
  "Upma 250g",
  "Poha 250g",
  "Masala Dosa",
  "Bread Toast (4 slices)",
  "Tea 150ml",
  "Coffee 150ml",
  "Milk 200ml",
  "Mineral Water 1L",
  "Packaged Juice 200ml",
  "Omelette (2 eggs)",
  "Samosa (2 pcs)",
  "Bread Pakoda (2 pcs)",
  "Veg Puff",
  "Cookies 100g",
];

const DEMO_RESULT: CheckResponse = {
  results: [
    {
      name: "Veg Thali",
      chargedPrice: 150,
      maxPrice: 110,
      status: "overcharged",
      overcharge: 40,
    },
    {
      name: "Tea 150ml",
      chargedPrice: 12,
      maxPrice: 10,
      status: "overcharged",
      overcharge: 2,
    },
    {
      name: "Samosa (2 pcs)",
      chargedPrice: 20,
      maxPrice: 20,
      status: "ok",
      overcharge: 0,
    },
  ],
  totalOvercharge: 42,
  legal: false,
  complaintNumber: "1800-110-139",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ result }: { result: CheckResult }) {
  if (result.status === "ok") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-pale text-green text-xs font-semibold">
        OK
      </span>
    );
  }
  if (result.status === "overcharged") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-pale text-red text-xs font-semibold">
        Overcharged +&#8377;{result.overcharge}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-pale text-amber text-xs font-semibold">
      Unknown
    </span>
  );
}

function ResultCard({ data }: { data: CheckResponse }) {
  return (
    <div className="mt-6 space-y-4">
      {/* Per-item results */}
      <div className="rounded-2xl border border-line bg-white overflow-hidden">
        <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-4 px-4 py-2 bg-bg-line-2 text-xs font-semibold text-ink-3 uppercase tracking-wide">
          <span>Item</span>
          <span className="text-right">Charged</span>
          <span className="text-right">Max Price</span>
          <span className="text-right">Status</span>
        </div>
        {data.results.map((r, idx) => (
          <div
            key={idx}
            className="grid grid-cols-[1fr_auto_auto_auto] gap-x-4 px-4 py-3 border-t border-line items-center"
          >
            <span className="text-sm text-ink font-medium">{r.name}</span>
            <span className="text-sm text-ink-2 text-right">&#8377;{r.chargedPrice}</span>
            <span className="text-sm text-ink-3 text-right">
              {r.maxPrice !== null ? `₹${r.maxPrice}` : "—"}
            </span>
            <div className="flex justify-end">
              <StatusBadge result={r} />
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div
        className={`rounded-2xl p-4 border ${
          data.legal
            ? "bg-green-pale border-green-mid"
            : "bg-red-pale border-red"
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-ink">
              {data.legal ? "Bill looks correct" : "Overcharging detected"}
            </p>
            {!data.legal && (
              <p className="text-sm text-ink-2 mt-0.5">
                Total overcharge:{" "}
                <span className="font-bold text-red">&#8377;{data.totalOvercharge}</span>
              </p>
            )}
          </div>
          <span
            className={`text-2xl font-black ${
              data.legal ? "text-green" : "text-red"
            }`}
          >
            {data.legal ? "✓" : "✗"}
          </span>
        </div>

        {/* Complaint section */}
        {!data.legal && (
          <div className="mt-4 pt-4 border-t border-red/20">
            <p className="text-xs font-semibold text-ink-2 uppercase tracking-wide mb-1">
              File a complaint
            </p>
            <p className="text-sm text-ink-2">
              Call IRCTC helpline:{" "}
              <a
                href={`tel:${data.complaintNumber}`}
                className="font-bold text-red underline underline-offset-2"
              >
                {data.complaintNumber}
              </a>
            </p>
            <p className="text-xs text-ink-3 mt-1">
              You can also write to{" "}
              <span className="font-medium">pgportal.gov.in</span> or use the
              Rail Madad app.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Upload Tab ───────────────────────────────────────────────────────────────

function UploadTab() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [demoResult, setDemoResult] = useState<CheckResponse | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
    setDemoResult(null);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0] ?? null;
    if (file) {
      setSelectedFile(file);
      setDemoResult(null);
    }
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  function handleZoneClick() {
    fileInputRef.current?.click();
  }

  function handleRemove() {
    setSelectedFile(null);
    setDemoResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleAnalyze() {
    setDemoResult(DEMO_RESULT);
  }

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onClick={handleZoneClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-colors p-10 flex flex-col items-center justify-center gap-3 select-none ${
          isDragging
            ? "border-green bg-green-pale"
            : "border-line hover:border-green-mid hover:bg-green-pale/30"
        }`}
      >
        {/* Cloud upload icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-12 h-12 text-ink-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 16.5v-9m0 0-3 3m3-3 3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.338-2.334A4.5 4.5 0 0 1 17.25 19.5H6.75Z"
          />
        </svg>
        <p className="text-base font-semibold text-ink">Drop your bill photo here</p>
        <p className="text-sm text-ink-3 text-center">
          or click to browse — JPG, PNG, PDF supported
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Selected file */}
      {selectedFile && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-line bg-white px-4 py-3">
          <div className="flex items-center gap-2 min-w-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 text-ink-3 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
              />
            </svg>
            <span className="text-sm text-ink truncate">{selectedFile.name}</span>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="text-xs text-red font-semibold shrink-0 hover:underline"
          >
            Remove
          </button>
        </div>
      )}

      {/* Analyze button */}
      <button
        type="button"
        onClick={handleAnalyze}
        disabled={!selectedFile}
        className="w-full rounded-xl bg-green text-white font-semibold py-3 text-sm transition-opacity disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
      >
        Analyze Bill
      </button>

      {/* Disclaimer */}
      <p className="text-xs text-ink-4 text-center">
        Demo mode — OCR analysis coming soon. Use Manual Entry for real checks.
      </p>

      {/* Demo result */}
      {demoResult && <ResultCard data={demoResult} />}
    </div>
  );
}

// ─── Manual Entry Tab ─────────────────────────────────────────────────────────

function ManualTab() {
  const [itemName, setItemName] = useState<string>("");
  const [itemPrice, setItemPrice] = useState<string>("");
  const [items, setItems] = useState<ManualItem[]>([]);
  const [result, setResult] = useState<CheckResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  function handleAddItem(e: React.FormEvent) {
    e.preventDefault();
    const name = itemName.trim();
    const price = parseFloat(itemPrice);
    if (!name || isNaN(price) || price <= 0) return;
    setItems((prev) => [...prev, { name, chargedPrice: price }]);
    setItemName("");
    setItemPrice("");
    setResult(null);
    setError(null);
  }

  function handleRemoveItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
    setResult(null);
  }

  async function handleCheckItems() {
    if (items.length === 0) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = (await checkIRCTCItems(items)) as CheckResponse;
      setResult(data);
    } catch {
      setError("Failed to check items. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setItemName(e.target.value);
  }

  function handlePriceChange(e: React.ChangeEvent<HTMLInputElement>) {
    setItemPrice(e.target.value);
  }

  return (
    <div className="space-y-6">
      {/* Datalist for autocomplete */}
      <datalist id="irctc-items">
        {IRCTC_ITEMS.map((item) => (
          <option key={item} value={item} />
        ))}
      </datalist>

      {/* Add item form */}
      <form onSubmit={handleAddItem} className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          list="irctc-items"
          placeholder='Item name (e.g. "Veg Thali")'
          value={itemName}
          onChange={handleNameChange}
          className="flex-1 rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink placeholder:text-ink-4 focus:outline-none focus:border-green transition-colors"
        />
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-3 pointer-events-none">
            &#8377;
          </span>
          <input
            type="number"
            min="0"
            step="0.5"
            placeholder="Price charged"
            value={itemPrice}
            onChange={handlePriceChange}
            className="w-full sm:w-36 rounded-xl border border-line bg-white pl-7 pr-4 py-2.5 text-sm text-ink placeholder:text-ink-4 focus:outline-none focus:border-green transition-colors"
          />
        </div>
        <button
          type="submit"
          className="rounded-xl bg-green text-white font-semibold px-5 py-2.5 text-sm hover:opacity-90 transition-opacity whitespace-nowrap"
        >
          Add
        </button>
      </form>

      {/* Items table */}
      {items.length > 0 && (
        <div className="rounded-2xl border border-line bg-white overflow-hidden">
          <div className="grid grid-cols-[1fr_auto_auto] gap-x-4 px-4 py-2 bg-bg-line-2 text-xs font-semibold text-ink-3 uppercase tracking-wide">
            <span>Item</span>
            <span className="text-right">Charged (&#8377;)</span>
            <span className="text-right">Remove</span>
          </div>
          {items.map((item, idx) => (
            <div
              key={idx}
              className="grid grid-cols-[1fr_auto_auto] gap-x-4 px-4 py-3 border-t border-line items-center"
            >
              <span className="text-sm text-ink">{item.name}</span>
              <span className="text-sm text-ink-2 text-right font-medium">
                &#8377;{item.chargedPrice}
              </span>
              <button
                type="button"
                onClick={() => handleRemoveItem(idx)}
                className="text-red hover:text-red/70 transition-colors flex justify-end"
                aria-label={`Remove ${item.name}`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-sm text-red bg-red-pale rounded-xl px-4 py-3">{error}</p>
      )}

      {/* Check button */}
      {items.length > 0 && (
        <button
          type="button"
          onClick={handleCheckItems}
          disabled={loading}
          className="w-full rounded-xl bg-green text-white font-semibold py-3 text-sm transition-opacity disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-90 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg
                className="w-4 h-4 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4Z"
                />
              </svg>
              Checking...
            </>
          ) : (
            "Check Items"
          )}
        </button>
      )}

      {/* Result */}
      {result && <ResultCard data={result} />}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ScanBillPage() {
  const [activeTab, setActiveTab] = useState<0 | 1>(0);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Link
          href="/"
          className="mt-0.5 text-ink-3 hover:text-ink transition-colors shrink-0"
          aria-label="Back to home"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-ink leading-tight">Scan Your Bill</h1>
          <p className="text-sm text-ink-3 mt-0.5">
            Upload a photo or enter items manually to check for overcharging
          </p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-line">
        {(["Upload Photo", "Manual Entry — IRCTC"] as const).map((label, idx) => (
          <button
            key={label}
            type="button"
            onClick={() => setActiveTab(idx as 0 | 1)}
            className={`px-4 py-2.5 text-sm transition-colors -mb-px ${
              activeTab === idx
                ? "border-b-2 border-green text-green font-semibold"
                : "text-ink-3 hover:text-ink"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 0 ? <UploadTab /> : <ManualTab />}
    </div>
  );
}
