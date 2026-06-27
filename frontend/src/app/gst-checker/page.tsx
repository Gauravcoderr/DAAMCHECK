"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { checkGST } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

// ─── Types ───────────────────────────────────────────────────────────────────

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

// ─── Icons ────────────────────────────────────────────────────────────────────

function CheckIcon() {
  return (
    <svg className="w-14 h-14 text-green" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx={12} cy={12} r={10} />
      <path d="M8 12l3 3 5-5" />
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg className="w-14 h-14 text-red" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx={12} cy={12} r={10} />
      <path d="M15 9l-6 6M9 9l6 6" />
    </svg>
  );
}

// ─── Rules Sidebar ────────────────────────────────────────────────────────────

function RulesSidebar() {
  return (
    <aside className="flex flex-col gap-4">
      <h2 className="text-[18px] font-bold text-ink tracking-tight2">Know the Rules</h2>

      <Card className="border-green-mid bg-green-pale">
        <CardContent className="pt-4 flex items-start gap-2">
          <span className="mt-0.5 text-green font-bold text-[15px] leading-none">1.</span>
          <div>
            <p className="text-[14px] font-semibold text-ink leading-snug">GST on restaurant food</p>
            <ul className="mt-1.5 space-y-1">
              <li className="text-[13px] text-ink-2">
                <span className="font-semibold text-green">5%</span> — standalone restaurants (no hotel or hotel room rate below ₹7,500/night)
              </li>
              <li className="text-[13px] text-ink-2">
                <span className="font-semibold text-green">18%</span> — hotel restaurants where room rate is ₹7,500 or more per night
              </li>
            </ul>
            <p className="mt-2 text-[11px] text-ink-4 font-medium tracking-wide uppercase">CGST Act / Notification 11/2017-CT(Rate)</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-amber bg-amber-pale">
        <CardContent className="pt-4 flex items-start gap-2">
          <span className="mt-0.5 text-amber font-bold text-[15px] leading-none">2.</span>
          <div>
            <p className="text-[14px] font-semibold text-ink leading-snug">
              Service charge is completely <span className="text-amber">BANNED</span>
            </p>
            <p className="mt-1 text-[13px] text-ink-2">Restaurants cannot levy any mandatory service charge on your bill. You are not obligated to pay it.</p>
            <p className="mt-2 text-[11px] text-ink-4 font-medium tracking-wide uppercase">CCPA Guidelines, July 2022</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-green-mid bg-green-pale">
        <CardContent className="pt-4 flex items-start gap-2">
          <span className="mt-0.5 text-green font-bold text-[15px] leading-none">3.</span>
          <div>
            <p className="text-[14px] font-semibold text-ink leading-snug">File a free complaint</p>
            <p className="mt-1 text-[13px] text-ink-2">Overcharged? Report it at the National Consumer Helpline — it is free, fast, and tracked by the government.</p>
            <a href="https://consumerhelpline.gov.in" target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-[13px] font-semibold text-green underline underline-offset-2 hover:text-green-dark transition">
              consumerhelpline.gov.in →
            </a>
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}

// ─── Result Card ──────────────────────────────────────────────────────────────

function ResultCard({ result }: { result: GSTResult }) {
  if (result.legal) {
    return (
      <Card className="mt-8 border-green-mid bg-green-pale">
        <CardContent className="pt-6 flex flex-col items-center text-center gap-3">
          <CheckIcon />
          <h3 className="text-[22px] font-bold text-green tracking-tight2">Your bill is legal!</h3>
          <p className="text-[14px] text-ink-2 max-w-sm">
            GST was charged at the correct rate of{" "}
            <span className="font-semibold text-ink">{result.correctGstPct}%</span> and no service charge violations were found. You were billed fairly.
          </p>
          <div className="mt-2 grid grid-cols-2 gap-3 w-full max-w-xs">
            <div className="bg-white/70 rounded-xl p-3 border border-green-mid">
              <p className="text-[11px] text-ink-4 uppercase tracking-wide font-medium">GST Charged</p>
              <p className="text-[18px] font-bold text-ink mt-0.5">₹{result.gstCharged}</p>
            </div>
            <div className="bg-white/70 rounded-xl p-3 border border-green-mid">
              <p className="text-[11px] text-ink-4 uppercase tracking-wide font-medium">GST Correct</p>
              <p className="text-[18px] font-bold text-green mt-0.5">₹{result.gstCorrect}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-8 border-red bg-red-pale">
      <CardContent className="pt-6 flex flex-col gap-5">
        <div className="flex flex-col items-center text-center gap-3">
          <CrossIcon />
          <h3 className="text-[22px] font-bold text-red tracking-tight2">Violations Found</h3>
          <p className="text-[14px] text-ink-2">Your bill contains illegal charges. You are entitled to a refund of the overcharged amounts.</p>
        </div>

        <ul className="flex flex-col gap-3">
          {result.violations.map((v, i) => (
            <li key={i} className="bg-white/70 border border-red/30 rounded-xl p-4 flex items-start gap-3">
              <span className="mt-1 w-2 h-2 rounded-full bg-red flex-shrink-0" aria-hidden="true" />
              <div className="flex flex-col gap-0.5 flex-1">
                <p className="text-[14px] font-semibold text-ink leading-snug">{v.message}</p>
                <p className="text-[12px] text-ink-3 italic">Law: {v.law}</p>
                <p className="mt-1 text-[13px] font-bold text-red">Overcharged by ₹{v.amount}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="bg-red/10 border border-red/40 rounded-xl p-4 flex items-center justify-between">
          <p className="text-[15px] font-semibold text-ink">Total Overcharge</p>
          <p className="text-[22px] font-extrabold text-red tracking-tight2">₹{result.totalOvercharge}</p>
        </div>

        <a
          href={result.complaintUrl ?? "https://consumerhelpline.gov.in"}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full inline-flex items-center justify-center bg-red hover:bg-red/90 text-white font-bold text-[15px] py-3.5 rounded-xl transition-colors"
        >
          File a Complaint — It is Free
          <svg className="w-4 h-4 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
          </svg>
        </a>
      </CardContent>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GSTCheckerPage() {
  const [form, setForm] = useState<FormState>({ amount: "", gstPct: "", servicePct: "", roomRate: "" });

  const mutation = useMutation({
    mutationFn: (params: { amount: number; gstPct: number; servicePct?: number; roomRate?: number }) =>
      checkGST(params) as Promise<GSTResult>,
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (mutation.data || mutation.error) mutation.reset();
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    const params: { amount: number; gstPct: number; servicePct?: number; roomRate?: number } = {
      amount: Number(form.amount),
      gstPct: Number(form.gstPct),
    };
    if (form.servicePct !== "" && Number(form.servicePct) > 0) params.servicePct = Number(form.servicePct);
    if (form.roomRate !== "" && Number(form.roomRate) > 0) params.roomRate = Number(form.roomRate);
    mutation.mutate(params);
  }

  const errorMessage = mutation.error instanceof Error
    ? mutation.error.message
    : mutation.error ? "Something went wrong. Please try again." : null;

  return (
    <main className="min-h-screen bg-white">
      {/* Page header */}
      <div className="border-b border-line bg-white sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-1.5 text-ink-3 hover:text-ink transition text-[14px] font-medium" aria-label="Back to home">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Back
          </Link>
          <span className="text-ink-4" aria-hidden="true">/</span>
          <h1 className="text-[15px] font-semibold text-ink">GST &amp; Bill Checker</h1>
        </div>
      </div>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-10 pb-6">
        <h2 className="font-extrabold text-ink tracking-tight3 leading-tight text-[clamp(24px,3.5vw,36px)]">
          Is your restaurant bill legal?
        </h2>
        <p className="mt-2 text-[15px] text-ink-3 max-w-xl">
          Enter your bill details and we will check if the GST rate and service charge are in line with Indian consumer laws.
        </p>
      </section>

      {/* Two-column layout */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Left — Form (60%) */}
          <div className="w-full md:w-[60%]">
            <Card>
              <CardHeader>
                <CardTitle className="text-[17px] font-bold text-ink tracking-tight2">Enter Bill Details</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="amount" className="text-[13px] font-semibold text-ink-2">
                      Bill amount before tax (₹) <span className="text-red" aria-label="required">*</span>
                    </Label>
                    <Input
                      id="amount"
                      name="amount"
                      type="number"
                      inputMode="decimal"
                      required
                      min={1}
                      step="0.01"
                      placeholder="e.g. 1200"
                      value={form.amount}
                      onChange={handleChange}
                      aria-required="true"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="gstPct" className="text-[13px] font-semibold text-ink-2">
                      GST % charged <span className="text-red" aria-label="required">*</span>
                    </Label>
                    <Input
                      id="gstPct"
                      name="gstPct"
                      type="number"
                      inputMode="decimal"
                      required
                      min={0}
                      max={100}
                      step="0.01"
                      placeholder="e.g. 18"
                      value={form.gstPct}
                      onChange={handleChange}
                      aria-required="true"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="servicePct" className="text-[13px] font-semibold text-ink-2">
                      Service charge % <span className="text-ink-4 font-normal">(optional)</span>
                    </Label>
                    <Input
                      id="servicePct"
                      name="servicePct"
                      type="number"
                      inputMode="decimal"
                      min={0}
                      max={100}
                      step="0.01"
                      placeholder="Leave 0 if none"
                      value={form.servicePct}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="roomRate" className="text-[13px] font-semibold text-ink-2">
                      Hotel room rate per night (₹) <span className="text-ink-4 font-normal">(optional)</span>
                    </Label>
                    <Input
                      id="roomRate"
                      name="roomRate"
                      type="number"
                      inputMode="decimal"
                      min={0}
                      step="1"
                      placeholder="Only for hotel food bills"
                      value={form.roomRate}
                      onChange={handleChange}
                      aria-describedby="roomRate-hint"
                    />
                    <p id="roomRate-hint" className="text-[12px] text-ink-4 leading-snug">
                      Affects GST slab: 5% below ₹7,500/night, 18% at or above.
                    </p>
                  </div>

                  <Button
                    type="submit"
                    disabled={mutation.isPending || !form.amount || !form.gstPct}
                    className="w-full bg-green hover:bg-green-dark text-white font-bold text-[15px] py-3.5 h-auto rounded-xl mt-1"
                  >
                    {mutation.isPending ? "Checking..." : "Check My Bill"}
                  </Button>
                </form>

                {errorMessage && (
                  <Alert variant="destructive" className="mt-5">
                    <AlertDescription>{errorMessage}</AlertDescription>
                  </Alert>
                )}

                {mutation.data && <ResultCard result={mutation.data as GSTResult} />}
              </CardContent>
            </Card>
          </div>

          {/* Right — Rules sidebar (40%) */}
          <div className="w-full md:w-[40%]">
            <RulesSidebar />
          </div>
        </div>
      </section>
    </main>
  );
}
