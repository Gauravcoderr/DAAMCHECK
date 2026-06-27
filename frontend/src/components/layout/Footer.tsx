import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-dark pt-0 pb-9">
      {/* Newsletter */}
      <div className="border-b border-white/8 py-10">
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div>
              <p className="text-[19px] font-extrabold text-white tracking-[-0.3px]">Stay informed on your rights</p>
              <p className="text-[14px] text-white/50 mt-1">Weekly updates on consumer law, new IRCTC price caps, and GST changes.</p>
            </div>
            <form className="flex overflow-hidden rounded-full border border-white/12 bg-white/5 flex-shrink-0">
              <input
                type="email"
                placeholder="your@email.com"
                className="bg-transparent border-none outline-none px-5 py-3 text-[14px] text-white placeholder-white/30 min-w-[220px]"
                aria-label="Email for newsletter"
              />
              <button
                type="submit"
                className="bg-amber hover:bg-[#B45309] text-white px-5 py-3 text-[13px] font-bold whitespace-nowrap transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="max-w-6xl mx-auto px-6 md:px-10 pt-11 pb-11">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr] gap-10 md:gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3.5">
              <div className="w-8 h-8 bg-green rounded-[9px] grid place-items-center text-white text-[15px] font-black">D</div>
              <span className="text-[17px] font-extrabold text-white">Daam<span className="text-green">Check</span></span>
            </div>
            <p className="text-[14px] text-white/50 leading-[1.65] max-w-[28ch] mb-4">
              Indian consumer rights tool. Check your restaurant, hotel, and IRCTC food bills for legal compliance.
            </p>
            <span className="inline-flex items-center text-[11px] font-semibold text-green-mid bg-green/15 border border-green/25 rounded-full px-3.5 py-1 tracking-[.04em]">
              Based on Indian law
            </span>
          </div>
          <div>
            <h4 className="text-[12px] font-bold text-amber uppercase tracking-[.1em] mb-4">Tools</h4>
            <ul className="space-y-2.5">
              {[["GST Checker","/gst-checker"],["IRCTC Price List","/irctc-prices"],["Scan a Bill","/scan-bill"]].map(([label, href]) => (
                <li key={href}><Link href={href} className="text-[14px] text-white/50 hover:text-white transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-[12px] font-bold text-amber uppercase tracking-[.1em] mb-4">Legal Basis</h4>
            <ul className="space-y-2.5">
              {["CCPA 2022","CGST Act","IRCTC Guidelines","Consumer Protection 2019"].map((l) => (
                <li key={l}><span className="text-[14px] text-white/50">{l}</span></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-[12px] font-bold text-amber uppercase tracking-[.1em] mb-4">Complaints</h4>
            <ul className="space-y-2.5">
              {[["NCH Portal","https://consumerhelpline.gov.in"],["eDaakhil","https://edaakhil.nic.in"],["INGRAM","https://ingram.dpiit.gov.in"],["IRCTC Helpline","https://www.irctc.co.in"]].map(([label, href]) => (
                <li key={href}><a href={href} target="_blank" rel="noopener noreferrer" className="text-[14px] text-white/50 hover:text-white transition-colors">{label}</a></li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 md:px-10 pt-7 border-t border-white/7 flex flex-wrap justify-between gap-3 text-[12px] text-white/35">
        <span>© 2025 DaamCheck. Free for all Indians.</span>
        <span>Not affiliated with any government body.</span>
      </div>
    </footer>
  );
}
