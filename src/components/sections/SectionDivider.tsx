type DividerProps = {
  label?: string;
  number?: string;
};

export function SectionDivider({ label, number }: DividerProps) {
  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-8 mb-16">
      <div className="flex items-center gap-6">
        {number && (
          <span className="font-mono text-xs text-foreground-subtle tracking-[0.2em]">
            {number}
          </span>
        )}
        {label && (
          <span className="text-xs font-mono uppercase tracking-[0.22em] text-foreground-muted">
            {label}
          </span>
        )}
        <div className="flex-1 h-px bg-gradient-to-r from-border via-border to-transparent" />
      </div>
    </div>
  );
}
