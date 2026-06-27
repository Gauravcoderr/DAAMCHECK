import Link from "next/link";

const tools = [
  {
    href: "/gst-checker",
    tag: "GST + Service Charge",
    title: "Bill Legality Checker",
    desc: "Enter totals. Get instant verdict under CGST rules and the 2022 CCPA service charge ban.",
    color: "green" as const,
  },
  {
    href: "/irctc-prices",
    tag: "IRCTC · Most used",
    title: "Train Food Price Caps",
    desc: "Official maximum prices for all food on Indian Railways. Vendors cannot charge above these.",
    color: "blue" as const,
    featured: true,
  },
  {
    href: "/scan-bill",
    tag: "OCR Bill Scan",
    title: "Scan Any Food Bill",
    desc: "Upload a photo. Every item checked against IRCTC caps, GST rules, and the service charge ban.",
    color: "purple" as const,
  },
];

const colorMap = {
  green: { bg: "bg-green-pale", border: "border-green-mid", tag: "text-green", num: "text-green-mid" },
  blue:  { bg: "bg-blue-50",    border: "border-blue-200",  tag: "text-blue-600", num: "text-blue-200" },
  purple:{ bg: "bg-violet-50",  border: "border-violet-200", tag: "text-violet-600", num: "text-violet-200" },
};

export default function ToolCards() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <p className="text-[11px] font-bold text-ink-4 uppercase tracking-[.12em] mb-3.5">Three tools</p>
        <h2 className="text-[clamp(30px,4.5vw,46px)] font-black tracking-tight2 text-ink leading-[1.1] mb-4">
          Every Indian food pricing<br />law, in one place.
        </h2>
        <p className="text-[18px] text-ink-3 max-w-[52ch] leading-[1.65] mb-14">
          From IRCTC train vendor overcharging to restaurant GST violations — know your rights before you pay.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tools.map((t, i) => {
            const c = colorMap[t.color];
            return (
              <Link
                key={t.href}
                href={t.href}
                className={`group flex flex-col bg-white border-[1.5px] ${t.featured ? "border-green" : "border-line"} rounded-[20px] overflow-hidden hover:-translate-y-1.5 hover:shadow-[0_20px_48px_rgba(0,0,0,.09)] hover:border-green transition-all duration-200`}
              >
                {/* Preview */}
                <div className={`h-[160px] relative overflow-hidden ${c.bg}`}>
                  <span className={`absolute bottom-4 right-5 text-[64px] font-black ${c.num} leading-none font-tabular select-none`}>
                    0{i + 1}
                  </span>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <p className={`text-[10px] font-bold uppercase tracking-[.08em] ${c.tag} mb-1.5`}>{t.tag}</p>
                  <h3 className="text-[17px] font-extrabold text-ink tracking-[-0.2px] mb-2 leading-tight">{t.title}</h3>
                  <p className="text-[13px] text-ink-3 leading-[1.6] flex-1">{t.desc}</p>
                  <span className="inline-flex items-center gap-1.5 text-[12px] font-bold text-green mt-4">
                    Try now
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-0.5">
                      <polyline points="4,2 8,6 4,10" />
                    </svg>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
