// Small hand-drawn icon set, used instead of stock imagery. No external assets,
// no license concerns, themeable via currentColor.

export function IconCheck({ size = 14, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <circle cx="10" cy="10" r="9" fill="var(--brand-soft)" stroke="var(--brand)" strokeWidth="1.2" />
      <path d="M6 10.3l2.6 2.6L14.2 7" stroke="var(--brand)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconClock({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <circle cx="10" cy="10" r="8.3" stroke="var(--amber)" strokeWidth="1.4" />
      <path d="M10 5.5V10l3 2" stroke="var(--amber)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconWarning({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path
        d="M10 2.6L18.2 16.6a1 1 0 01-.86 1.5H2.66a1 1 0 01-.86-1.5L10 2.6z"
        fill="var(--danger-bg)"
        stroke="var(--danger)"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path d="M10 8v3.6" stroke="var(--danger)" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="10" cy="14.3" r="0.9" fill="var(--danger)" />
    </svg>
  );
}

export function IconShieldCheck({ size = 18, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path
        d="M10 2l6.5 2.3v4.9c0 4-2.6 7.3-6.5 8.6-3.9-1.3-6.5-4.6-6.5-8.6V4.3L10 2z"
        fill="var(--good-bg)"
        stroke="var(--good)"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path d="M6.8 10.2l2.1 2.1 4.1-4.4" stroke="var(--good)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
