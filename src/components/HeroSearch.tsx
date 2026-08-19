"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { TRENDING_SEARCHES } from "@/lib/jobBrowse";
import { optionLabel } from "@/lib/formOptions";

export function HeroSearch() {
  const t = useTranslations("jobs");
  const tHome = useTranslations("home");
  const locale = useLocale();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [city, setCity] = useState("");

  const go = (params: URLSearchParams) => {
    router.push(`/jobs${params.toString() ? `?${params}` : ""}`);
  };

  return (
    <div>
      <form
        className="group flex flex-col gap-1.5 rounded-[20px] border border-white/20 bg-white/95 p-2 shadow-lg backdrop-blur transition focus-within:border-accent focus-within:shadow-xl sm:flex-row sm:items-center"
        onSubmit={(e) => {
          e.preventDefault();
          const params = new URLSearchParams();
          if (q) params.set("q", q);
          if (city) params.set("city", city);
          go(params);
        }}
      >
        <label className="flex min-w-0 flex-[1.6] items-center gap-2 rounded-[14px] px-3 transition focus-within:bg-mist">
          <span aria-hidden="true" className="text-lg">
            🔎
          </span>
          <input
            className="min-w-0 flex-1 border-none bg-transparent py-3 text-ink outline-none placeholder:text-ink-mute"
            placeholder={t("search")}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label={t("search")}
          />
        </label>

        <span className="hidden w-px self-stretch bg-line sm:block" />

        <label className="flex min-w-0 flex-1 items-center gap-2 rounded-[14px] px-3 transition focus-within:bg-mist">
          <span aria-hidden="true" className="text-lg">
            📍
          </span>
          <input
            className="min-w-0 flex-1 border-none bg-transparent py-3 text-ink outline-none placeholder:text-ink-mute"
            placeholder={t("cityPlaceholder")}
            value={city}
            onChange={(e) => setCity(e.target.value)}
            aria-label={t("cityPlaceholder")}
          />
        </label>

        <button type="submit" className="btn btn-primary shrink-0 sm:px-7">
          {t("searchCta")}
        </button>
      </form>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-white/55">
          {tHome("trending")}
        </span>
        {TRENDING_SEARCHES.slice(0, 5).map((item) => (
          <button
            key={item.query}
            type="button"
            onClick={() => go(new URLSearchParams({ q: item.query }))}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-sm font-medium text-white/90 backdrop-blur transition hover:-translate-y-0.5 hover:border-white/50 hover:bg-white/20"
          >
            <span aria-hidden="true">{item.icon}</span>
            {optionLabel(item, locale)}
          </button>
        ))}
      </div>
    </div>
  );
}
