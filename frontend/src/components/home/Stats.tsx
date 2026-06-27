const stats = [
  { num: "0%", label: "Legal service charge" },
  { num: "5%", label: "Max GST — most restaurants" },
  { num: "Free", label: "Always. No account needed" },
];

export default function Stats() {
  return (
    <div className="bg-green-pale border-t border-green-mid border-b py-10">
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <div className="grid grid-cols-3 divide-x divide-green-mid">
          {stats.map((s) => (
            <div key={s.label} className="text-center px-4 py-2">
              <div className="text-[clamp(32px,5vw,52px)] font-black tracking-tight3 text-green-dark leading-none font-tabular">
                {s.num}
              </div>
              <div className="text-[12px] font-semibold text-green uppercase tracking-[.07em] mt-1.5 leading-snug">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
