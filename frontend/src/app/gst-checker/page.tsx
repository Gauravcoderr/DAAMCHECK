"use client";

import { useState } from "react";
import Link from "next/link";
import { checkGST } from "@/lib/api";

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
    <svg
      className="w-14 h-14 text-green"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx={12} cy={12} r={10} />
      <path d="M8 12l3 3 5-5" />
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg
      className="w-14 h-14 text-red"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx={12} cy={12} r={10} />
      <path d="M15 9l-6 6M9 9l6 6" />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg
      className="w-5 h-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M19 12H5M12 5l-7 7 7 7" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg
      className="animate-spin w-5 h-5 mr-2 text-white"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx={12}
        cy={12}
        r={10}
        stroke="currentColor"
        strokeWidth={4}
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

// ─── Rules Sidebar ────────────────────────────────────────────────────────────

function RulesSidebar() {
  return (
    <aside className="flex flex-col gap-4">
      <h2 className="text-[18px] font-bold text-ink tracking-tight2">
        Know the Rules
      </h2>

      {/* Rule 1 — GST slabs */}
      <div className="bg-green-pale border border-green-mid rounded-2xl p-4 flex flex-col gap-1.5">
        <div className="flex items-start gap-2">
          <span className="mt-0.5 text-green font-bold text-[15px] leading-none">1.</span>
          <div>
            <p className="text-[14px] font-semibold text-ink leading-snug">
              GST on restaurant food
            </p>
            <ul className="mt-1.5 space-y-1">
              <li className="text-[13px] text-ink-2">
                <span className="font-semibold text-green">5%</span> — standalone
                restaurants (no hotel or hotel room rate below ₹7,500/night)
              </li>
              <li className="text-[13px] text-ink-2">
                <span className="font-semibold text-green">18%</span> — hotel
                restaurants where room rate is ₹7,500 or more per night
              </li>
            </ul>
            <p className="mt-2 text-[11px] text-ink-4 font-medium tracking-wide uppercase">
              CGST Act / Notification 11/2017-CT(Rate)
            </p>
          </div>
        </div>
      </div>

      {/* Rule 2 — Service charge (amber warning) */}
      <div className="bg-amber-pale border border-amber rounded-2xl p-4 flex flex-col gap-1.5">
        <div className="flex items-start gap-2">
          <span className="mt-0.5 text-amber font-bold text-[15px] leading-none">2.</span>
          <div>
            <p className="text-[14px] font-semibold text-ink leading-snug">
              Service charge is completely <span className="text-amber">BANNED</span>
            </p>
            <p className="mt-1 text-[13px] text-ink-2">
              Restaurants cannot levy any mandatory service charge on your bill.
              You are not obligated to pay it.
            </p>
            <p className="mt-2 text-[11px] text-ink-4 font-medium tracking-wide uppercase">
              CCPA Guidelines, July 2022
            </p>
          </div>
        </div>
      </div>

      {/* Rule 3 — NCH complaint */}
      <div className="bg-green-pale border border-green-mid rounded-2xl p-4 flex flex-col gap-1.5">
        <div className="flex items-start gap-2">
          <span className="mt-0.5 text-green font-bold text-[15px] leading-none">3.</span>
          <div>
            <p className="text-[14px] font-semibold text-ink leading-snug">
              File a free complaint
            </p>
            <p className="mt-1 text-[13px] text-ink-2">
              Overcharged? Report it at the National Consumer Helpline — it is
              free, fast, and tracked by the government.
            </p>
            <a
              href="https://consumerhelpline.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-[13px] font-semibold text-green underline underline-offset-2 hover:text-green-dark transition"
            >
              consumerhelpline.gov.in →
            </a>
          </div>
        </div>
      </div>
    </aside>
  );
}

// ─── Result Card ──────────────────────────────────────────────────────────────

interface ResultCardProps {
  result: GSTResult;
}

