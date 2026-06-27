import Image from "next/image";

const portals = [
  {
    name: "NCH Portal",
    sub: "National Consumer Helpline",
    logo: "/logos/nch.png",
    href: "https://consumerhelpline.gov.in",
  },
  {
    name: "eDaakhil",
    sub: "Consumer Dispute Filing",
    logo: null,
    href: "https://www.india.gov.in/category/justice-law-grievances/subcategory/courts-tribunals/details/e-daakhil-portal",
    initials: "eD",
    badgeCls: "bg-[#1D4ED8]",
  },
  {
    name: "INGRAM",
    sub: "DPIIT Grievance Portal",
    logo: null,
    href: "https://ingram.dpiit.gov.in",
    initials: "IN",
    badgeCls: "bg-[#7C3AED]",
  },
  {
    name: "IRCTC Helpline",
    sub: "1800-110-139 (Free)",
    logo: null,
    href: "https://www.irctc.co.in",
    initials: "IR",
    badgeCls: "bg-[#0369A1]",
  },
  {
    name: "Consumer Forum",
    sub: "District Consumer Court",
    logo: null,
    href: "https://ncdrc.nic.in",
    initials: "CF",
    badgeCls: "bg-[#0F766E]",
  },
];

export default function TrustStrip() {
  return (
    <div className="bg-green-pale border-y border-green-mid py-10">
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <div className="flex items-center justify-center gap-2 mb-7">
          <svg
            width="15"
            height="15"
            viewBox="0 0 15 15"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M7.5 1L2 3.5v4c0 3.1 2.4 6 5.5 6.5C10.6 13.5 13 10.6 13 7.5v-4L7.5 1z"
              fill="#059669"
              opacity="0.2"
              stroke="#059669"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
            <path
              d="M5.5 7.5l1.5 1.5 2.5-2.5"
              stroke="#059669"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="text-[11px] font-bold text-ink-3 uppercase tracking-[.12em]">
            File complaints on official government portals
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 justify-center">
          {portals.map((p) => (
            <a
              key={p.name}
              href={p.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-white border-2 border-green-mid text-green-dark font-bold text-[13px] rounded-full px-5 py-2.5 hover:bg-green hover:text-white hover:border-green transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(5,150,105,.2)]"
            >
              {p.logo ? (
                <Image
                  src={p.logo}
                  alt={p.name}
                  width={18}
                  height={18}
                  className="rounded-sm object-contain"
                />
              ) : (
                <span
                  className={`w-[18px] h-[18px] rounded-[4px] grid place-items-center text-[9px] font-black text-white flex-shrink-0 ${p.badgeCls ?? ""}`}
                >
                  {p.initials}
                </span>
              )}
              {p.name}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
