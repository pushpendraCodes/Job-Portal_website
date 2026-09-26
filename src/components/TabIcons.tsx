type TabIconProps = {
  name: "home" | "jobs" | "trades" | "workers" | "hire";
};

export function TabIcon({ name }: TabIconProps) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "tabbar-icon",
    "aria-hidden": true,
  };

  if (name === "home") {
    return (
      <svg {...common}>
        <path d="M4 10.5 12 4l8 6.5V20a1.4 1.4 0 0 1-1.4 1.4H5.4A1.4 1.4 0 0 1 4 20z" />
        <path d="M9.5 21.4V13.8h5v7.6" />
      </svg>
    );
  }

  if (name === "jobs") {
    return (
      <svg {...common}>
        <rect x="3.5" y="7.5" width="17" height="12" rx="2" />
        <path d="M8 7.5V6.2A2.2 2.2 0 0 1 10.2 4h3.6A2.2 2.2 0 0 1 16 6.2v1.3" />
        <path d="M3.5 12.5h17" />
      </svg>
    );
  }

  if (name === "trades") {
    return (
      <svg {...common}>
        <rect x="3.5" y="3.5" width="7.2" height="7.2" rx="1.4" />
        <rect x="13.3" y="3.5" width="7.2" height="7.2" rx="1.4" />
        <rect x="3.5" y="13.3" width="7.2" height="7.2" rx="1.4" />
        <rect x="13.3" y="13.3" width="7.2" height="7.2" rx="1.4" />
      </svg>
    );
  }

  if (name === "workers") {
    return (
      <svg {...common}>
        <circle cx="12" cy="8" r="3.2" />
        <path d="M5.2 19.4c.7-3.1 3.4-5 6.8-5s6.1 1.9 6.8 5" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M4 20.5V8.6L12 4l8 4.6v11.9" />
      <path d="M9 20.5v-6.2h6v6.2" />
      <path d="M8.2 10.6h7.6" />
    </svg>
  );
}