function ResultCard({ result }: ResultCardProps) {
  if (result.legal) {
    return (
      <div className="mt-8 border border-line rounded-2xl p-6 bg-green-pale flex flex-col items-center text-center gap-3">
        <CheckIcon />
        <h3 className="text-[22px] font-bold text-green tracking-tight2">
          Your bill is legal!
        </h3>
        <p className="text-[14px] text-ink-2 max-w-sm">
          GST was charged at the correct rate of{" "}
          <span className="font-semibold text-ink">{result.correctGstPct}%</span> and
          no service charge violations were found. You were billed fairly.
        </p>
        <div className="mt-2 grid grid-cols-2 gap-3 w-full max-w-xs">
          <div className="bg-white/70 rounded-xl p-3 border border-green-mid">
            <p className="text-[11px] text-ink-4 uppercase tracking-wide font-medium">
              GST Charged
            </p>
            <p className="text-[18px] font-bold text-ink mt-0.5">
              ₹{result.gstCharged}
            </p>
          </div>
          <div className="bg-white/70 rounded-xl p-3 border border-green-mid">
            <p className="text-[11px] text-ink-4 uppercase tracking-wide font-medium">
              GST Correct
            </p>
            <p className="text-[18px] font-bold text-green mt-0.5">
              ₹{result.gstCorrect}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 border border-red rounded-2xl p-6 bg-red-pale flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col items-center text-center gap-3">
        <CrossIcon />
        <h3 className="text-[22px] font-bold text-red tracking-tight2">
          Violations Found
        </h3>
        <p className="text-[14px] text-ink-2">
          Your bill contains illegal charges. You are entitled to a refund of
          the overcharged amounts.
        </p>
      </div>

      {/* Violations list */}
      <ul className="flex flex-col gap-3">
        {result.violations.map((v, i) => (
          <li
            key={i}
            className="bg-white/70 border border-red/30 rounded-xl p-4 flex items-start gap-3"
          >
            <span
              className="mt-1 w-2 h-2 rounded-full bg-red flex-shrink-0"
              aria-hidden="true"
            />
            <div className="flex flex-col gap-0.5 flex-1">
              <p className="text-[14px] font-semibold text-ink leading-snug">
                {v.message}
              </p>
              <p className="text-[12px] text-ink-3 italic">Law: {v.law}</p>
              <p className="mt-1 text-[13px] font-bold text-red">
                Overcharged by ₹{v.amount}
              </p>
            </div>
          </li>
        ))}
      </ul>

      {/* Total overcharge */}
      <div className="bg-red/10 border border-red/40 rounded-xl p-4 flex items-center justify-between">
        <p className="text-[15px] font-semibold text-ink">Total Overcharge</p>
        <p className="text-[22px] font-extrabold text-red tracking-tight2">
          ₹{result.totalOvercharge}
        </p>
      </div>

      {/* Complaint CTA */}
      <a
        href={result.complaintUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full flex items-center justify-center gap-2 bg-red text-white font-bold text-[15px] py-3.5 rounded-xl hover:opacity-90 transition"
      >
        File a Complaint — It is Free
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
        </svg>
      </a>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GSTCheckerPage() {
  const [form, setForm] = useState<FormState>({
    amount: "",
    gstPct: "",
    servicePct: "",
    roomRate: "",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<GSTResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear previous results when inputs change
    if (result || error) {
      setResult(null);
      setError(null);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const params: {
        amount: number;
        gstPct: number;
        servicePct?: number;
        roomRate?: number;
      } = {
        amount: Number(form.amount),
        gstPct: Number(form.gstPct),
      };

      if (form.servicePct !== "" && Number(form.servicePct) > 0) {
        params.servicePct = Number(form.servicePct);
      }
      if (form.roomRate !== "" && Number(form.roomRate) > 0) {
        params.roomRate = Number(form.roomRate);
      }

      const data = (await checkGST(params)) as GSTResult;
      setResult(data);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full border border-line rounded-xl px-4 py-3 text-[15px] text-ink outline-none focus:ring-2 focus:ring-green/30 focus:border-green transition bg-white placeholder:text-ink-4";
  const labelClass = "block text-[13px] font-semibold text-ink-2 mb-1.5";

  return (
    <main className="min-h-screen bg-white">
      {/* Page header */}
      <div className="border-b border-line bg-white sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-ink-3 hover:text-ink transition text-[14px] font-medium"
            aria-label="Back to home"
          >
            <ArrowLeftIcon />
            Back
          </Link>
          <span className="text-ink-4" aria-hidden="true">
            /
          </span>
          <h1 className="text-[15px] font-semibold text-ink">
            GST &amp; Bill Checker
          </h1>
        </div>
      </div>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-10 pb-6">
        <h2
          className="font-extrabold text-ink tracking-tight3 leading-tight"
          style={{ fontSize: "clamp(24px, 3.5vw, 36px)" }}
        >
          Is your restaurant bill legal?
        </h2>
        <p className="mt-2 text-[15px] text-ink-3 max-w-xl">
          Enter your bill details and we will check if the GST rate and service
          charge are in line with Indian consumer laws.
        </p>
      </section>

      {/* Two-column layout */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Left — Form (60%) */}
          <div className="w-full md:w-[60%]">
            <div className="border border-line rounded-2xl p-6 bg-white">
              <h3 className="text-[17px] font-bold text-ink mb-5 tracking-tight2">
                Enter Bill Details
              </h3>

              <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
                {/* Bill amount */}
                <div>
                  <label htmlFor="amount" className={labelClass}>
                    Bill amount before tax (₹){" "}
                    <span className="text-red" aria-label="required">*</span>
                  </label>
                  <input
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
                    className={inputClass}
                    aria-required="true"
                  />
                </div>

                {/* GST % */}
                <div>
                  <label htmlFor="gstPct" className={labelClass}>
                    GST % charged{" "}
                    <span className="text-red" aria-label="required">*</span>
                  </label>
                  <input
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
                    className={inputClass}
                    aria-required="true"
                  />
                </div>

                {/* Service charge % */}
                <div>
                  <label htmlFor="servicePct" className={labelClass}>
                    Service charge %{" "}
                    <span className="text-ink-4 font-normal">(optional)</span>
                  </label>
                  <input
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
                    className={inputClass}
                  />
                </div>

                {/* Hotel room rate */}
                <div>
                  <label htmlFor="roomRate" className={labelClass}>
                    Hotel room rate per night (₹){" "}
                    <span className="text-ink-4 font-normal">(optional)</span>
                  </label>
                  <input
                    id="roomRate"
                    name="roomRate"
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step="1"
                    placeholder="Only for hotel food bills"
                    value={form.roomRate}
                    onChange={handleChange}
                    className={inputClass}
                    aria-describedby="roomRate-hint"
                  />
                  <p
                    id="roomRate-hint"
                    className="mt-1.5 text-[12px] text-ink-4 leading-snug"
                  >
                    Affects GST slab: 5% below ₹7,500/night, 18% at or above.
                  </p>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading || !form.amount || !form.gstPct}
                  className="w-full flex items-center justify-center gap-2 bg-green text-white font-bold text-[15px] py-3.5 rounded-xl hover:bg-green-dark transition disabled:opacity-60 disabled:cursor-not-allowed mt-1"
                >
                  {loading && <SpinnerIcon />}
                  {loading ? "Checking..." : "Check My Bill"}
                </button>
              </form>

              {/* Error banner */}
              {error && (
                <div
                  role="alert"
                  className="mt-5 bg-red-pale border border-red rounded-xl px-4 py-3 text-[14px] text-red font-medium"
                >
                  {error}
                </div>
              )}

              {/* Result card */}
              {result && <ResultCard result={result} />}
            </div>
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
