import Link from "next/link";

const tools = [
  {
    href: "/gst-checker",
    tag: "GST + Service Charge",
    title: "Bill Legality Checker",
    desc: "Enter totals. Get instant verdict under CGST rules and the 2022 CCPA service charge ban.",
    color: "green" as const,
    icon: (
      <svg
        width="38"
        height="38"
        viewBox="0 0 38 38"
        fill="none"
        aria-hidden="true"
      >
        <rect x="7" y="3" width="20" height="27" rx="3" fill="currentColor" opacity="0.15" />
        <rect x="7" y="3" width="20" height="27" rx="3" stroke="currentColor" strokeWidth="1.8" />
        <line x1="12" y1="10" x2="22" y2="10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="12" y1="15" x2="20" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.7" />
        <line x1="12" y1="20" x2="22" y2="20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.5" />
        <circle cx="29" cy="29" r="7" fill="currentColor" opacity="0.2" />
        <path d="M26 29l2.5 2.5L33 26" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: "/irctc-prices",
    tag: "IRCTC · Most used",
    title: "Train Food Price Caps",
    desc: "Official maximum prices for all food on Indian Railways. Vendors cannot charge above these.",
    color: "blue" as const,
    featured: true,
    icon: (
      <svg
        width="38"
        height="38"
        viewBox="0 0 38 38"
        fill="none"
        aria-hidden="true"
      >
        <rect x="3" y="11" width="32" height="18" rx="4" fill="currentColor" opacity="0.15" />
        <rect x="3" y="11" width="32" height="18" rx="4" stroke="currentColor" strokeWidth="1.8" />
        <line x1="3" y1="18" x2="35" y2="18" stroke="currentColor" strokeWidth="1.4" strokeOpacity="0.5" />
        <circle cx="10" cy="31" r="3" fill="currentColor" />
        <circle cx="28" cy="31" r="3" fill="currentColor" />
        <rect x="13" y="14" width="4" height="4" rx="1" fill="currentColor" opacity="0.5" />
        <rect x="21" y="14" width="4" height="4" rx="1" fill="currentColor" opacity="0.5" />
      </svg>
    ),
  },
  {
    href: "/scan-bill",
    tag: "OCR Bill Scan",
    title: "Scan Any Food Bill",
    desc: "Upload a photo. Every item checked against IRCTC caps, GST rules, and the service charge ban.",
    color: "purple" as const,
    icon: (
      <svg
        width="38"
        height="38"
        viewBox="0 0 38 38"
        fill="none"
        aria-hidden="true"
      >
        <rect x="5" y="9" width="28" height="22" rx="4" fill="currentColor" opacity="0.15" />
        <rect x="5" y="9" width="28" height="22" rx="4" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="19" cy="20" r="5.5" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="19" cy="20" r="2" fill="currentColor" />
        <rect x="23" y="10" width="5" height="3.5" rx="1" fill="currentColor" opacity="0.6" />
        <path d="M9 9V6M6 9H3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M29 9V6M32 9H35" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M9 31v3M6 31H3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M29 31v3M32 31H35" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
];

const colorMap = {
  green: {
    bg: "bg-green-pale",
    tag: "text-green",
    icon: "text-green",
    num: "text-green-mid",
  },
  blue: {
    bg: "bg-blue-50",
    tag: "text-blue-600",
    icon: "text-blue-500",
    num: "text-blue-200",
  },
  purple: {
    bg: "bg-violet-50",
    tag: "text-violet-600",
    icon: "text-violet-500",
    num: "text-violet-200",
  },
};

export default function ToolCards() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <p className="text-[11px] font-bold text-ink-4 uppercase tracking-[.12em] mb-3.5">
          Three tools
        </p>
        <h2 className="text-[clamp(30px,4.5vw,46px)] font-black tracking-tight2 text-ink leading-[1.1] mb-4">
          Every Indian food pricing<br />law, in one place.
        </h2>
        <p className="text-[18px] text-ink-3 max-w-[52ch] leading-[1.65] mb-14">
          From IRCTC train vendor overcharging to restaurant GST violations — know
          your rights before you pay.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tools.map((t, i) => {
            const c = colorMap[t.color];
            return (
              <Link
                key={t.href}
                href={t.href}
                className={`group flex flex-col bg-white border-[1.5px] ${
                  t.featured
                    ? "border-green shadow-[0_4px_24px_rgba(5,150,105,.12)]"
                    : "border-line"
                } rounded-[20px] overflow-hidden hover:-translate-y-1.5 hover:shadow-[0_20px_48px_rgba(0,0,0,.09)] hover:border-green transition-all duration-200`}
              >
                {/* Preview area */}
                <div
                  className={`h-[160px] relative overflow-hidden ${c.bg} flex items-center justify-center`}
                >
                  {/* Faint big number */}
                  <span
                    className={`absolute bottom-2 right-4 text-[80px] font-black ${c.num} leading-none font-tabular select-none`}
                  >
                    0{i + 1}
                  </span>
                  {/* Icon */}
                  <div className={`relative z-10 ${c.icon}`}>{t.icon}</div>
                  {/* Featured badge */}
                  {t.featured && (
                    <span className="absolute top-3 left-3 text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-200 rounded-full px-2.5 py-0.5 uppercase tracking-[.06em]">
                      Most used
                    </span>
                  )}
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <p
                    className={`text-[10px] font-bold uppercase tracking-[.08em] ${c.tag} mb-1.5`}
                  >
                    {t.tag}
                  </p>
                  <h3 className="text-[17px] font-extrabold text-ink tracking-[-0.2px] mb-2 leading-tight">
                    {t.title}
                  </h3>
                  <p className="text-[13px] text-ink-3 leading-[1.6] flex-1">{t.desc}</p>
                  <span className="inline-flex items-center gap-1.5 text-[12px] font-bold text-green mt-4">
                    Try now
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="transition-transform group-hover:translate-x-0.5"
                      aria-hidden="true"
                    >
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
