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
    href: "https://edaakhil.nic.in",
    initials: "eD",
    color: "#1D4ED8",
  },
  {
    name: "INGRAM",
    sub: "DPIIT Grievance Portal",
    logo: null,
    href: "https://ingram.dpiit.gov.in",
    initials: "IN",
    color: "#7C3AED",
  },
  {
    name: "IRCTC Helpline",
    sub: "1800-110-139 (Free)",
    logo: null,
    href: "https://www.irctc.co.in",
    initials: "IR",
    color: "#0369A1",
  },
  {
    name: "Consumer Forum",
    sub: "District Consumer Court",
    logo: null,
    href: "https://ncdrc.nic.in",
    initials: "CF",
    color: "#0F766E",
  },
];

export default function TrustStrip() {
  return (
    <div className="bg-green-pale border-t border-green-mid border-b py-10">
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <p className="text-[11px] font-bold text-green uppercase tracking-[.12em] text-center mb-6">
          Complaints accepted on official portals
        </p>
        <div className="flex flex-wrap gap-2.5 justify-center">
          {portals.map((p) => (
            <a
              key={p.name}
              href={p.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-white border-2 border-green-mid text-green-dark font-bold text-[13px] rounded-full px-5 py-2.5 hover:bg-green hover:text-white hover:border-green transition-all duration-150 hover:-translate-y-0.5"
            >
              {p.logo ? (
                <Image src={p.logo} alt={p.name} width={18} height={18} className="rounded-sm object-contain" />
              ) : (
                <span
                  className="w-[18px] h-[18px] rounded-[4px] grid place-items-center text-[9px] font-black text-white flex-shrink-0"
                  style={{ background: p.color }}
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
