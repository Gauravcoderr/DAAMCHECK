"use client";

import { useState, useRef } from "react";
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

type OCRResult = {
  items: { name: string; price: number }[];
  gstPercent: number;
  serviceChargePct: number;
  restaurantName: string | null;
  totalAmount: number;
};

type OCRResponse = OCRResult | { error: string };

// Editable row derived from OCR items — user can correct before checking
type EditableOCRItem = { name: string; chargedPrice: number };

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

// IRCTC mandated GST slab (5%). If OCR detects higher, warn.
const IRCTC_MAX_GST = 5;

// ─── Shared Sub-components ────────────────────────────────────────────────────

function Spinner({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-8">
      <svg
        className="w-5 h-5 animate-spin text-green"
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
      <span className="text-sm text-ink-2 font-medium">{label}</span>
    </div>
  );
}

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
            className={`text-2xl font-black ${data.legal ? "text-green" : "text-red"}`}
          >
            {data.legal ? "✓" : "✗"}
          </span>
        </div>

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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // OCR states
  const [ocrLoading, setOcrLoading] = useState<boolean>(false);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [ocrMeta, setOcrMeta] = useState<{
    gstPercent: number;
    serviceChargePct: number;
    restaurantName: string | null;
    totalAmount: number;
  } | null>(null);

  // Editable extracted items
  const [editableItems, setEditableItems] = useState<EditableOCRItem[]>([]);

  // Check states
  const [checkLoading, setCheckLoading] = useState<boolean>(false);
  const [checkError, setCheckError] = useState<string | null>(null);
  const [checkResult, setCheckResult] = useState<CheckResponse | null>(null);

  // ── File handling ──

  function applyFile(file: File) {
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setOcrError(null);
    setOcrMeta(null);
    setEditableItems([]);
    setCheckResult(null);
    setCheckError(null);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (file) applyFile(file);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0] ?? null;
    if (file) applyFile(file);
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
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setOcrError(null);
    setOcrMeta(null);
    setEditableItems([]);
    setCheckResult(null);
    setCheckError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  // ── OCR ──

  async function handleAnalyze() {
    if (!selectedFile) return;
    setOcrLoading(true);
    setOcrError(null);
    setOcrMeta(null);
    setEditableItems([]);
    setCheckResult(null);
    setCheckError(null);

    try {
      // Convert file to base64 data URL
      const base64: string = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(selectedFile);
      });

      const res = await fetch("/api/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64 }),
      });

      const data = (await res.json()) as OCRResponse;

      if ("error" in data) {
        // OCR returned an error or could not read bill
        setOcrError(data.error);
        return;
      }

      // Success path
      setOcrMeta({
        gstPercent: data.gstPercent,
        serviceChargePct: data.serviceChargePct,
        restaurantName: data.restaurantName,
        totalAmount: data.totalAmount,
      });
      setEditableItems(
        data.items.map((it) => ({ name: it.name, chargedPrice: it.price }))
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setOcrError(`Could not read bill: ${message}`);
    } finally {
      setOcrLoading(false);
    }
  }

  // ── Editable item handlers ──

  function handleItemNameChange(idx: number, value: string) {
    setEditableItems((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, name: value } : it))
    );
    setCheckResult(null);
  }

  function handleItemPriceChange(idx: number, value: string) {
    const parsed = parseFloat(value);
    setEditableItems((prev) =>
      prev.map((it, i) =>
        i === idx ? { ...it, chargedPrice: isNaN(parsed) ? 0 : parsed } : it
      )
    );
    setCheckResult(null);
  }

  function handleRemoveEditableItem(idx: number) {
    setEditableItems((prev) => prev.filter((_, i) => i !== idx));
    setCheckResult(null);
  }

  // ── Check ──

  async function handleCheckOCRItems() {
    if (editableItems.length === 0) return;
    setCheckLoading(true);
    setCheckError(null);
    setCheckResult(null);
    try {
      const data = (await checkIRCTCItems(editableItems)) as CheckResponse;
      setCheckResult(data);
    } catch {
      setCheckError("Failed to check items. Please try again.");
    } finally {
      setCheckLoading(false);
    }
  }

  // ── Derived flags ──

  const gstWarning =
    ocrMeta !== null && ocrMeta.gstPercent > IRCTC_MAX_GST;

  return (
    <div className="space-y-4">
      {/* Drop zone — hidden once file is selected */}
      {!selectedFile && (
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
            title="Upload bill photo"
            aria-label="Upload bill photo"
            onChange={handleFileChange}
          />
        </div>
      )}

      {/* Image preview + file info */}
      {selectedFile && previewUrl && (
        <div className="rounded-2xl border border-line bg-white overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="Bill preview"
            className="w-full max-h-72 object-contain bg-bg-line-2"
          />
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <span className="text-sm text-ink truncate">{selectedFile.name}</span>
            <button
              type="button"
              onClick={handleRemove}
              className="text-xs text-red font-semibold shrink-0 hover:underline"
            >
              Remove
            </button>
          </div>
        </div>
      )}

      {/* Analyze button */}
      {selectedFile && !ocrMeta && (
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={ocrLoading}
          className="w-full rounded-xl bg-green text-white font-semibold py-3 text-sm transition-opacity disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 flex items-center justify-center gap-2"
        >
          {ocrLoading ? (
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
              Reading your bill...
            </>
          ) : (
            "Analyze Bill"
          )}
        </button>
      )}

      {/* OCR loading state (full spinner below button) */}
      {ocrLoading && <Spinner label="Reading your bill..." />}

      {/* OCR error */}
      {ocrError && (
        <div className="rounded-2xl border border-red bg-red-pale px-4 py-4 space-y-1">
          <p className="text-sm font-semibold text-red">Could not read bill</p>
          <p className="text-xs text-ink-2">{ocrError}</p>
          <p className="text-xs text-ink-3 mt-1">
            Try the{" "}
            <button
              type="button"
              className="underline underline-offset-2 text-ink-2 font-medium"
              onClick={() => {
                /* parent handles tab switch — users can click the Manual Entry tab */
              }}
            >
              Manual Entry
            </button>{" "}
            tab to enter items by hand.
          </p>
        </div>
      )}

      {/* OCR success — extracted items review table */}
      {ocrMeta && !ocrLoading && (
        <div className="space-y-4">
          {/* Restaurant / meta strip */}
          {(ocrMeta.restaurantName || ocrMeta.totalAmount > 0) && (
            <div className="rounded-xl border border-line bg-white px-4 py-3 flex flex-wrap gap-4 text-sm">
              {ocrMeta.restaurantName && (
                <span className="text-ink-2">
                  <span className="font-semibold text-ink">Restaurant:</span>{" "}
                  {ocrMeta.restaurantName}
                </span>
              )}
              {ocrMeta.totalAmount > 0 && (
                <span className="text-ink-2">
                  <span className="font-semibold text-ink">Bill total:</span>{" "}
                  &#8377;{ocrMeta.totalAmount}
                </span>
              )}
            </div>
          )}

          {/* GST warning */}
          {gstWarning && (
            <div className="rounded-xl border border-red bg-red-pale px-4 py-3">
              <p className="text-sm font-semibold text-red">
                GST overcharge detected
              </p>
              <p className="text-xs text-ink-2 mt-0.5">
                Bill shows {ocrMeta.gstPercent}% GST. IRCTC maximum allowed is{" "}
                {IRCTC_MAX_GST}%. You may be overcharged on tax.
              </p>
            </div>
          )}

          {/* Service charge warning */}
          {ocrMeta.serviceChargePct > 0 && (
            <div className="rounded-xl border border-amber-500 bg-amber-pale px-4 py-3">
              <p className="text-sm font-semibold text-amber-700">
                Service charge found: {ocrMeta.serviceChargePct}%
              </p>
              <p className="text-xs text-ink-2 mt-0.5">
                Service charges are not mandatory. You are not legally obligated
                to pay them.
              </p>
            </div>
          )}

          {/* Editable items table */}
          {editableItems.length > 0 ? (
            <div className="rounded-2xl border border-line bg-white overflow-hidden">
              <div className="grid grid-cols-[1fr_auto_auto] gap-x-3 px-4 py-2 bg-bg-line-2 text-xs font-semibold text-ink-3 uppercase tracking-wide">
                <span>Item Name</span>
                <span className="text-right">Price on Bill (&#8377;)</span>
                <span />
              </div>
              {editableItems.map((item, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-[1fr_auto_auto] gap-x-3 px-4 py-2.5 border-t border-line items-center"
                >
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleItemNameChange(idx, e.target.value)
                    }
                    className="text-sm text-ink bg-transparent border-b border-dashed border-line focus:border-green focus:outline-none py-0.5 w-full transition-colors"
                    placeholder="Item name"
                  />
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-ink-3 pointer-events-none">
                      &#8377;
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={item.chargedPrice === 0 ? "" : item.chargedPrice}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleItemPriceChange(idx, e.target.value)
                      }
                      className="w-24 text-sm text-ink bg-transparent border-b border-dashed border-line focus:border-green focus:outline-none pl-5 pr-1 py-0.5 text-right transition-colors"
                      placeholder="0"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveEditableItem(idx)}
                    className="text-red hover:text-red/70 transition-colors"
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
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18 18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-ink-3 text-center py-4">
              No items extracted. Try Manual Entry.
            </p>
          )}

          {/* Check error */}
          {checkError && (
            <p className="text-sm text-red bg-red-pale rounded-xl px-4 py-3">
              {checkError}
            </p>
          )}

          {/* Check items button */}
          {editableItems.length > 0 && (
            <button
              type="button"
              onClick={handleCheckOCRItems}
              disabled={checkLoading}
              className="w-full rounded-xl bg-green text-white font-semibold py-3 text-sm transition-opacity disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-90 flex items-center justify-center gap-2"
            >
              {checkLoading ? (
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
                "Check These Items"
              )}
            </button>
          )}

          {/* Result */}
          {checkResult && <ResultCard data={checkResult} />}
        </div>
      )}
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
