"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { checkIRCTCItems } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

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

type OCRSuccess = {
  items: { name: string; price: number }[];
  gstPercent: number;
  serviceChargePct: number;
  restaurantName: string | null;
  totalAmount: number;
};

type EditableOCRItem = { name: string; chargedPrice: number };

const IRCTC_ITEMS: string[] = [
  "Veg Thali", "Non-Veg Thali", "Dal Makhani + Roti (4 pcs)", "Rajma Chawal",
  "Veg Fried Rice", "Chole Bhature", "Idli (4 pcs)", "Vada (2 pcs)",
  "Upma 250g", "Poha 250g", "Masala Dosa", "Bread Toast (4 slices)",
  "Tea 150ml", "Coffee 150ml", "Milk 200ml", "Mineral Water 1L",
  "Packaged Juice 200ml", "Omelette (2 eggs)", "Samosa (2 pcs)",
  "Bread Pakoda (2 pcs)", "Veg Puff", "Cookies 100g",
];

const IRCTC_MAX_GST = 5;

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ result }: { result: CheckResult }) {
  if (result.status === "ok")
    return <Badge className="bg-green-pale text-green hover:bg-green-pale">OK</Badge>;
  if (result.status === "overcharged")
    return <Badge className="bg-red-pale text-red hover:bg-red-pale">+₹{result.overcharge}</Badge>;
  return <Badge className="bg-amber-pale text-amber hover:bg-amber-pale">Unknown</Badge>;
}

// ─── Results ──────────────────────────────────────────────────────────────────

