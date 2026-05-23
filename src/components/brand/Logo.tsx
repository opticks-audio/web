import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  showWordmark?: boolean;
};

/**
 * Opticks Audio mark — a stylized prism with a spectral edge.
 * Used in navbar and footer.
 */
export function Logo({ className, showWordmark = true }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <svg
        width="28"
        height="28"
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Opticks Audio"
      >
        <defs>
          <linearGradient id="op-spectrum" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="33%" stopColor="#06b6d4" />
            <stop offset="66%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
        </defs>
        {/* Outer prism */}
        <path
          d="M14 2 L26 24 L2 24 Z"
          stroke="url(#op-spectrum)"
          strokeWidth="1.5"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Inner light ray */}
        <line
          x1="14"
          y1="9"
          x2="14"
          y2="20"
          stroke="white"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.85"
        />
      </svg>
      {showWordmark && (
        <span className="font-sans text-[15px] font-medium tracking-tight text-foreground no-select">
          Opticks <span className="text-foreground-muted">Audio</span>
        </span>
      )}
    </div>
  );
}
