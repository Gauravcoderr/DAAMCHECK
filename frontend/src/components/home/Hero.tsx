import Link from "next/link";

export default function Hero() {
  return (
    <section className="py-20 md:py-24 bg-white overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-20 items-center">
          {/* Text */}
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[.1em] text-green bg-green-pale rounded-full px-3.5 py-1 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />
              Free · No signup needed
            </div>
            <h1 className="text-[clamp(42px,6.5vw,72px)] font-black tracking-tight3 leading-[1.04] text-ink mb-6">
              Stop paying<br />
              <em className="not-italic text-green">illegal food</em><br />
              charges.
            </h1>
            <p className="text-[19px] text-ink-3 leading-[1.65] max-w-[44ch] mb-10">
              Service charge is banned. GST is capped at 5%. Your restaurant bill
              may be breaking Indian law right now.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Link
                href="/scan-bill"
                className="inline-flex items-center gap-2 bg-green hover:bg-green-dark text-white text-[16px] font-bold rounded-full px-9 py-[15px] transition-colors shadow-[0_6px_20px_rgba(5,150,105,.35)]"
              >
                Scan your bill
              </Link>
              <Link
                href="/gst-checker"
                className="inline-flex items-center gap-2 bg-white hover:bg-line-2 text-ink text-[16px] font-bold rounded-full px-8 py-[13px] border-2 border-line transition-colors"
              >
                Check GST rate
              </Link>
            </div>
          </div>

          {/* Phone mockup */}
          <div className="flex justify-center">
            <div className="relative w-[268px] flex-shrink-0">
              <div className="bg-ink rounded-[44px] p-3.5 shadow-[0_48px_96px_rgba(0,0,0,.28)]">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[88px] h-6 bg-ink rounded-b-[14px] z-10" />
                {/* Screen */}
                <div className="bg-white rounded-[30px] overflow-hidden min-h-[490px]">
                  {/* Header */}
                  <div className="bg-green px-4 pt-10 pb-4 text-white">
                    <p className="text-[11px] font-semibold opacity-70 uppercase tracking-[.08em] mb-0.5">DaamCheck</p>
                    <p className="text-[19px] font-black tracking-tight">GST Checker</p>
                  </div>
                  {/* Body */}
                  <div className="p-4 space-y-3">
                    <div>
                      <p className="text-[10px] font-bold text-ink-3 uppercase tracking-wide mb-1">Food subtotal</p>
                      <div className="flex items-center gap-1 bg-line-3 border border-line rounded-[9px] px-3 py-2 text-[14px] font-tabular">
                        <span className="text-ink-4">₹</span>1,240
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-[10px] font-bold text-ink-3 uppercase tracking-wide mb-1">GST charged</p>
                        <div className="bg-line-3 border border-line rounded-[9px] px-3 py-2 text-[14px]">18%</div>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-ink-3 uppercase tracking-wide mb-1">Service charge</p>
                        <div className="bg-line-3 border border-line rounded-[9px] px-3 py-2 text-[14px]">10%</div>
                      </div>
                    </div>
                    <div className="bg-red-pale border border-red/30 rounded-[11px] p-3 flex gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-red grid place-items-center text-white text-[12px] font-black flex-shrink-0">✕</div>
                      <div>
                        <p className="text-[12px] font-black text-red-900 mb-0.5">2 violations found</p>
                        <p className="text-[10px] text-red-700 leading-[1.5]">GST should be 5% · Service charge banned under CCPA 2022</p>
                      </div>
                    </div>
                    <button type="button" className="w-full bg-green text-white rounded-full py-2.5 text-[13px] font-bold">
                      File complaint with NCH →
                    </button>
                  </div>
                </div>
              </div>
              {/* Badge */}
              <div className="absolute top-10 -right-5 bg-white rounded-2xl px-4 py-3 shadow-[0_10px_30px_rgba(0,0,0,.15)] text-[13px]">
                <p className="font-black text-red mb-0.5">Overcharged ₹172</p>
                <p className="text-ink-3 text-[11px]">GST + illegal service charge</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