function ResultTable({ data }: { data: CheckResponse }) {
  return (
    <div className="mt-6 space-y-4">
      <Card>
        <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-4 px-4 py-2.5 bg-line-2 text-xs font-semibold text-ink-3 uppercase tracking-wide border-b border-line">
          <span>Item</span>
          <span className="text-right">Charged</span>
          <span className="text-right">Max</span>
          <span className="text-right">Status</span>
        </div>
        {data.results.map((r, idx) => (
          <div key={idx} className="grid grid-cols-[1fr_auto_auto_auto] gap-x-4 px-4 py-3 border-b border-line last:border-0 items-center">
            <span className="text-sm text-ink font-medium">{r.name}</span>
            <span className="text-sm text-ink-2 text-right">₹{r.chargedPrice}</span>
            <span className="text-sm text-ink-3 text-right">{r.maxPrice !== null ? `₹${r.maxPrice}` : "—"}</span>
            <div className="flex justify-end"><StatusBadge result={r} /></div>
          </div>
        ))}
      </Card>

      <Card className={data.legal ? "border-green-mid bg-green-pale" : "border-red bg-red-pale"}>
        <CardContent className="pt-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-ink">
                {data.legal ? "Bill looks correct" : "Overcharging detected"}
              </p>
              {!data.legal && (
                <p className="text-sm text-ink-2 mt-0.5">
                  Total overcharge: <span className="font-bold text-red">₹{data.totalOvercharge}</span>
                </p>
              )}
            </div>
            <span className={`text-2xl font-black ${data.legal ? "text-green" : "text-red"}`}>
              {data.legal ? "✓" : "✗"}
            </span>
          </div>

          {!data.legal && (
            <div className="mt-4 pt-4 border-t border-red/20">
              <p className="text-xs font-semibold text-ink-2 uppercase tracking-wide mb-1">File a complaint</p>
              <p className="text-sm text-ink-2">
                Call IRCTC helpline:{" "}
                <a href={`tel:${data.complaintNumber}`} className="font-bold text-red underline underline-offset-2">
                  {data.complaintNumber}
                </a>
              </p>
              <p className="text-xs text-ink-3 mt-1">Also: pgportal.gov.in or Rail Madad app.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Upload Tab ───────────────────────────────────────────────────────────────

function UploadTab() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [ocrMeta, setOcrMeta] = useState<OCRSuccess | null>(null);
  const [editableItems, setEditableItems] = useState<EditableOCRItem[]>([]);

  const ocrMutation = useMutation({
    mutationFn: async (file: File): Promise<OCRSuccess> => {
      const base64: string = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(file);
      });
      const res = await fetch("/api/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64 }),
      });
      const data = await res.json();
      if ("error" in data) throw new Error(data.error);
      return data as OCRSuccess;
    },
    onSuccess: (data) => {
      setOcrMeta(data);
      setEditableItems(data.items.map((it) => ({ name: it.name, chargedPrice: it.price })));
    },
  });

  const checkMutation = useMutation({
    mutationFn: (items: EditableOCRItem[]) =>
      checkIRCTCItems(items) as Promise<CheckResponse>,
  });

  function applyFile(file: File) {
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setOcrMeta(null);
    setEditableItems([]);
    ocrMutation.reset();
    checkMutation.reset();
  }

  function handleRemoveFile() {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setOcrMeta(null);
    setEditableItems([]);
    ocrMutation.reset();
    checkMutation.reset();
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const gstWarning = ocrMeta && ocrMeta.gstPercent > IRCTC_MAX_GST;

  return (
    <div className="space-y-4">
      {!selectedFile && (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files?.[0]; if (f) applyFile(f); }}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          className={`cursor-pointer rounded-2xl border-2 border-dashed p-10 flex flex-col items-center gap-3 select-none transition-colors ${
            isDragging ? "border-green bg-green-pale" : "border-line hover:border-green-mid hover:bg-green-pale/30"
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-ink-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5v-9m0 0-3 3m3-3 3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.338-2.334A4.5 4.5 0 0 1 17.25 19.5H6.75Z" />
          </svg>
          <p className="text-base font-semibold text-ink">Drop your bill photo here</p>
          <p className="text-sm text-ink-3 text-center">or click to browse — JPG, PNG, PDF</p>
          <input ref={fileInputRef} type="file" accept="image/*,.pdf" className="hidden" title="Upload bill photo" onChange={(e) => { const f = e.target.files?.[0]; if (f) applyFile(f); }} />
        </div>
      )}

      {selectedFile && previewUrl && (
        <Card className="overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewUrl} alt="Bill preview" className="w-full max-h-72 object-contain bg-line-2" />
          <CardContent className="py-3 flex items-center justify-between gap-3">
            <span className="text-sm text-ink truncate">{selectedFile.name}</span>
            <Button variant="ghost" size="sm" onClick={handleRemoveFile} className="text-red hover:text-red shrink-0 h-auto py-1">
              Remove
            </Button>
          </CardContent>
        </Card>
      )}

      {selectedFile && !ocrMeta && (
        <Button
          onClick={() => ocrMutation.mutate(selectedFile)}
          disabled={ocrMutation.isPending}
          className="w-full bg-green hover:bg-green-dark text-white font-semibold h-11 rounded-xl"
        >
          {ocrMutation.isPending ? "Reading your bill..." : "Analyze Bill"}
        </Button>
      )}

      {ocrMutation.isError && (
        <Alert variant="destructive">
          <AlertDescription>
            {ocrMutation.error instanceof Error ? ocrMutation.error.message : "Could not read bill."}{" "}
            <span className="text-xs">Try the Manual Entry tab instead.</span>
          </AlertDescription>
        </Alert>
      )}

      {ocrMeta && !ocrMutation.isPending && (
        <div className="space-y-4">
          {(ocrMeta.restaurantName || ocrMeta.totalAmount > 0) && (
            <Card>
              <CardContent className="py-3 flex flex-wrap gap-4 text-sm">
                {ocrMeta.restaurantName && (
                  <span className="text-ink-2"><span className="font-semibold text-ink">Restaurant:</span> {ocrMeta.restaurantName}</span>
                )}
                {ocrMeta.totalAmount > 0 && (
                  <span className="text-ink-2"><span className="font-semibold text-ink">Bill total:</span> ₹{ocrMeta.totalAmount}</span>
                )}
              </CardContent>
            </Card>
          )}

          {gstWarning && (
            <Alert variant="destructive">
              <AlertDescription>
                Bill shows {ocrMeta.gstPercent}% GST. IRCTC max is {IRCTC_MAX_GST}%. Possible tax overcharge.
              </AlertDescription>
            </Alert>
          )}

          {ocrMeta.serviceChargePct > 0 && (
            <Alert className="border-amber bg-amber-pale text-amber">
              <AlertDescription className="text-ink-2">
                Service charge {ocrMeta.serviceChargePct}% found — not mandatory. You are not legally obligated to pay it.
              </AlertDescription>
            </Alert>
          )}

          {editableItems.length > 0 ? (
            <Card>
              <div className="grid grid-cols-[1fr_auto_auto] gap-x-3 px-4 py-2.5 bg-line-2 text-xs font-semibold text-ink-3 uppercase tracking-wide border-b border-line">
                <span>Item Name</span>
                <span className="text-right">Price (₹)</span>
                <span />
              </div>
              {editableItems.map((item, idx) => (
                <div key={idx} className="grid grid-cols-[1fr_auto_auto] gap-x-3 px-4 py-2 border-b border-line last:border-0 items-center">
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => { setEditableItems((p) => p.map((it, i) => i === idx ? { ...it, name: e.target.value } : it)); checkMutation.reset(); }}
                    className="text-sm text-ink bg-transparent border-b border-dashed border-line focus:border-green focus:outline-none py-0.5 w-full transition-colors"
                    placeholder="Item name"
                  />
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-ink-3 pointer-events-none">₹</span>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={item.chargedPrice === 0 ? "" : item.chargedPrice}
                      onChange={(e) => { const v = parseFloat(e.target.value); setEditableItems((p) => p.map((it, i) => i === idx ? { ...it, chargedPrice: isNaN(v) ? 0 : v } : it)); checkMutation.reset(); }}
                      className="w-24 text-sm text-ink bg-transparent border-b border-dashed border-line focus:border-green focus:outline-none pl-5 pr-1 py-0.5 text-right transition-colors"
                      placeholder="0"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => { setEditableItems((p) => p.filter((_, i) => i !== idx)); checkMutation.reset(); }}
                    className="text-red hover:text-red/70 transition-colors"
                    aria-label={`Remove ${item.name}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </Card>
          ) : (
            <p className="text-sm text-ink-3 text-center py-4">No items extracted. Try Manual Entry.</p>
          )}

          {checkMutation.isError && (
            <Alert variant="destructive">
              <AlertDescription>Failed to check items. Please try again.</AlertDescription>
            </Alert>
          )}

          {editableItems.length > 0 && (
            <Button
              onClick={() => checkMutation.mutate(editableItems)}
              disabled={checkMutation.isPending}
              className="w-full bg-green hover:bg-green-dark text-white font-semibold h-11 rounded-xl"
            >
              {checkMutation.isPending ? "Checking..." : "Check These Items"}
            </Button>
          )}

          {checkMutation.data && <ResultTable data={checkMutation.data as CheckResponse} />}
        </div>
      )}
    </div>
  );
}

