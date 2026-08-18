"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

export function HeroSearch() {
  const t = useTranslations("jobs");
  const router = useRouter();
  const [q, setQ] = useState("");
  const [city, setCity] = useState("");

  return (
    <form
      className="flex flex-col gap-2 rounded-[18px] border border-white/15 bg-white/95 p-2 shadow-lg sm:flex-row"
      onSubmit={(e) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (q) params.set("q", q);
        if (city) params.set("city", city);
        router.push(`/jobs${params.toString() ? `?${params}` : ""}`);
      }}
    >
      <input
        className="min-w-0 flex-[1.6] rounded-[12px] border-none bg-transparent px-4 py-3 text-ink outline-none placeholder:text-ink-mute"
        placeholder={t("search")}
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <span className="hidden w-px self-stretch bg-line sm:block" />
      <input
        className="min-w-0 flex-1 rounded-[12px] border-none bg-transparent px-4 py-3 text-ink outline-none placeholder:text-ink-mute"
        placeholder={t("cityPlaceholder")}
        value={city}
        onChange={(e) => setCity(e.target.value)}
      />
      <button type="submit" className="btn btn-primary shrink-0">
        {t("searchCta")}
      </button>
    </form>
  );
}
