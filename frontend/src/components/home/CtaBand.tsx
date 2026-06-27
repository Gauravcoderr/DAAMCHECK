import Link from "next/link";

export default function CtaBand() {
  return (
    <section className="relative bg-green py-20 text-center overflow-hidden">
      {/* Dot pattern overlay */}
      <div className="dot-pattern absolute inset-0 opacity-[0.08]" />
      {/* Radial glow */}
      <div className="cta-glow absolute inset-0 pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-6 md:px-10">
        <p className="text-[11px] font-bold uppercase tracking-[.12em] text-white/50 mb-4">
          Check your bill now
        </p>
        <h2 className="text-[clamp(28px,4.5vw,46px)] font-black tracking-tight3 text-white leading-[1.1] mb-3.5">
          Got a bill right now?
        </h2>
        <p className="text-[18px] text-white/75 mb-9 max-w-[44ch] mx-auto">
          Scan it in 30 seconds. Free, always.
        </p>

        <div className="flex flex-col items-center gap-4">
          <Link
            href="/scan-bill"
            className="inline-flex items-center gap-2 bg-amber hover:bg-[#B45309] text-white text-[16px] font-bold rounded-full px-9 py-[15px] transition-all shadow-[0_6px_20px_rgba(217,119,6,.3)] hover:shadow-[0_10px_32px_rgba(217,119,6,.4)] hover:-translate-y-0.5"
          >
            Scan your bill now
          </Link>

          <p className="flex items-center gap-2 text-[13px] text-white/45">
            <span>No signup needed</span>
            <span className="w-1 h-1 rounded-full bg-white/30 inline-block" />
            <span>Works on mobile</span>
            <span className="w-1 h-1 rounded-full bg-white/30 inline-block" />
            <span>100% free</span>
          </p>
        </div>
      </div>
    </section>
  );
}
