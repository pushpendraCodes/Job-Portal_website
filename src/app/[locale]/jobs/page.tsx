"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { api, getErrorMessage, type ApiSuccess } from "@/lib/api";
import type { Job, JobCategory } from "@/lib/types";
import { categoryName } from "@/lib/types";
import { JobListItem } from "@/components/JobListItem";
import { Alert } from "@/components/ui/Alert";
import { JobCardSkeleton } from "@/components/ui/Skeleton";
import { EMPLOYMENT_TYPES, optionLabel } from "@/lib/formOptions";
import { POPULAR_CITIES, SALARY_STEPS, categoryIcon } from "@/lib/jobBrowse";

const PAGE_SIZE = 10;
const TRADES_COLLAPSED = 8;

type Filters = {
  q: string;
  city: string;
  categoryId: string;
  subcategoryId: string;
  employmentType: string;
  salaryMin: string;
};

const EMPTY_FILTERS: Filters = {
  q: "",
  city: "",
  categoryId: "",
  subcategoryId: "",
  employmentType: "",
  salaryMin: "",
};

/* ------------------------------------------------------------------ */

/** Mic button that fills the search box by speech — the main way in for workers who cannot type. */
function VoiceButton({
  locale,
  label,
  listeningLabel,
  unsupportedMessage,
  onResult,
}: {
  locale: string;
  label: string;
  listeningLabel: string;
  unsupportedMessage: string;
  onResult: (text: string) => void;
}) {
  const [listening, setListening] = useState(false);
  const [message, setMessage] = useState("");

  const start = () => {
    const w = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    const Recognition = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Recognition) {
      setMessage(unsupportedMessage);
      return;
    }
    const recognition = new Recognition();
    recognition.lang = locale === "hi" ? "hi-IN" : "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      const text = event.results?.[0]?.[0]?.transcript ?? "";
      if (text) onResult(text.trim());
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    setMessage("");
    setListening(true);
    recognition.start();
  };

  return (
    <>
      <button
        type="button"
        onClick={start}
        aria-label={listening ? listeningLabel : label}
        title={listening ? listeningLabel : label}
        className={`mic-btn ${listening ? "mic-btn-live" : ""}`}
      >
        🎤
      </button>
      {message && (
        <span className="basis-full text-xs text-ink-mute" role="status">
          {message}
        </span>
      )}
      {listening && (
        <span className="basis-full text-xs font-semibold text-accent-deep" role="status">
          {listeningLabel}
        </span>
      )}
    </>
  );
}

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: (event: { results: Array<Array<{ transcript: string }>> }) => void;
  onerror: () => void;
  onend: () => void;
  start: () => void;
}

