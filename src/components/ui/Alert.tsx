"use client";

import clsx from "clsx";

const TONES = {
  error: "border-[#fecaca] bg-[#fef2f2] text-[var(--danger)]",
  success: "border-[#a7f3d0] bg-[#ecfdf5] text-[var(--success)]",
  info: "border-line bg-mist text-ink-soft",
  warn: "border-[#fed7aa] bg-[#fff7ed] text-[var(--warm)]",
} as const;

export function Alert({
  tone = "info",
  children,
  className,
}: {
  tone?: keyof typeof TONES;
  children: React.ReactNode;
  className?: string;
}) {
  if (!children) return null;
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={clsx(
        "fade-in rounded-[12px] border px-4 py-3 text-sm font-medium",
        TONES[tone],
        className,
      )}
    >
      {children}
    </div>
  );
}
