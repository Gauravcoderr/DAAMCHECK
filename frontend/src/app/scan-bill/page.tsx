"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { checkIRCTCItems } from "@/lib/api";
import { Alert, AlertDescription } from "@/components/ui/alert";

// ─── Types ────────────────────────────────────────────────────────────────────

type ManualItem = { name: string; chargedPrice: number; qty?: number };

type CheckResult = {
  name: string;
  chargedPrice: number;
  qty: number;
  totalCharged: number;
  maxPrice: number | null;
  matchedName: string | null;
  status: "ok" | "overcharged" | "unknown";
  overcharge: number;
};

type CheckResponse = {
  results: CheckResult[];
  totalOvercharge: number;
  legal: boolean;
  complaintNumber: string;
};

type OCRSuccess = {
  items: { name: string; price: number; qty?: number }[];
  gstPercent: number;
  serviceChargePct: number;
  restaurantName: string | null;
  totalAmount: number;
  isIRCTC: boolean;
};

type DisplayRow = {
  name: string;
  chargedPrice: number;
  note: string;
  statusLabel: "Legal" | "Illegal" | "Banned" | "Unknown";
};

type DisplayResult = {
  restaurantName: string | null;
  rows: DisplayRow[];
  totalOvercharge: number;
  detail: string;
  legal: boolean;
  complaintRef: string;
};

// ─── Demo data ────────────────────────────────────────────────────────────────

const DEMO: DisplayResult = {
  restaurantName: "Karim's Restaurant, Connaught Place",
  rows: [
    { name: "Chicken Biryani × 2", chargedPrice: 480, note: "Food item", statusLabel: "Legal" },
    { name: "GST @ 18%", chargedPrice: 86.40, note: "Should be 5%", statusLabel: "Illegal" },
    { name: "Service Charge @ 10%", chargedPrice: 48.00, note: "CCPA 2022 — banned", statusLabel: "Banned" },
  ],
  totalOvercharge: 110.40,
  detail: "GST overage ₹62.40 + service charge ₹48.00",
  legal: false,
  complaintRef: "consumerhelpline.gov.in",
};

