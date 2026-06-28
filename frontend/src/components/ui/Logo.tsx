interface LogoMarkProps {
  size?: number;
  className?: string;
}

export function LogoMark({ size = 32, className = "" }: LogoMarkProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/favicon.svg"
      alt="DaamCheck"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      style={{ display: "inline-block" }}
    />
  );
}

interface LogoProps {
  className?: string;
  iconSize?: number;
}

export function Logo({ className = "", iconSize = 32 }: LogoProps) {
  return (
    <span className={`flex items-center gap-2 ${className}`}>
      <LogoMark size={iconSize} />
      <span className="text-[18px] font-extrabold text-ink tracking-[-0.4px]">
        Daam<span className="text-green">Check</span>
      </span>
    </span>
  );
}
