const items = [
  "Service charge is illegal in India",
  "Max GST on most restaurants — 5%",
  "IRCTC Veg Thali — max ₹110",
  "1 in 3 food bills has an illegal charge",
  "File complaint free at NCH · 1800-11-4000",
  "CCPA banned service charge July 2022",
];

export default function Marquee() {
  const all = [...items, ...items];
  return (
    <div
      className="marquee-mask bg-dark overflow-hidden py-3 border-b border-white/5 relative"
      aria-hidden="true"
    >
      <div className="flex w-max animate-[marquee_30s_linear_infinite] hover:[animation-play-state:paused]">
        {all.map((item, i) => (
          <span key={i} className="flex items-center">
            <span className="text-[12px] font-semibold text-white/65 uppercase tracking-widest whitespace-nowrap px-6">
              {item}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-green flex-shrink-0" />
          </span>
        ))}
      </div>
    </div>
  );
}