/** Section wrapper that numbers each choice so the page reads as a simple sequence. */
function Step({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="mt-6">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-display text-base text-ink sm:text-lg">{title}</h2>
        {action}
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function JobsBrowser() {
  const t = useTranslations();
  const locale = useLocale();
  const search = useSearchParams();
  const resultsRef = useRef<HTMLDivElement>(null);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [categories, setCategories] = useState<JobCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const [filters, setFilters] = useState<Filters>({
    ...EMPTY_FILTERS,
    q: search.get("q") ?? "",
    city: search.get("city") ?? "",
    categoryId: search.get("categoryId") ?? "",
    subcategoryId: search.get("subcategoryId") ?? "",
  });
  const [qDraft, setQDraft] = useState(filters.q);
  const [showAllTrades, setShowAllTrades] = useState(false);
  const [showCityInput, setShowCityInput] = useState(
    !!filters.city && !POPULAR_CITIES.includes(filters.city),
  );

  const selectedCategory = useMemo(
    () => categories.find((c) => c._id === filters.categoryId),
    [categories, filters.categoryId],
  );
  const subcategories = selectedCategory?.subcategories ?? [];
  const selectedSubcategory = subcategories.find((s) => s._id === filters.subcategoryId);

  /** Any filter change restarts at page one so results never look empty by accident. */
  const patch = useCallback((next: Partial<Filters>) => {
    setPage(1);
    setFilters((prev) => ({ ...prev, ...next }));
  }, []);

  useEffect(() => {
    void api
      .get<ApiSuccess<JobCategory[]>>("/categories")
      .then(({ data }) => setCategories(data.data))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    const params: Record<string, string> = {
      limit: String(PAGE_SIZE),
      page: String(page),
    };
    for (const [key, value] of Object.entries(filters)) {
      if (value) params[key] = value;
    }

    api
      .get<ApiSuccess<Job[]>>("/jobs", { params })
      .then(({ data }) => {
        if (cancelled) return;
        setJobs(data.data);
        setTotal(data.meta?.total ?? data.data.length);
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err, t("common.error")));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [filters, page, t]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const visibleTrades = showAllTrades ? categories : categories.slice(0, TRADES_COLLAPSED);

  const chosen: Array<{ key: keyof Filters; label: string; clear: Partial<Filters> }> = [];
  if (filters.q) chosen.push({ key: "q", label: `🔎 ${filters.q}`, clear: { q: "" } });
  if (selectedCategory) {
    chosen.push({
      key: "categoryId",
      label: `${categoryIcon(selectedCategory.slug)} ${categoryName(selectedCategory, locale)}`,
      clear: { categoryId: "", subcategoryId: "" },
    });
  }
  if (selectedSubcategory) {
    chosen.push({
      key: "subcategoryId",
      label: categoryName(selectedSubcategory, locale),
      clear: { subcategoryId: "" },
    });
  }
  if (filters.city) chosen.push({ key: "city", label: `📍 ${filters.city}`, clear: { city: "" } });
  if (filters.salaryMin) {
    chosen.push({
      key: "salaryMin",
      label: `💰 ₹${Number(filters.salaryMin).toLocaleString("en-IN")}+`,
      clear: { salaryMin: "" },
    });
  }
  if (filters.employmentType) {
    const option = EMPLOYMENT_TYPES.find((o) => o.value === filters.employmentType);
    chosen.push({
      key: "employmentType",
      label: `⏰ ${option ? optionLabel(option, locale) : filters.employmentType}`,
      clear: { employmentType: "" },
    });
  }

  const clearAll = () => {
    setQDraft("");
    setShowCityInput(false);
    setShowAllTrades(false);
    setPage(1);
    setFilters(EMPTY_FILTERS);
  };

  const goToPage = (next: number) => {
    setPage(next);
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="mesh-bg min-h-[80vh] pb-12">
      <div className="container-x">
        {/* Search: speak or type */}
        <div className="pt-7 sm:pt-9">
          <h1 className="font-display text-2xl text-ink sm:text-3xl">{t("jobs.findWork")}</h1>
          <p className="mt-1 text-sm text-ink-soft sm:text-base">{t("jobs.findWorkSub")}</p>

          <form
            className="mt-4 flex flex-wrap items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              patch({ q: qDraft.trim() });
            }}
          >
            <input
              className="input h-11 flex-1 text-base"
              placeholder={t("jobs.searchSimple")}
              value={qDraft}
              onChange={(e) => setQDraft(e.target.value)}
              aria-label={t("jobs.searchSimple")}
            />
            <VoiceButton
              locale={locale}
              label={t("jobs.speak")}
              listeningLabel={t("jobs.listening")}
              unsupportedMessage={t("jobs.voiceUnsupported")}
              onResult={(text) => {
                setQDraft(text);
                patch({ q: text });
              }}
            />
            <button type="submit" className="btn btn-primary h-11 px-6">
              {t("jobs.searchCta")}
            </button>
          </form>
        </div>

        {/* 1. Trade */}
        <Step
          title={t("jobs.step1")}
          action={
            categories.length > TRADES_COLLAPSED ? (
              <button
                type="button"
                className="text-sm font-semibold text-accent"
                onClick={() => setShowAllTrades((v) => !v)}
              >
                {showAllTrades ? t("jobs.showLess") : t("jobs.showMore")}
              </button>
            ) : undefined
          }
        >
          <div className="scroll-x-hide -mx-1 flex flex-wrap gap-2 overflow-x-auto px-1 pb-1">
            <button
              type="button"
              className={`trade-tile ${!filters.categoryId ? "trade-tile-active" : ""}`}
              onClick={() => patch({ categoryId: "", subcategoryId: "" })}
            >
              <span className="trade-tile-emoji">🗂️</span>
              <span>{t("jobs.anyTrade")}</span>
            </button>
            {visibleTrades.map((category) => (
              <button
                key={category._id}
                type="button"
                className={`trade-tile ${
                  filters.categoryId === category._id ? "trade-tile-active" : ""
                }`}
                onClick={() => patch({ categoryId: category._id, subcategoryId: "" })}
              >
                <span className="trade-tile-emoji">{categoryIcon(category.slug)}</span>
                <span>{categoryName(category, locale)}</span>
              </button>
            ))}
          </div>

          {subcategories.length > 0 && (
            <div className="scroll-x-hide mt-3 flex gap-2 overflow-x-auto pb-1">
              <button
                type="button"
                className={`pick ${!filters.subcategoryId ? "pick-active" : ""}`}
                onClick={() => patch({ subcategoryId: "" })}
              >
                {t("jobs.allSubcategories")}
              </button>
              {subcategories.map((sub) => (
                <button
                  key={sub._id}
                  type="button"
                  className={`pick ${filters.subcategoryId === sub._id ? "pick-active" : ""}`}
                  onClick={() => patch({ subcategoryId: sub._id })}
                >
                  {categoryName(sub, locale)}
                </button>
              ))}
            </div>
          )}
        </Step>

        {/* 2. City */}
        <Step title={t("jobs.step2")}>
          <div className="scroll-x-hide flex flex-wrap gap-2 pb-1">
            <button
              type="button"
              className={`pick ${!filters.city ? "pick-active" : ""}`}
              onClick={() => {
                setShowCityInput(false);
                patch({ city: "" });
              }}
            >
              🌐 {t("jobs.anyCity")}
            </button>
            {POPULAR_CITIES.map((city) => (
              <button
                key={city}
                type="button"
                className={`pick ${filters.city === city ? "pick-active" : ""}`}
                onClick={() => {
                  setShowCityInput(false);
                  patch({ city });
                }}
              >
                📍 {city}
              </button>
            ))}
            <button
              type="button"
              className={`pick ${showCityInput ? "pick-active" : ""}`}
              onClick={() => setShowCityInput((v) => !v)}
            >
              ✏️ {t("jobs.otherCity")}
            </button>
          </div>

          {showCityInput && (
            <form
              className="mt-3 flex max-w-sm gap-2"
              onSubmit={(e) => {
                e.preventDefault();
              }}
            >
              <input
                className="input h-11 text-base"
                placeholder={t("jobs.cityPlaceholder")}
                defaultValue={POPULAR_CITIES.includes(filters.city) ? "" : filters.city}
                onChange={(e) => patch({ city: e.target.value.trim() })}
                aria-label={t("auth.city")}
              />
            </form>
          )}
        </Step>

        {/* 3. Salary */}
        <Step title={t("jobs.step3")}>
          <div className="scroll-x-hide flex flex-wrap gap-2 pb-1">
            <button
              type="button"
              className={`pick ${!filters.salaryMin ? "pick-active" : ""}`}
              onClick={() => patch({ salaryMin: "" })}
            >
              {t("jobs.anySalary")}
            </button>
            {SALARY_STEPS.map((step) => (
              <button
                key={step.value}
                type="button"
                className={`pick ${filters.salaryMin === step.value ? "pick-active" : ""}`}
                onClick={() => patch({ salaryMin: step.value })}
              >
                💰 {optionLabel(step, locale)}
              </button>
            ))}
          </div>
        </Step>

        {/* 4. Job type */}
        <Step title={t("jobs.step4")}>
          <div className="scroll-x-hide flex flex-wrap gap-2 pb-1">
            <button
              type="button"
              className={`pick ${!filters.employmentType ? "pick-active" : ""}`}
              onClick={() => patch({ employmentType: "" })}
            >
              {t("jobs.anyType")}
            </button>
            {EMPLOYMENT_TYPES.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`pick ${
                  filters.employmentType === option.value ? "pick-active" : ""
                }`}
                onClick={() => patch({ employmentType: option.value })}
              >
                ⏰ {optionLabel(option, locale)}
              </button>
            ))}
          </div>
        </Step>

        {/* Choices made so far */}
        {chosen.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-ink-soft">{t("jobs.yourChoice")}:</span>
            {chosen.map((item) => (
              <button
                key={item.key}
                type="button"
                className="pick-tag"
                onClick={() => {
                  if (item.key === "q") setQDraft("");
                  patch(item.clear);
                }}
              >
                {item.label}
                <span className="pick-tag-x" aria-hidden="true">
                  ✕
                </span>
              </button>
            ))}
            <button type="button" className="btn btn-outline btn-sm" onClick={clearAll}>
              {t("jobs.clear")}
            </button>
          </div>
        )}

        {/* Results */}
        <div ref={resultsRef} className="mt-7 scroll-mt-24">
          <p className="font-display text-lg text-ink sm:text-xl">
            {loading ? t("common.loading") : t("jobs.jobsFound", { count: total })}
          </p>

          {error && (
            <Alert tone="error" className="mt-3">
              {error}
            </Alert>
          )}

          {loading ? (
            <div className="mt-4 grid gap-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <JobCardSkeleton key={index} />
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="mt-4 rounded-[16px] border border-dashed border-line bg-white/70 px-6 py-12 text-center">
              <div className="text-4xl">🔍</div>
              <h3 className="mt-3 font-display text-xl text-ink">{t("jobs.noJobsSimple")}</h3>
              <p className="mx-auto mt-2 max-w-sm text-sm text-ink-soft">
                {t("jobs.noJobsSimpleHint")}
              </p>
              {chosen.length > 0 && (
                <button type="button" className="btn btn-primary mt-5" onClick={clearAll}>
                  {t("jobs.removeFilters")}
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="mt-4 grid gap-3">
                {jobs.map((job) => (
                  <JobListItem key={job._id} job={job} locale={locale} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    className="btn btn-outline"
                    disabled={page <= 1}
                    onClick={() => goToPage(page - 1)}
                  >
                    ← {t("common.previous")}
                  </button>
                  <span className="text-sm font-semibold text-ink-soft">
                    {t("jobs.pageOf", { page, total: totalPages })}
                  </span>
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={page >= totalPages}
                    onClick={() => goToPage(page + 1)}
                  >
                    {t("common.next")} →
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <div className="mt-10 text-center">
          <Link href="/auth/register/seeker" className="btn btn-dark">
            {t("auth.iAmSeeker")}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function JobsPage() {
  return (
    <Suspense
      fallback={
        <div className="container-x grid gap-4 py-10">
          <JobCardSkeleton />
          <JobCardSkeleton />
        </div>
      }
    >
      <JobsBrowser />
    </Suspense>
  );
}
