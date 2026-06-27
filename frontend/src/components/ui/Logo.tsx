interface LogoMarkProps {
  size?: number;
  className?: string;
}

export function LogoMark({ size = 32, className = "" }: LogoMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="9" fill="#059669" />
      {/* Bill / receipt lines */}
      <line x1="7" y1="9" x2="22" y2="9" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="7" y1="14" x2="18" y2="14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.8" />
      <line x1="7" y1="19" x2="20" y2="19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.6" />
      {/* Check badge */}
      <circle cx="23" cy="24" r="6" fill="#047857" />
      <path
        d="M20.5 24l2 2 3.5-4"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
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
