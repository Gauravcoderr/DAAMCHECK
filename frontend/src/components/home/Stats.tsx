const stats = [
  {
    num: "0%",
    label: "Legal service charge",
    sub: "Banned by CCPA July 2022",
  },
  {
    num: "5%",
    label: "Max GST — most restaurants",
    sub: "Per CGST Act, room rate < ₹7,500",
  },
  {
    num: "Free",
    label: "Always · No account needed",
    sub: "Open to every Indian citizen",
  },
];

export default function Stats() {
  return (
    <div className="bg-green-pale border-y border-green-mid py-10">
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <div className="grid grid-cols-3 divide-x divide-green-mid">
          {stats.map((s) => (
            <div key={s.label} className="text-center px-4 py-3 md:py-4">
              <div className="text-[clamp(32px,5vw,52px)] font-black tracking-tight3 text-green-dark leading-none font-tabular">
                {s.num}
              </div>
              <div className="text-[12px] font-bold text-green uppercase tracking-[.07em] mt-2 leading-snug">
                {s.label}
              </div>
              <div className="hidden md:block text-[11px] text-green/60 mt-1 leading-snug">
                {s.sub}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
