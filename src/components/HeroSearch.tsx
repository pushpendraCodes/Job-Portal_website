"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { TRENDING_SEARCHES } from "@/lib/jobBrowse";
import { IconGrid, IconPin, IconSearch } from "@/components/ui/Icons";
import { optionLabel } from "@/lib/formOptions";
import type { JobCategory } from "@/lib/types";
import { categoryName } from "@/lib/types";

export function HeroSearch({ categories = [] }: { categories?: JobCategory[] }) {
  const t = useTranslations("jobs");
  const tHome = useTranslations("home");
  const locale = useLocale();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [city, setCity] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const go = (params: URLSearchParams) => {
    router.push(`/jobs${params.toString() ? `?${params}` : ""}`);
  };

  return (
    <div>
      <form
        className="hero-bar"
        onSubmit={(e) => {
          e.preventDefault();
          const params = new URLSearchParams();
          if (q.trim()) params.set("q", q.trim());
          if (city.trim()) params.set("city", city.trim());
          if (categoryId) params.set("categoryId", categoryId);
          go(params);
        }}
      >
        <label className="hero-bar-field">
          <IconSearch className="h-4 w-4" />
          <span className="sr-only">{t("keyword")}</span>
          <input
            className="hero-bar-input"
            placeholder={t("searchSimple")}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </label>
        <label className="hero-bar-field">
          <IconGrid className="h-4 w-4" />
          <span className="sr-only">{t("allCategories")}</span>
          <select
            className="hero-bar-input hero-bar-select"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">{t("allCategories")}</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {categoryName(category, locale)}
              </option>
            ))}
          </select>
        </label>
        <label className="hero-bar-field">
          <IconPin className="h-4 w-4" />
          <span className="sr-only">{t("location")}</span>
          <input
            className="hero-bar-input"
            placeholder={t("cityPlaceholder")}
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </label>
        <button type="submit" className="btn btn-primary hero-bar-submit">
          {t("searchCta")}
        </button>
      </form>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-ink-mute">{tHome("trending")}</span>
        {TRENDING_SEARCHES.slice(0, 6).map((item) => (
          <button
            key={item.query}
            type="button"
            onClick={() => go(new URLSearchParams({ q: item.query }))}
            className="chip transition hover:border-accent hover:text-accent-deep"
          >
            {optionLabel(item, locale)}
          </button>
        ))}
      </div>
    </div>
  );
}
