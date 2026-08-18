"use client";

import { useTranslations } from "next-intl";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  const t = useTranslations();

  return (
    <div className="mesh-bg flex min-h-[70vh] items-center py-16">
      <div className="container-x text-center">
        <p className="font-display text-6xl text-accent/25">!</p>
        <h1 className="mt-3 font-display text-3xl text-ink">{t("common.error")}</h1>
        <p className="mx-auto mt-3 max-w-md text-ink-soft">{t("common.errorHint")}</p>
        <button type="button" className="btn btn-primary mt-7" onClick={reset}>
          {t("common.retry")}
        </button>
      </div>
    </div>
  );
}
