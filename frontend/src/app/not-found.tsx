import Link from "next/link";
import { LogoMark } from "@/components/ui/Logo";

const tools = [
  {
    href: "/gst-checker",
    label: "GST Checker",
    desc: "Verify restaurant & hotel GST charges",
  },
  {
    href: "/irctc-prices",
    label: "IRCTC Prices",
    desc: "Official train food price caps",
  },
  {
    href: "/scan-bill",
    label: "Scan a Bill",
    desc: "Upload your bill for instant analysis",
  },
];

export default function NotFound() {
  return (
    <section className="flex flex-col items-center justify-center min-h-[65vh] px-6 py-20 text-center">
      {/* Icon */}
      <LogoMark size={56} className="mb-6 opacity-20" />

      {/* Heading */}
      <p className="text-[13px] font-semibold uppercase tracking-widest text-green mb-3">
        404
      </p>
      <h1 className="text-3xl md:text-4xl font-black text-ink tracking-tight2 leading-tight">
        Page not found
      </h1>
      <p className="text-ink-3 mt-3 max-w-xs text-[15px]">
        That page does not exist. Try one of the tools below.
      </p>

      {/* Tool cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-10 w-full max-w-lg text-left">
        {tools.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="group border border-line bg-line-3 hover:border-green-mid hover:bg-green-pale rounded-xl p-4 transition-colors"
          >
            <p className="text-[14px] font-semibold text-ink group-hover:text-green">
              {t.label}
            </p>
            <p className="text-[12px] text-ink-4 mt-0.5 leading-snug">{t.desc}</p>
          </Link>
        ))}
      </div>

      {/* Home CTA */}
      <Link
        href="/"
        className="mt-8 inline-flex items-center bg-green hover:bg-green-dark text-white text-[14px] font-bold rounded-full px-6 py-2.5 transition-colors"
      >
        Go home
      </Link>
    </section>
  );
}
