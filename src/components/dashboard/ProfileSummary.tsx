"use client";

import { useTranslations } from "next-intl";
import type { EducationEntry, ExperienceEntry } from "@/lib/types";

export function formatMonthYear(value?: string, locale = "en"): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(locale === "hi" ? "hi-IN" : "en-IN", {
    month: "short",
    year: "numeric",
  });
}

export function ExperienceList({
  items,
  locale,
}: {
  items: ExperienceEntry[];
  locale: string;
}) {
  const t = useTranslations("dashboard");

  return (
    <div>
      {items.map((item, index) => (
        <div key={item._id ?? index} className="flex gap-4">
          <div className="flex w-3 shrink-0 flex-col items-center pt-1.5">
            <span className="h-3 w-3 shrink-0 rounded-full border-[3px] border-accent bg-white" />
            {index < items.length - 1 && (
              <span aria-hidden className="my-1 w-0.5 flex-1 min-h-6 bg-line" />
            )}
          </div>
          <div className={`min-w-0 flex-1 ${index < items.length - 1 ? "pb-6" : ""}`}>
            <p className="font-semibold text-ink">{item.designation}</p>
            <p className="text-sm text-ink-soft">
              {item.companyName}
              {item.city ? ` · ${item.city}` : ""}
            </p>
            <p className="mt-0.5 text-xs text-ink-mute">
              {formatMonthYear(item.fromDate, locale)} –{" "}
              {item.currentlyWorking ? t("present") : formatMonthYear(item.toDate, locale)}
            </p>
            {item.description && (
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{item.description}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export function EducationList({ items }: { items: EducationEntry[] }) {
  return (
    <div>
      {items.map((item, index) => (
        <div key={item._id ?? index} className="flex gap-4">
          <div className="flex w-3 shrink-0 flex-col items-center pt-1.5">
            <span className="h-3 w-3 shrink-0 rounded-full border-[3px] border-accent bg-white" />
            {index < items.length - 1 && (
              <span aria-hidden className="my-1 w-0.5 flex-1 min-h-6 bg-line" />
            )}
          </div>
          <div className={`min-w-0 flex-1 ${index < items.length - 1 ? "pb-6" : ""}`}>
            <p className="font-semibold text-ink">{item.degree}</p>
            <p className="text-sm text-ink-soft">
              {[item.institute, item.boardUniversity].filter(Boolean).join(" · ")}
            </p>
            <p className="mt-0.5 text-xs text-ink-mute">
              {[
                item.yearOfPassing ? String(item.yearOfPassing) : "",
                item.marksPercentage != null ? `${item.marksPercentage}%` : "",
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function SectionCard({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="card p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-display text-xl text-ink">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function StatTile({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string | number;
  tone?: "default" | "accent";
}) {
  return (
    <div
      className={`rounded-[14px] border p-4 ${
        tone === "accent" ? "border-accent/20 bg-accent-tint" : "border-line bg-white"
      }`}
    >
      <p className="font-display text-2xl text-ink">{value}</p>
      <p className="mt-0.5 text-xs font-medium text-ink-soft">{label}</p>
    </div>
  );
}
