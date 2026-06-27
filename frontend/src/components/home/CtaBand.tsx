import Link from "next/link";

export default function CtaBand() {
  return (
    <section className="bg-green py-20 text-center">
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <h2 className="text-[clamp(28px,4.5vw,46px)] font-black tracking-tight3 text-white leading-[1.1] mb-3.5">
          Got a bill right now?
        </h2>
        <p className="text-[18px] text-white/75 mb-9 max-w-[44ch] mx-auto">
          Scan it in 30 seconds. Free, always.
        </p>
        <Link
          href="/scan-bill"
          className="inline-flex items-center bg-amber hover:bg-[#B45309] text-white text-[16px] font-bold rounded-full px-9 py-[15px] transition-colors shadow-[0_6px_20px_rgba(217,119,6,.3)]"
        >
          Scan your bill now
        </Link>
      </div>
    </section>
  );
}
