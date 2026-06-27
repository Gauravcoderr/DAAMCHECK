const steps = [
  {
    num: "01",
    title: "Upload or enter your bill",
    desc: "Photo of any restaurant, IRCTC, or hotel food bill — or type amounts manually.",
    bg: "bg-green",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="3" y="3" width="18" height="14" rx="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
  },
  {
    num: "02",
    title: "We check Indian law",
    desc: "Every charge validated against IRCTC caps, GST slabs, and CCPA 2022 service charge ban.",
    bg: "bg-amber",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    num: "03",
    title: "Get a complaint-ready report",
    desc: "If violations found, download a pre-filled NCH or eDaakhil complaint and file directly.",
    bg: "bg-violet-600",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="9" y1="13" x2="15" y2="13" />
        <line x1="9" y1="17" x2="15" y2="17" />
      </svg>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-green-pale border-t border-b border-[#D1FAE5] py-24">
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <p className="text-[11px] font-bold text-ink-4 uppercase tracking-[.12em] mb-3.5">
          How it works
        </p>
        <h2 className="text-[clamp(28px,4vw,40px)] font-black tracking-tight2 text-ink leading-[1.1] mb-14">
          Three steps to fight overcharging.
        </h2>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {/* Connector line — desktop only */}
          <div className="connector-line hidden md:block absolute top-[26px] pointer-events-none" />

          {steps.map((s) => (
            <div
              key={s.title}
              className="relative z-10 bg-white border border-line rounded-2xl p-7 overflow-hidden text-center hover:shadow-[0_8px_32px_rgba(0,0,0,.07)] transition-shadow duration-200"
            >
              {/* Large faint step number */}
              <span className="absolute -right-1 -bottom-3 text-[88px] font-black text-ink opacity-[0.035] leading-none font-tabular select-none">
                {s.num}
              </span>

              <div
                className={`w-[52px] h-[52px] rounded-full ${s.bg} grid place-items-center mx-auto mb-5 transition-transform hover:scale-110`}
              >
                {s.icon}
              </div>
              <h3 className="text-[17px] font-extrabold text-ink mb-2 tracking-[-0.1px]">
                {s.title}
              </h3>
              <p className="text-[14px] text-ink-3 leading-[1.65] max-w-[26ch] mx-auto">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
