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
import { POPULAR_CITIES, SALARY_STEPS } from "@/lib/jobBrowse";

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

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-mute">
      {children}
    </h3>
  );
}

function FilterOption({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className={`filter-check ${active ? "filter-check-on" : ""}`}
      onClick={onClick}
    >
      <span className="filter-dot" aria-hidden="true">
        {active ? "✓" : ""}
      </span>
      <span className="min-w-0 truncate">{children}</span>
    </button>
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
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

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
  if (filters.q) chosen.push({ key: "q", label: filters.q, clear: { q: "" } });
  if (selectedCategory) {
    chosen.push({
      key: "categoryId",
      label: categoryName(selectedCategory, locale),
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
  if (filters.city) chosen.push({ key: "city", label: filters.city, clear: { city: "" } });
  if (filters.salaryMin) {
    chosen.push({
      key: "salaryMin",
      label: `₹${Number(filters.salaryMin).toLocaleString("en-IN")}+`,
      clear: { salaryMin: "" },
    });
  }
  if (filters.employmentType) {
    const option = EMPLOYMENT_TYPES.find((o) => o.value === filters.employmentType);
    chosen.push({
      key: "employmentType",
      label: option ? optionLabel(option, locale) : filters.employmentType,
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

  const filterPanel = (
    <aside className="jobs-filters">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-ink">{t("jobs.filters")}</h2>
        {chosen.length > 0 && (
          <button type="button" className="text-xs font-semibold text-accent" onClick={clearAll}>
            {t("jobs.clear")}
          </button>
        )}
      </div>

      <div className="jobs-filter-group">
        <div className="flex items-center justify-between gap-2">
          <GroupLabel>{t("jobs.step1")}</GroupLabel>
          {categories.length > TRADES_COLLAPSED && (
            <button
              type="button"
              className="text-[11px] font-semibold text-accent"
              onClick={() => setShowAllTrades((v) => !v)}
            >
              {showAllTrades ? t("jobs.showLess") : t("jobs.showMore")}
            </button>
          )}
        </div>
        <FilterOption
          active={!filters.categoryId}
          onClick={() => patch({ categoryId: "", subcategoryId: "" })}
        >
          {t("jobs.anyTrade")}
        </FilterOption>
        {visibleTrades.map((category) => (
          <FilterOption
            key={category._id}
            active={filters.categoryId === category._id}
            onClick={() => patch({ categoryId: category._id, subcategoryId: "" })}
          >
            {categoryName(category, locale)}
          </FilterOption>
        ))}
      </div>

      {subcategories.length > 0 && (
        <div className="jobs-filter-group">
          <GroupLabel>{t("jobs.subcategory")}</GroupLabel>
          <FilterOption active={!filters.subcategoryId} onClick={() => patch({ subcategoryId: "" })}>
            {t("jobs.allSubcategories")}
          </FilterOption>
          {subcategories.map((sub) => (
            <FilterOption
              key={sub._id}
              active={filters.subcategoryId === sub._id}
              onClick={() => patch({ subcategoryId: sub._id })}
            >
              {categoryName(sub, locale)}
            </FilterOption>
          ))}
        </div>
      )}

      <div className="jobs-filter-group">
        <GroupLabel>{t("jobs.step2")}</GroupLabel>
        <FilterOption
          active={!filters.city}
          onClick={() => {
            setShowCityInput(false);
            patch({ city: "" });
          }}
        >
          {t("jobs.anyCity")}
        </FilterOption>
        {POPULAR_CITIES.map((city) => (
          <FilterOption
            key={city}
            active={filters.city === city}
            onClick={() => {
              setShowCityInput(false);
              patch({ city });
            }}
          >
            {city}
          </FilterOption>
        ))}
        <FilterOption
          active={showCityInput}
          onClick={() => setShowCityInput((v) => !v)}
        >
          {t("jobs.otherCity")}
        </FilterOption>
        {showCityInput && (
          <input
            className="input mt-2 h-9 text-sm"
            placeholder={t("jobs.cityPlaceholder")}
            defaultValue={POPULAR_CITIES.includes(filters.city) ? "" : filters.city}
            onChange={(e) => patch({ city: e.target.value.trim() })}
            aria-label={t("auth.city")}
          />
        )}
      </div>

      <div className="jobs-filter-group">
        <GroupLabel>{t("jobs.step3")}</GroupLabel>
        <FilterOption active={!filters.salaryMin} onClick={() => patch({ salaryMin: "" })}>
          {t("jobs.anySalary")}
        </FilterOption>
        {SALARY_STEPS.map((step) => (
          <FilterOption
            key={step.value}
            active={filters.salaryMin === step.value}
            onClick={() => patch({ salaryMin: step.value })}
          >
            {optionLabel(step, locale)}
          </FilterOption>
        ))}
      </div>

      <div className="jobs-filter-group">
        <GroupLabel>{t("jobs.step4")}</GroupLabel>
        <FilterOption
          active={!filters.employmentType}
          onClick={() => patch({ employmentType: "" })}
        >
          {t("jobs.anyType")}
        </FilterOption>
        {EMPLOYMENT_TYPES.map((option) => (
          <FilterOption
            key={option.value}
            active={filters.employmentType === option.value}
            onClick={() => patch({ employmentType: option.value })}
          >
            {optionLabel(option, locale)}
          </FilterOption>
        ))}
      </div>
    </aside>
  );

  return (
    <div className="min-h-[70vh] bg-paper pb-10">
      <div className="container-x pt-5 sm:pt-7">
        <div className="jobs-layout">
          <div className="hidden lg:block lg:sticky lg:top-24">{filterPanel}</div>

          <div ref={resultsRef} className="min-w-0">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h1 className="font-display text-2xl text-ink sm:text-[1.75rem]">{t("jobs.findWork")}</h1>
                <p className="mt-1 text-sm text-ink-soft">{t("jobs.findWorkSub")}</p>
              </div>
              <button
                type="button"
                className="btn btn-outline btn-sm lg:hidden"
                onClick={() => setMobileFiltersOpen(true)}
              >
                {t("jobs.filters")}
                {chosen.length > 0 ? ` (${chosen.length})` : ""}
              </button>
            </div>

            <form
              className="mt-4 flex flex-wrap items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                patch({ q: qDraft.trim() });
              }}
            >
              <input
                className="input h-11 flex-1 text-sm"
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
              <button type="submit" className="btn btn-primary h-11 px-5 text-sm">
                {t("jobs.searchCta")}
              </button>
            </form>

            {chosen.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                {chosen.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    className="pick-tag pick-tag-sm"
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
                <button type="button" className="text-xs font-semibold text-accent" onClick={clearAll}>
                  {t("jobs.clear")}
                </button>
              </div>
            )}

            <p className="mt-5 text-sm font-semibold text-ink">
              {loading ? t("common.loading") : t("jobs.jobsFound", { count: total })}
            </p>

            {error && (
              <Alert tone="error" className="mt-3">
                {error}
              </Alert>
            )}

            {loading ? (
              <div className="mt-3 grid gap-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <JobCardSkeleton key={index} />
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <div className="mt-3 rounded-[12px] border border-dashed border-line bg-surface px-6 py-12 text-center">
                <h3 className="font-display text-lg text-ink">{t("jobs.noJobsSimple")}</h3>
                <p className="mx-auto mt-1 max-w-sm text-sm text-ink-soft">
                  {t("jobs.noJobsSimpleHint")}
                </p>
                {chosen.length > 0 && (
                  <button type="button" className="btn btn-primary mt-4 btn-sm" onClick={clearAll}>
                    {t("jobs.removeFilters")}
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="mt-3 grid gap-3">
                  {jobs.map((job) => (
                    <JobListItem key={job._id} job={job} locale={locale} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-6 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      disabled={page <= 1}
                      onClick={() => goToPage(page - 1)}
                    >
                      ← {t("common.previous")}
                    </button>
                    <span className="text-xs font-semibold text-ink-soft">
                      {t("jobs.pageOf", { page, total: totalPages })}
                    </span>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      disabled={page >= totalPages}
                      onClick={() => goToPage(page + 1)}
                    >
                      {t("common.next")} →
                    </button>
                  </div>
                )}
              </>
            )}

            <div className="mt-8 text-center">
              <Link href="/auth/register/seeker" className="btn btn-outline btn-sm">
                {t("auth.iAmSeeker")}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {mobileFiltersOpen && (
        <div className="lg:hidden">
          <button
            type="button"
            aria-label={t("nav.close")}
            className="sheet-backdrop"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="sheet">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-ink">{t("jobs.filters")}</span>
              <button
                type="button"
                className="text-sm font-semibold text-accent"
                onClick={() => setMobileFiltersOpen(false)}
              >
                {t("nav.close")}
              </button>
            </div>
            {filterPanel}
          </div>
        </div>
      )}
    </div>
  );
}

export default function JobsPage() {
  return (
    <Suspense
      fallback={
        <div className="container-x grid gap-3 py-8">
          <JobCardSkeleton />
          <JobCardSkeleton />
        </div>
      }
    >
      <JobsBrowser />
    </Suspense>
  );
}