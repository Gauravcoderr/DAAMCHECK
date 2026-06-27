"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { checkGST } from "@/lib/api";
import { Alert, AlertDescription } from "@/components/ui/alert";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Violation {
  type: string;
  message: string;
  law: string;
  amount: number;
}

interface GSTResult {
  legal: boolean;
  correctGstPct: number;
  gstCharged: number;
  gstCorrect: number;
  scAmount: number;
  totalOvercharge: number;
  violations: Violation[];
  complaintUrl: string;
}

interface FormState {
  amount: string;
  gstPct: string;
  servicePct: string;
  roomRate: string;
}

// ─── Shared classes ────────────────────────────────────────────────────────────

const inputCls =
  "w-full bg-line-3 border-[1.5px] border-line rounded-lg px-3.5 py-3 text-base text-ink outline-none " +
  "focus:border-green focus:shadow-[0_0_0_3px_rgba(5,150,105,.12)] focus:bg-white transition-all font-tabular";

const prefixInputCls =
  "w-full bg-line-3 border-[1.5px] border-line rounded-lg pl-8 pr-3.5 py-3 text-base text-ink outline-none " +
  "focus:border-green focus:shadow-[0_0_0_3px_rgba(5,150,105,.12)] focus:bg-white transition-all font-tabular";

const labelCls = "block text-xs font-bold text-ink-2 uppercase tracking-[.05em] mb-2";

const cardHdrCls =
  "px-6 py-3 border-b border-line bg-line-3 text-xs font-bold text-ink-2 uppercase tracking-[.06em]";

// ─── Select wrapper ────────────────────────────────────────────────────────────

function Select({ id, name, value, onChange, title, children }: {
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        title={title}
        className={inputCls + " appearance-none cursor-pointer pr-9"}
      >
        {children}
      </select>
      <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-ink-4">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="2,4 6,8 10,4" />
        </svg>
      </span>
    </div>
  );
}

// ─── Result Card ──────────────────────────────────────────────────────────────