const IRCTC_ITEMS: string[] = [
  "Veg Thali", "Non-Veg Thali", "Dal Makhani + Roti (4 pcs)", "Rajma Chawal",
  "Veg Fried Rice", "Chole Bhature", "Idli (4 pcs)", "Vada (2 pcs)",
  "Upma 250g", "Poha 250g", "Masala Dosa", "Bread Toast (4 slices)",
  "Tea 150ml", "Coffee 150ml", "Milk 200ml", "Mineral Water 1L",
  "Packaged Juice 200ml", "Omelette (2 eggs)", "Samosa (2 pcs)",
  "Bread Pakoda (2 pcs)", "Veg Puff", "Cookies 100g",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toDisplayResult(res: CheckResponse, restaurantName?: string | null): DisplayResult {
  const rows: DisplayRow[] = res.results.map((r) => {
    const qtyLabel = r.qty > 1 ? ` × ${r.qty}` : "";
    const matchLabel = r.matchedName ? ` (matched: ${r.matchedName})` : "";
    let note = "";
    if (r.status === "unknown") note = "Not in IRCTC price list";
    else if (r.status === "overcharged") {
      const perUnit = r.chargedPrice - (r.maxPrice ?? 0);
      note = r.qty > 1
        ? `Max ₹${r.maxPrice}/meal${matchLabel} — ₹${perUnit.toFixed(0)} over × ${r.qty} = ₹${r.overcharge.toFixed(0)} total`
        : `Max ₹${r.maxPrice}/meal${matchLabel} — overcharged ₹${r.overcharge.toFixed(0)}`;
    }
    else note = `Within limit ₹${r.maxPrice}/meal${matchLabel}`;
    return {
      name: `${r.name}${qtyLabel}`,
      chargedPrice: r.totalCharged ?? r.chargedPrice,
      note,
      statusLabel: r.status === "ok" ? "Legal" : r.status === "overcharged" ? "Illegal" : "Unknown",
    };
  });
  return {
    restaurantName: restaurantName ?? null,
    rows,
    totalOvercharge: res.totalOvercharge,
    detail: `Total overcharged on IRCTC bill`,
    legal: res.legal,
    complaintRef: res.complaintNumber,
  };
}

// ─── Status chip ──────────────────────────────────────────────────────────────

function Chip({ label }: { label: DisplayRow["statusLabel"] }) {
  const base = "inline-block text-[11px] font-bold uppercase tracking-[.06em] px-2 py-[3px] rounded";
  if (label === "Legal") return <span className={`${base} bg-green-pale text-green-dark`}>Legal</span>;
  if (label === "Illegal") return <span className={`${base} bg-red-pale text-red`}>Illegal</span>;
  if (label === "Banned") return <span className={`${base} bg-red-pale text-red`}>Banned</span>;
  return <span className={`${base} bg-amber-pale text-amber`}>Unknown</span>;
}

// ─── Shared classes ───────────────────────────────────────────────────────────

const cardHdrCls = "px-5 py-3 border-b border-line bg-line-3 text-xs font-bold text-ink-2 uppercase tracking-[.06em]";

// ─── Results ──────────────────────────────────────────────────────────────────

function Results({ data }: { data: DisplayResult }) {
  return (
    <div className="mt-6 space-y-3">
      {data.restaurantName && (
        <p className="text-[11px] font-bold text-ink-3 uppercase tracking-[.08em]">
          Results — {data.restaurantName}
        </p>
      )}

      <div className="border-[1.5px] border-line rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] bg-white">
            <thead className="bg-line-3 border-b-[1.5px] border-line">
              <tr>
                <th className="px-[18px] py-[10px] text-[11px] font-bold text-ink-4 uppercase tracking-[.08em] text-left">Item</th>
                <th className="px-[18px] py-[10px] text-[11px] font-bold text-ink-4 uppercase tracking-[.08em] text-right">Charged</th>
                <th className="px-[18px] py-[10px] text-[11px] font-bold text-ink-4 uppercase tracking-[.08em] text-left">Note</th>
                <th className="px-[18px] py-[10px] text-[11px] font-bold text-ink-4 uppercase tracking-[.08em] text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((r, i) => (
                <tr key={i} className="border-b border-line-3 last:border-0">
                  <td className="px-[18px] py-3 text-sm text-ink">{r.name}</td>
                  <td className={`px-[18px] py-3 text-sm font-semibold font-tabular text-right ${r.statusLabel !== "Legal" ? "text-red" : "text-ink"}`}>
                    ₹{r.chargedPrice}
                  </td>
                  <td className="px-[18px] py-3 text-xs text-ink-4">{r.note}</td>
                  <td className="px-[18px] py-3 text-right"><Chip label={r.statusLabel} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {!data.legal && (
        <div className="space-y-2">
          <div className="flex justify-between items-center flex-wrap gap-3 px-[22px] py-[18px] bg-red-pale border-[1.5px] border-[#FCA5A5] rounded-2xl">
            <div>
              <p className="text-[15px] font-bold text-[#7F1D1D]">Possible overcharge detected</p>
              <p className="text-[11px] text-[#B91C1C] mt-0.5">{data.detail} — verify before acting</p>
            </div>
            <span className="text-[30px] font-black tracking-tight2 text-red font-tabular">₹{data.totalOvercharge}</span>
          </div>
          <p className="text-[11px] text-ink-4 px-1">These results are indicative only. Cross-check amounts on your physical bill before filing a complaint. IRCTC prices are based on Railway Board circulars — verify current rates at irctc.co.in.</p>
        </div>
      )}

      {data.legal && (
        <div className="flex justify-between items-center px-[22px] py-[18px] bg-green-pale border-[1.5px] border-green-mid rounded-2xl">
          <p className="text-[15px] font-bold text-[#065F46]">Bill looks correct</p>
          <span className="text-[30px] font-black text-green font-tabular">₹0</span>
        </div>
      )}

      {!data.legal && (
        <div className="flex gap-2.5 flex-wrap">
          <a
            href="https://consumerhelpline.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center bg-green hover:bg-green-dark text-white font-bold text-[15px] rounded-full px-6 py-3 transition-all hover:shadow-[0_6px_20px_rgba(5,150,105,.35)]"
          >
            File complaint — NCH
          </a>
          <a
            href="https://www.india.gov.in/category/justice-law-grievances/subcategory/courts-tribunals/details/e-daakhil-portal"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center bg-white border-2 border-line hover:bg-line-2 text-ink font-bold text-[15px] rounded-full px-6 py-3 transition-all"
          >
            eDaakhil format
          </a>
        </div>
      )}
    </div>
  );
}

// ─── Upload Tab ───────────────────────────────────────────────────────────────

function UploadSection({ onDemoLoad }: { onDemoLoad: () => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [ocrMeta, setOcrMeta] = useState<OCRSuccess | null>(null);
  const [editableItems, setEditableItems] = useState<{ name: string; chargedPrice: number; qty: number }[]>([]);
  const [qualityWarning, setQualityWarning] = useState<string | null>(null);
  const qualityCheckCancelledRef = useRef(false);

  const ocrMutation = useMutation({
    mutationFn: async (file: File): Promise<OCRSuccess> => {
      // Compress image client-side: max 1400px, JPEG 0.85, send as multipart
      // FormData avoids ~33% base64 size inflation vs JSON body
      const blob: Blob = await new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
          URL.revokeObjectURL(url);
          const MAX = 1400;
          const scale = Math.min(1, MAX / Math.max(img.width, img.height));
          const canvas = document.createElement("canvas");
          canvas.width = Math.round(img.width * scale);
          canvas.height = Math.round(img.height * scale);
          const ctx = canvas.getContext("2d");
          if (!ctx) { reject(new Error("Canvas not supported")); return; }
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((b) => {
            if (!b) { reject(new Error("Compression failed")); return; }
            resolve(b);
          }, "image/jpeg", 0.85);
        };
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = url;
      });
      const form = new FormData();
      form.append("image", blob, "bill.jpg");
      const res = await fetch("/api/ocr", { method: "POST", body: form });
      if (!res.ok) throw new Error(`OCR service error ${res.status}`);
      const data = await res.json();
      if ("error" in data) throw new Error(data.error);
      return data as OCRSuccess;
    },
    onSuccess: (data) => {
      setOcrMeta(data);
      setEditableItems(data.items.map((it) => ({ name: it.name, chargedPrice: it.price, qty: Math.max(1, it.qty ?? 1) })));
    },
  });

  const checkMutation = useMutation({
    mutationFn: (items: { name: string; chargedPrice: number; qty: number }[]) =>
      checkIRCTCItems(items) as Promise<CheckResponse>,
  });

  function applyFile(file: File) {
    const previewObj = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewUrl(previewObj);
    setOcrMeta(null);
    setEditableItems([]);
    setQualityWarning(null);
    qualityCheckCancelledRef.current = false;
    ocrMutation.reset();
    checkMutation.reset();
    // Fix 5: image quality preflight — warn if too blurry/small before OCR call
    const img = new Image();
    img.onload = () => {
      if (qualityCheckCancelledRef.current) return; // file removed before load completed
      const MAX = 1400;
      const scale = Math.min(1, MAX / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      if (w < 300 || h < 300) { setQualityWarning("Very low resolution — results may be inaccurate. Use a closer, higher-res photo."); return; }
      const canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, w, h);
      const pixels = ctx.getImageData(0, 0, w, h).data;
      let sum = 0, sumSq = 0, count = 0;
      for (let i = 0; i < pixels.length; i += 4 * 8) {
        const lum = pixels[i] * 0.299 + pixels[i + 1] * 0.587 + pixels[i + 2] * 0.114;
        sum += lum; sumSq += lum * lum; count++;
      }
      const variance = count > 0 ? sumSq / count - (sum / count) ** 2 : 999;
      if (variance < 80) setQualityWarning("Photo looks too dark or blurry — better lighting improves accuracy.");
    };
    img.src = previewObj;
  }

  function handleRemoveFile() {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setOcrMeta(null);
    setEditableItems([]);
    setQualityWarning(null);
    qualityCheckCancelledRef.current = true;
    ocrMutation.reset();
    checkMutation.reset();
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const displayResult = checkMutation.data
    ? toDisplayResult(checkMutation.data as CheckResponse, ocrMeta?.restaurantName)
    : null;

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf"
        className="hidden"
        title="Upload bill photo"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) applyFile(f); }}
      />

      {!selectedFile && (
        <div
          onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files?.[0]; if (f) applyFile(f); }}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          className={`rounded-[20px] border-2 border-dashed px-10 py-16 text-center transition-all cursor-pointer group/zone ${
            isDragging ? "border-green bg-green-pale" : "border-line bg-line-3 hover:border-green hover:bg-green-pale"
          }`}
        >
          <div className="w-[60px] h-[60px] bg-white rounded-[14px] border-[1.5px] border-line flex items-center justify-center mx-auto mb-[18px]">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-ink-3">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <h3 className="text-[19px] font-extrabold text-ink tracking-tight mb-1.5">Upload bill photo</h3>
          <p className="text-sm text-ink-3 mb-[22px]">JPG, PNG or PDF · Max 10MB</p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 bg-green hover:bg-green-dark text-white font-bold text-base rounded-full px-9 py-[15px] transition-all hover:shadow-[0_6px_20px_rgba(5,150,105,.35)] active:scale-[.97]"
          >
            Choose file
          </button>
        </div>
      )}

      {selectedFile && previewUrl && (
        <div className="border-[1.5px] border-line rounded-2xl overflow-hidden bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewUrl} alt="Bill preview" className="w-full max-h-72 object-contain bg-line-2" />
          <div className="px-5 py-3 flex items-center justify-between gap-3 border-t border-line">
            <span className="text-sm text-ink truncate">{selectedFile.name}</span>
            <button type="button" onClick={handleRemoveFile} className="text-sm font-semibold text-red hover:text-red/70 transition shrink-0">Remove</button>
          </div>
        </div>
      )}

      {selectedFile && !ocrMeta && qualityWarning && (
        <div className="mt-4 flex items-center gap-2 px-4 py-2.5 bg-amber-pale border border-amber rounded-xl text-[13px] text-amber font-semibold">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {qualityWarning}
        </div>
      )}

      {selectedFile && !ocrMeta && (
        <button
          type="button"
          onClick={() => ocrMutation.mutate(selectedFile)}
          disabled={ocrMutation.isPending}
          className="mt-4 w-full bg-green hover:bg-green-dark disabled:opacity-50 text-white font-bold text-base rounded-full py-[15px] transition-all hover:shadow-[0_6px_20px_rgba(5,150,105,.35)] active:scale-[.97]"
        >
          {ocrMutation.isPending ? "Reading your bill..." : "Analyze Bill"}
        </button>
      )}

      {ocrMutation.isError && (
        <Alert variant="destructive" className="mt-4">
          <AlertDescription>
            {ocrMutation.error instanceof Error ? ocrMutation.error.message : "Could not read bill."}{" "}
            Try the manual entry option below.
          </AlertDescription>
        </Alert>
      )}

      {ocrMeta && !ocrMutation.isPending && ocrMeta.isIRCTC && (
        <div className="mt-4 flex items-center gap-2 px-4 py-2.5 bg-amber-pale border border-amber rounded-xl text-[13px] text-amber font-semibold">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          IRCTC bill detected — checking against railway price caps (no GST applies, reverse charge basis)
        </div>
      )}

      {ocrMeta && !ocrMutation.isPending && editableItems.length > 0 && (
        <div className="mt-4 space-y-4">
          <div className="border-[1.5px] border-line rounded-2xl overflow-hidden">
            <div className={cardHdrCls}>Extracted items — edit if needed</div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[360px] bg-white">
                <thead className="bg-line-3 border-b-[1.5px] border-line">
                  <tr>
                    <th className="px-[18px] py-[10px] text-[11px] font-bold text-ink-4 uppercase tracking-[.08em] text-left">Item</th>
                    <th className="px-[14px] py-[10px] text-[11px] font-bold text-ink-4 uppercase tracking-[.08em] text-center w-16">Qty</th>
                    <th className="px-[18px] py-[10px] text-[11px] font-bold text-ink-4 uppercase tracking-[.08em] text-right">Unit Price</th>
                    <th className="px-[18px] py-[10px] text-[11px] font-bold text-ink-4 uppercase tracking-[.08em] text-right w-24">Total</th>
                    <th className="px-[18px] py-[10px] w-10"><span className="sr-only">Remove</span></th>
                  </tr>
                </thead>
                <tbody>
                  {editableItems.map((item, idx) => (
                    <tr key={idx} className="border-b border-line-3 last:border-0">
                      <td className="px-[18px] py-2">
                        <input
                          type="text"
                          title={`Item name ${idx + 1}`}
                          value={item.name}
                          onChange={(e) => { setEditableItems((p) => p.map((it, i) => i === idx ? { ...it, name: e.target.value } : it)); checkMutation.reset(); }}
                          className="text-sm text-ink bg-transparent border-b border-dashed border-line focus:border-green focus:outline-none py-0.5 w-full"
                        />
                      </td>
                      <td className="px-[14px] py-2 text-center">
                        <input
                          type="number"
                          min="1"
                          step="1"
                          title={`Quantity for item ${idx + 1}`}
                          value={item.qty}
                          onChange={(e) => { const v = parseInt(e.target.value); setEditableItems((p) => p.map((it, i) => i === idx ? { ...it, qty: isNaN(v) || v < 1 ? 1 : v } : it)); checkMutation.reset(); }}
                          className="w-12 text-sm text-ink bg-transparent border-b border-dashed border-line focus:border-green focus:outline-none px-1 py-0.5 text-center font-tabular"
                        />
                      </td>
                      <td className="px-[18px] py-2 text-right">
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          title={`Unit price for item ${idx + 1}`}
                          value={item.chargedPrice === 0 ? "" : item.chargedPrice}
                          onChange={(e) => { const v = parseFloat(e.target.value); setEditableItems((p) => p.map((it, i) => i === idx ? { ...it, chargedPrice: isNaN(v) ? 0 : v } : it)); checkMutation.reset(); }}
                          className="w-20 text-sm text-ink bg-transparent border-b border-dashed border-line focus:border-green focus:outline-none px-1 py-0.5 text-right font-tabular"
                        />
                      </td>
                      <td className="px-[18px] py-2 text-right text-sm text-ink-3 font-tabular">
                        ₹{(item.chargedPrice * item.qty).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-[18px] py-2 text-center">
                        <button type="button" onClick={() => { setEditableItems((p) => p.filter((_, i) => i !== idx)); checkMutation.reset(); }} className="text-red hover:text-red/70" aria-label={`Remove ${item.name}`}>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <button
            type="button"
            onClick={() => checkMutation.mutate(editableItems)}
            disabled={checkMutation.isPending}
            className="w-full bg-green hover:bg-green-dark disabled:opacity-50 text-white font-bold text-base rounded-full py-[15px] transition-all hover:shadow-[0_6px_20px_rgba(5,150,105,.35)] active:scale-[.97]"
          >
            {checkMutation.isPending ? "Checking..." : "Check These Items"}
          </button>
          {checkMutation.isError && (
            <Alert variant="destructive"><AlertDescription>Failed to check items.</AlertDescription></Alert>
          )}
        </div>
      )}

      {displayResult && <Results data={displayResult} />}

      {/* Demo / manual links */}
      {!selectedFile && !displayResult && (
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={onDemoLoad}
            className="text-green font-semibold text-[13px] hover:underline transition"
          >
            Load a demo bill →
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Manual Entry ─────────────────────────────────────────────────────────────

function ManualSection() {
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [items, setItems] = useState<ManualItem[]>([]);

  const checkMutation = useMutation({
    mutationFn: (list: ManualItem[]) => checkIRCTCItems(list) as Promise<CheckResponse>,
  });

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const name = itemName.trim();
    const price = parseFloat(itemPrice);
    if (!name || isNaN(price) || price <= 0) return;
    setItems((p) => [...p, { name, chargedPrice: price }]);
    setItemName("");
    setItemPrice("");
    checkMutation.reset();
  }

  const displayResult = checkMutation.data ? toDisplayResult(checkMutation.data as CheckResponse) : null;

  return (
    <div className="space-y-5">
      <datalist id="irctc-items">
        {IRCTC_ITEMS.map((item) => <option key={item} value={item} />)}
      </datalist>

      <div className="bg-white border-[1.5px] border-line rounded-[18px] overflow-hidden">
        <div className={cardHdrCls}>Add an item</div>
        <form onSubmit={handleAdd} className="p-6 flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1">
            <label htmlFor="item-name" className="block text-xs font-bold text-ink-2 uppercase tracking-[.05em] mb-2">Item name</label>
            <input
              id="item-name"
              type="text"
              list="irctc-items"
              placeholder='e.g. "Veg Thali"'
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="w-full bg-line-3 border-[1.5px] border-line rounded-lg px-3.5 py-3 text-base text-ink outline-none focus:border-green focus:shadow-[0_0_0_3px_rgba(5,150,105,.12)] focus:bg-white transition-all"
            />
          </div>
          <div className="w-full sm:w-36">
            <label htmlFor="item-price" className="block text-xs font-bold text-ink-2 uppercase tracking-[.05em] mb-2">Price (₹)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[15px] font-semibold text-ink-4 pointer-events-none">₹</span>
              <input
                id="item-price"
                type="number"
                min="0"
                step="0.5"
                placeholder="0"
                value={itemPrice}
                onChange={(e) => setItemPrice(e.target.value)}
                className="w-full bg-line-3 border-[1.5px] border-line rounded-lg pl-8 pr-3.5 py-3 text-base text-ink outline-none focus:border-green focus:shadow-[0_0_0_3px_rgba(5,150,105,.12)] focus:bg-white transition-all font-tabular"
              />
            </div>
          </div>
          <button type="submit" className="shrink-0 bg-ink hover:bg-ink-2 text-white font-bold text-sm rounded-full px-6 py-3 transition-all active:scale-[.97]">Add</button>
        </form>
      </div>

      {items.length > 0 && (
        <>
          <div className="border-[1.5px] border-line rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[320px] bg-white">
                <thead className="bg-line-3 border-b-[1.5px] border-line">
                  <tr>
                    <th className="px-[18px] py-[10px] text-[11px] font-bold text-ink-4 uppercase tracking-[.08em] text-left">Item</th>
                    <th className="px-[18px] py-[10px] text-[11px] font-bold text-ink-4 uppercase tracking-[.08em] text-right">Charged</th>
                    <th className="px-[18px] py-[10px] w-10"><span className="sr-only">Remove</span></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={idx} className="border-b border-line-3 last:border-0">
                      <td className="px-[18px] py-3 text-sm text-ink">{item.name}</td>
                      <td className="px-[18px] py-3 text-sm font-semibold font-tabular text-ink text-right">₹{item.chargedPrice}</td>
                      <td className="px-[18px] py-3 text-center">
                        <button type="button" onClick={() => { setItems((p) => p.filter((_, i) => i !== idx)); checkMutation.reset(); }} className="text-red hover:text-red/70" aria-label={`Remove ${item.name}`}>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <button
            type="button"
            onClick={() => checkMutation.mutate(items)}
            disabled={checkMutation.isPending}
            className="w-full bg-green hover:bg-green-dark disabled:opacity-50 text-white font-bold text-base rounded-full py-[15px] transition-all hover:shadow-[0_6px_20px_rgba(5,150,105,.35)] active:scale-[.97]"
          >
            {checkMutation.isPending ? "Checking..." : "Check Items"}
          </button>
          {checkMutation.isError && <Alert variant="destructive"><AlertDescription>Failed to check items.</AlertDescription></Alert>}
        </>
      )}

      {displayResult && <Results data={displayResult} />}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ScanBillPage() {
  const [activeTab, setActiveTab] = useState<0 | 1>(0);
  const [demoResult, setDemoResult] = useState<DisplayResult | null>(null);

  return (
    <div className="min-h-screen bg-[#faf9f5]">
      <div className="max-w-[1160px] mx-auto px-6 md:px-10 py-12">

        <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-3 hover:text-ink transition mb-5">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="8,2 4,6 8,10" /></svg>
          Back
        </Link>

        <div className="mb-10">
          <h1 className="text-[clamp(28px,4vw,42px)] font-black tracking-tight3 text-ink leading-[1.1] mb-2">Scan Your Bill</h1>
          <p className="text-[17px] text-ink-3">Upload a photo of any food bill. Every item checked against IRCTC caps, GST rules, and the service charge ban.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_340px] gap-6">

          {/* Left */}
          <div>
            {/* Tab pills */}
            <div className="flex gap-2 mb-6">
              {(["Upload Photo", "Manual Entry"] as const).map((label, idx) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => { setActiveTab(idx as 0 | 1); setDemoResult(null); }}
                  className={`px-[18px] py-2 rounded-full text-sm font-bold border-[1.5px] transition-all ${
                    activeTab === idx ? "bg-ink text-white border-ink" : "bg-white text-ink-2 border-line hover:bg-line-2"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {activeTab === 0 ? (
              <>
                <UploadSection onDemoLoad={() => setDemoResult(DEMO)} />
                {demoResult && <Results data={demoResult} />}
              </>
            ) : (
              <ManualSection />
            )}
          </div>

          {/* Right — info card */}
          <div>
            <div className="bg-white border-[1.5px] border-line rounded-[18px] overflow-hidden">
              <div className="px-5 py-3 border-b border-line bg-line-3 text-xs font-bold text-ink-2 uppercase tracking-[.06em]">What we check</div>
              <div>
                {[
                  { color: "bg-green", title: "GST rate", body: "Against CGST slabs — 5% or 18% based on hotel room rate." },
                  { color: "bg-red", title: "Service charge", body: "Any service charge = CCPA 2022 violation. Always flagged." },
                  { color: "bg-amber", title: "IRCTC item prices", body: "For train bills — each item vs the official IRCTC maximum price list." },
                ].map((r, i, arr) => (
                  <div key={i} className={`flex gap-3 px-5 py-3.5 ${i < arr.length - 1 ? "border-b border-line-2" : ""}`}>
                    <div className={`w-[3px] rounded-[3px] self-stretch min-h-8 flex-shrink-0 ${r.color}`} />
                    <div className="text-[13px] text-ink-3 leading-relaxed">
                      <strong className="block text-[14px] font-bold text-ink mb-0.5">{r.title}</strong>
                      {r.body}
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-5 py-2.5 text-[11px] text-ink-4 border-t border-line bg-line-3">
                OCR: NVIDIA nemotron-nano → phi-3-vision → Gemini Flash → PaddleOCR
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
