type IconProps = { className?: string };

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function IconSearch({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" {...stroke}>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.4-3.4" />
    </svg>
  );
}

export function IconGrid({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" {...stroke}>
      <rect x="4" y="4" width="7" height="7" rx="1.2" />
      <rect x="13" y="4" width="7" height="7" rx="1.2" />
      <rect x="4" y="13" width="7" height="7" rx="1.2" />
      <rect x="13" y="13" width="7" height="7" rx="1.2" />
    </svg>
  );
}

export function IconPin({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" {...stroke}>
      <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.2" />
    </svg>
  );
}

export function IconClock({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" {...stroke}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4.4L15 15" />
    </svg>
  );
}

export function IconRupee({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" {...stroke}>
      <path d="M7 6h10M7 10h10M7 6c4 0 6 2 6 4s-2 4-6 4h-1l8 8" />
    </svg>
  );
}

export function IconDashboard({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" {...stroke}>
      <rect x="4" y="4" width="7" height="7" rx="1.2" />
      <rect x="13" y="4" width="7" height="4" rx="1.2" />
      <rect x="13" y="10" width="7" height="10" rx="1.2" />
      <rect x="4" y="13" width="7" height="7" rx="1.2" />
    </svg>
  );
}

export function IconSettings({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" {...stroke}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 4.5v1.6M12 17.9v1.6M4.5 12h1.6M17.9 12h1.6M6.4 6.4l1.1 1.1M16.5 16.5l1.1 1.1M17.6 6.4l-1.1 1.1M7.5 16.5l-1.1 1.1" />
    </svg>
  );
}

export function IconTalent({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" {...stroke}>
      <circle cx="9" cy="8" r="3" />
      <path d="M4.5 18.5c.6-3 2.6-4.5 4.5-4.5s3.9 1.5 4.5 4.5" />
      <circle cx="16.5" cy="9" r="2.2" />
      <path d="M15.2 18.5c.4-2.1 1.7-3.3 3.3-3.3 1 0 1.9.5 2.5 1.4" />
    </svg>
  );
}

export function IconPlus({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" {...stroke}>
      <path d="M12 6v12M6 12h12" />
    </svg>
  );
}

export function IconOffice({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" {...stroke}>
      <rect x="4" y="6" width="16" height="14" rx="1.4" />
      <path d="M9 20v-5h6v5M8 10h.01M12 10h.01M16 10h.01M8 14h.01M16 14h.01" />
    </svg>
  );
}

export function IconLogout({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" {...stroke}>
      <path d="M10 6H6.5A1.5 1.5 0 0 0 5 7.5v9A1.5 1.5 0 0 0 6.5 18H10" />
      <path d="M10 12h9M16 8l4 4-4 4" />
    </svg>
  );
}

export function IconCheck({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" {...stroke}>
      <path d="M5 12.5 9.2 17 19 7" />
    </svg>
  );
}

export function IconWorker({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" {...stroke}>
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5.5 19c.8-3.6 3.2-5.4 6.5-5.4S17.7 15.4 18.5 19" />
    </svg>
  );
}

export function IconMill({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" {...stroke}>
      <path d="M4 20V9l8-5 8 5v11" />
      <path d="M9 20v-6h6v6" />
    </svg>
  );
}

export function IconSpinner({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.25" />
      <path d="M20 12a8 8 0 0 0-8-8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconBell({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" {...stroke}>
      <path d="M6.2 9.6a5.8 5.8 0 0 1 11.6 0c0 4.1 1.2 5.5 1.2 5.5H5s1.2-1.4 1.2-5.5Z" />
      <path d="M10 18.4a2 2 0 0 0 4 0" />
    </svg>
  );
}

export function CategoryMark({ label }: { label: string }) {
  const letter = (label.trim()[0] || "T").toUpperCase();
  return (
    <span className="category-mark" aria-hidden="true">
      {letter}
    </span>
  );
}