// ─── Manual Entry Tab ─────────────────────────────────────────────────────────

function ManualTab() {
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [items, setItems] = useState<ManualItem[]>([]);

  const checkMutation = useMutation({
    mutationFn: (list: ManualItem[]) =>
      checkIRCTCItems(list) as Promise<CheckResponse>,
  });

  function handleAddItem(e: React.FormEvent) {
    e.preventDefault();
    const name = itemName.trim();
    const price = parseFloat(itemPrice);
    if (!name || isNaN(price) || price <= 0) return;
    setItems((prev) => [...prev, { name, chargedPrice: price }]);
    setItemName("");
    setItemPrice("");
    checkMutation.reset();
  }

  function handleRemoveItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
    checkMutation.reset();
  }

  return (
    <div className="space-y-6">
      <datalist id="irctc-items">
        {IRCTC_ITEMS.map((item) => <option key={item} value={item} />)}
      </datalist>

      <form onSubmit={handleAddItem} className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 flex flex-col gap-1.5">
            <Label htmlFor="item-name" className="text-[13px] font-semibold text-ink-2">Item name</Label>
            <Input
              id="item-name"
              type="text"
              list="irctc-items"
              placeholder='e.g. "Veg Thali"'
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="item-price" className="text-[13px] font-semibold text-ink-2">Price charged (₹)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-3 pointer-events-none">₹</span>
              <Input
                id="item-price"
                type="number"
                min="0"
                step="0.5"
                placeholder="0"
                value={itemPrice}
                onChange={(e) => setItemPrice(e.target.value)}
                className="pl-7 sm:w-36"
              />
            </div>
          </div>
        </div>
        <Button type="submit" className="bg-green hover:bg-green-dark text-white font-semibold rounded-xl">
          Add Item
        </Button>
      </form>

      {items.length > 0 && (
        <Card>
          <div className="grid grid-cols-[1fr_auto_auto] gap-x-4 px-4 py-2.5 bg-line-2 text-xs font-semibold text-ink-3 uppercase tracking-wide border-b border-line">
            <span>Item</span>
            <span className="text-right">Charged (₹)</span>
            <span />
          </div>
          {items.map((item, idx) => (
            <div key={idx} className="grid grid-cols-[1fr_auto_auto] gap-x-4 px-4 py-3 border-b border-line last:border-0 items-center">
              <span className="text-sm text-ink">{item.name}</span>
              <span className="text-sm text-ink-2 text-right font-medium">₹{item.chargedPrice}</span>
              <button
                type="button"
                onClick={() => handleRemoveItem(idx)}
                className="text-red hover:text-red/70 transition-colors flex justify-end"
                aria-label={`Remove ${item.name}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </Card>
      )}

      {checkMutation.isError && (
        <Alert variant="destructive">
          <AlertDescription>Failed to check items. Please try again.</AlertDescription>
        </Alert>
      )}

      {items.length > 0 && (
        <Button
          onClick={() => checkMutation.mutate(items)}
          disabled={checkMutation.isPending}
          className="w-full bg-green hover:bg-green-dark text-white font-semibold h-11 rounded-xl"
        >
          {checkMutation.isPending ? "Checking..." : "Check Items"}
        </Button>
      )}

      {checkMutation.data && <ResultTable data={checkMutation.data as CheckResponse} />}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ScanBillPage() {
  const [activeTab, setActiveTab] = useState<0 | 1>(0);

  return (
    <div className="min-h-screen bg-white">
      {/* Page header */}
      <div className="border-b border-line bg-white sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-1.5 text-ink-3 hover:text-ink transition text-[14px] font-medium" aria-label="Back to home">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Back
          </Link>
          <span className="text-ink-4">/</span>
          <h1 className="text-[15px] font-semibold text-ink">Scan a Bill</h1>
        </div>
      </div>

      {/* Hero */}
      <section className="max-w-2xl mx-auto px-4 sm:px-6 pt-8 pb-4">
        <h2 className="text-[clamp(22px,3vw,30px)] font-extrabold text-ink tracking-tight3 leading-tight">
          Check your bill for overcharging
        </h2>
        <p className="mt-1.5 text-[15px] text-ink-3">
          Upload a photo of your IRCTC train food bill or enter items manually.
        </p>
      </section>

      <section className="max-w-2xl mx-auto px-4 sm:px-6 pb-16">
        {/* Tab bar */}
        <div className="flex border-b border-line mb-6">
          {(["Upload Photo", "Manual Entry"] as const).map((label, idx) => (
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

        {activeTab === 0 ? <UploadTab /> : <ManualTab />}
      </section>
    </div>
  );
}