function ResultCard({ result }: { result: GSTResult }) {
  if (result.legal) {
    return (
      <div className="rounded-2xl border-[1.5px] border-green-mid overflow-hidden">
        <div className="px-5 py-4 flex items-center gap-3 bg-green-pale">
          <div className="w-9 h-9 rounded-full bg-green grid place-items-center flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="2,8 6,12 14,4" />
            </svg>
          </div>
          <span className="text-lg font-extrabold text-[#065F46]">Bill is legal!</span>
        </div>
        <div className="bg-white">
          <div className="flex justify-between items-center px-5 py-[11px] border-b border-line-3 text-sm gap-4">
            <span className="text-ink-3">GST rate applied</span>
            <span className="font-bold text-green font-tabular">{result.correctGstPct}%</span>
          </div>
          <div className="flex justify-between items-center px-5 py-[11px] border-b border-line-3 text-sm gap-4">
            <span className="text-ink-3">GST charged</span>
            <span className="font-bold font-tabular text-ink">₹{result.gstCharged}</span>
          </div>
          <div className="flex justify-between items-center px-5 py-[11px] text-sm gap-4">
            <span className="text-ink-3">Correct GST amount</span>
            <span className="font-bold font-tabular text-green">₹{result.gstCorrect}</span>
          </div>
        </div>
        <div className="px-5 py-3.5 flex justify-between items-center bg-green-pale border-t border-green-mid">
          <span className="text-sm font-bold text-[#065F46]">Total overcharge</span>
          <span className="text-[26px] font-black tracking-tight2 text-green font-tabular">₹0</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border-[1.5px] border-[#FCA5A5] overflow-hidden">
      <div className="px-5 py-4 flex items-center gap-3 bg-red-pale">
        <div className="w-9 h-9 rounded-full bg-red grid place-items-center flex-shrink-0">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="3" x2="13" y2="13" /><line x1="13" y1="3" x2="3" y2="13" />
          </svg>
        </div>
        <span className="text-lg font-extrabold text-[#7F1D1D]">Violations found</span>
      </div>
      <div className="bg-white">
        {result.violations.map((v, i) => (
          <div key={i} className="flex justify-between items-center px-5 py-[11px] border-b border-line-3 text-sm gap-4">
            <span className="text-ink-3">{v.message}</span>
            <span className="font-bold font-tabular text-red shrink-0">₹{v.amount}</span>
          </div>
        ))}
        <div className="flex justify-between items-center px-5 py-[11px] border-b border-line-3 text-sm gap-4">
          <span className="text-ink-3">GST charged</span>
          <span className="font-bold font-tabular text-ink">₹{result.gstCharged}</span>
        </div>
        <div className="flex justify-between items-center px-5 py-[11px] text-sm gap-4">
          <span className="text-ink-3">Should have been</span>
          <span className="font-bold font-tabular text-green">₹{result.gstCorrect}</span>
        </div>
      </div>
      <div className="px-5 py-3.5 flex justify-between items-center bg-[#FEF2F2] border-t border-[#FCA5A5]">
        <span className="text-sm font-bold text-[#991B1B]">Total overcharge</span>
        <span className="text-[26px] font-black tracking-tight2 text-red font-tabular">₹{result.totalOvercharge}</span>
      </div>
      <div className="px-5 py-3.5 bg-white border-t border-line flex gap-2.5 flex-wrap">
        <a
          href={result.complaintUrl ?? "https://consumerhelpline.gov.in"}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-bold text-red hover:underline transition"
        >
          File a free complaint →
        </a>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GSTCheckerPage() {
  const [form, setForm] = useState<FormState>({ amount: "", gstPct: "", servicePct: "0", roomRate: "" });

  const mutation = useMutation({
    mutationFn: (params: { amount: number; gstPct: number; servicePct?: number; roomRate?: number }) =>
      checkGST(params) as Promise<GSTResult>,
  });

  function handleInput(e: React.ChangeEvent<HTMLInputElement>): void {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (mutation.data || mutation.error) mutation.reset();
  }

  function handleSelect(e: React.ChangeEvent<HTMLSelectElement>): void {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (mutation.data || mutation.error) mutation.reset();
  }

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    const params: { amount: number; gstPct: number; servicePct?: number; roomRate?: number } = {
      amount: Number(form.amount),
      gstPct: Number(form.gstPct),
    };
    if (form.servicePct && Number(form.servicePct) > 0) params.servicePct = Number(form.servicePct);
    if (form.roomRate && Number(form.roomRate) > 0) params.roomRate = Number(form.roomRate);
    mutation.mutate(params);
  }

  const errorMessage =
    mutation.error instanceof Error ? mutation.error.message
    : mutation.error ? "Something went wrong. Please try again." : null;

  const canSubmit = !mutation.isPending && !!form.amount && !!form.gstPct;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1160px] mx-auto px-6 md:px-10 py-12">

        {/* Back */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-3 hover:text-ink transition mb-5"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="8,2 4,6 8,10" />
          </svg>
          Back
        </Link>

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-[clamp(28px,4vw,42px)] font-black tracking-tight3 text-ink leading-[1.1] mb-2">
            GST + Service Charge Checker
          </h1>
          <p className="text-[17px] text-ink-3">
            Verify if your restaurant or hotel bill follows Indian law. Results in seconds.
          </p>
        </div>

        {/* Layout */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_340px] gap-6">

            {/* Left — form */}
            <div className="flex flex-col gap-5">

              {/* Bill details */}
              <div className="bg-white border-[1.5px] border-line rounded-[18px] overflow-hidden">
                <div className={cardHdrCls}>Bill details</div>
                <div className="p-6 flex flex-col gap-5">
                  <div>
                    <label htmlFor="amount" className={labelCls}>
                      Food + beverage subtotal{" "}
                      <span className="font-normal normal-case tracking-normal text-ink-4">before taxes</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[15px] font-semibold text-ink-4 pointer-events-none">₹</span>
                      <input
                        type="number"
                        id="amount"
                        name="amount"
                        placeholder="0"
                        value={form.amount}
                        onChange={handleInput}
                        className={prefixInputCls}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="gstPct" className={labelCls}>GST % charged</label>
                      <Select id="gstPct" name="gstPct" value={form.gstPct} onChange={handleSelect} title="GST % charged">
                        <option value="">Select</option>
                        <option value="5">5%</option>
                        <option value="12">12%</option>
                        <option value="18">18%</option>
                        <option value="28">28%</option>
                      </Select>
                    </div>
                    <div>
                      <label htmlFor="servicePct" className={labelCls}>Service charge</label>
                      <Select id="servicePct" name="servicePct" value={form.servicePct} onChange={handleSelect} title="Service charge %">
                        <option value="0">None (0%)</option>
                        <option value="5">5%</option>
                        <option value="10">10%</option>
                        <option value="12">12%</option>
                        <option value="15">15%</option>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hotel room rate */}
              <div className="bg-white border-[1.5px] border-line rounded-[18px] overflow-hidden">
                <div className={cardHdrCls}>
                  Hotel room rate{" "}
                  <span className="font-normal normal-case tracking-normal text-ink-4">(affects GST slab)</span>
                </div>
                <div className="p-6">
                  <label htmlFor="roomRate" className={labelCls}>
                    Room rate per night{" "}
                    <span className="font-normal normal-case tracking-normal text-ink-4">Enter 0 for standalone restaurant</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[15px] font-semibold text-ink-4 pointer-events-none">₹</span>
                    <input
                      type="number"
                      id="roomRate"
                      name="roomRate"
                      placeholder="0"
                      value={form.roomRate}
                      onChange={handleInput}
                      className={prefixInputCls}
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full bg-green hover:bg-green-dark disabled:opacity-50 text-white font-bold text-base rounded-full py-[15px] transition-all hover:shadow-[0_6px_20px_rgba(5,150,105,.35)] active:scale-[.97]"
              >
                {mutation.isPending ? "Checking..." : "Check legality"}
              </button>
            </div>

            {/* Right — results + info */}
            <div className="flex flex-col gap-5">
              {errorMessage && (
                <Alert variant="destructive">
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}
              {mutation.data && <ResultCard result={mutation.data as GSTResult} />}

              {/* Info card */}
              <div className="bg-white border-[1.5px] border-line rounded-[18px] overflow-hidden">
                <div className="px-5 py-3 border-b border-line bg-line-3 text-xs font-bold text-ink-2 uppercase tracking-[.06em]">
                  The rules
                </div>
                <div>
                  {[
                    { color: "bg-green", title: "Standalone restaurants — 5% GST", body: "5% flat, no exceptions. Regardless of how premium the restaurant." },
                    { color: "bg-amber", title: "Hotel food — room below ₹7,500/night", body: "Still 5% GST on food, even inside a hotel." },
                    { color: "bg-[#F59E0B]", title: "Hotel food — room ₹7,500+ per night", body: "18% GST is legal at this tier only." },
                    { color: "bg-red", title: "Service charge — always illegal", body: "Banned by CCPA July 2022. Any percentage is a violation." },
                  ].map((rule, i, arr) => (
                    <div key={i} className={`flex gap-3 px-5 py-3.5 ${i < arr.length - 1 ? "border-b border-line-2" : ""}`}>
                      <div className={`w-[3px] rounded-[3px] self-stretch min-h-8 flex-shrink-0 ${rule.color}`} />
                      <div className="text-[13px] text-ink-3 leading-relaxed">
                        <strong className="block text-[14px] font-bold text-ink mb-0.5">{rule.title}</strong>
                        {rule.body}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-5 py-2.5 text-[11px] text-ink-4 border-t border-line bg-line-3">
                  Source: CCPA Guidelines 2022 · CGST Act · Notification 11/2017
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
