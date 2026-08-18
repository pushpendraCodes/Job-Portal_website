"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { api, getErrorMessage, type ApiSuccess } from "@/lib/api";
import type { Job, JobCategory } from "@/lib/types";
import { categoryName } from "@/lib/types";
import { JobListItem } from "@/components/JobListItem";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import { JobCardSkeleton } from "@/components/ui/Skeleton";
import { EMPLOYMENT_TYPES, optionLabel } from "@/lib/formOptions";

const PAGE_SIZE = 10;

function JobsBrowser() {
  const t = useTranslations();
  const locale = useLocale();
  const search = useSearchParams();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [categories, setCategories] = useState<JobCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const [q, setQ] = useState(search.get("q") ?? "");
  const [city, setCity] = useState(search.get("city") ?? "");
  const [categoryId, setCategoryId] = useState(search.get("categoryId") ?? "");
  const [subcategoryId, setSubcategoryId] = useState(search.get("subcategoryId") ?? "");
  const [employmentType, setEmploymentType] = useState("");

  const selectedCategory = useMemo(
    () => categories.find((c) => c._id === categoryId),
    [categories, categoryId],
  );
  const subcategories = selectedCategory?.subcategories ?? [];

  const load = useCallback(
    async (targetPage = 1) => {
      setLoading(true);
      setError("");
      try {
        const params: Record<string, string> = {
          limit: String(PAGE_SIZE),
          page: String(targetPage),
        };
        if (q) params.q = q;
        if (city) params.city = city;
        if (categoryId) params.categoryId = categoryId;
        if (subcategoryId) params.subcategoryId = subcategoryId;
        if (employmentType) params.employmentType = employmentType;

        const { data } = await api.get<ApiSuccess<Job[]>>("/jobs", { params });
        setJobs(data.data);
        setTotal(data.meta?.total ?? data.data.length);
        setPage(targetPage);
      } catch (err) {
        setError(getErrorMessage(err, t("common.error")));
      } finally {
        setLoading(false);
      }
    },
    [q, city, categoryId, subcategoryId, employmentType, t],
  );

  useEffect(() => {
    void load(1);
    void api
      .get<ApiSuccess<JobCategory[]>>("/categories")
      .then(({ data }) => setCategories(data.data))
      .catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasFilters = !!(q || city || categoryId || subcategoryId || employmentType);

  const resetFilters = () => {
    setQ("");
    setCity("");
    setCategoryId("");
    setSubcategoryId("");
    setEmploymentType("");
  };

  return (
    <div className="mesh-bg min-h-[80vh] py-8 sm:py-10">
      <div className="container-x">
        <div className="max-w-2xl">
          <p className="eyebrow">{t("jobs.eyebrow")}</p>
          <h1 className="mt-2 font-display text-3xl text-ink sm:text-4xl">{t("jobs.title")}</h1>
          <p className="mt-2 text-ink-soft">{t("jobs.subtitle")}</p>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[290px_1fr]">
          <aside className="h-fit lg:sticky lg:top-24">
            <form
              className="panel space-y-4 p-5"
              onSubmit={(e) => {
                e.preventDefault();
                void load(1);
              }}
            >
              <div className="flex items-center justify-between">
                <p className="font-display text-lg text-ink">{t("jobs.filters")}</p>
                {hasFilters && (
                  <button
                    type="button"
                    className="text-xs font-semibold text-accent"
                    onClick={() => {
                      resetFilters();
                      setTimeout(() => void load(1), 0);
                    }}
                  >
                    {t("jobs.clear")}
                  </button>
                )}
              </div>

              <div>
                <label className="label">{t("jobs.keyword")}</label>
                <input
                  className="input"
                  placeholder={t("jobs.search")}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </div>

              <div>
                <label className="label">{t("auth.city")}</label>
                <input
                  className="input"
                  placeholder={t("jobs.cityPlaceholder")}
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>

              <div>
                <label className="label">{t("employer.category")}</label>
                <select
                  className="select"
                  value={categoryId}
                  onChange={(e) => {
                    setCategoryId(e.target.value);
                    setSubcategoryId("");
                  }}
                >
                  <option value="">{t("jobs.allCategories")}</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {categoryName(category, locale)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">{t("jobs.subcategory")}</label>
                <select
                  className="select"
                  value={subcategoryId}
                  disabled={!categoryId || subcategories.length === 0}
                  onChange={(e) => setSubcategoryId(e.target.value)}
                >
                  <option value="">{t("jobs.allSubcategories")}</option>
                  {subcategories.map((sub) => (
                    <option key={sub._id} value={sub._id}>
                      {categoryName(sub, locale)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">{t("jobs.employmentType")}</label>
                <select
                  className="select"
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value)}
                >
                  <option value="">{t("jobs.allTypes")}</option>
                  {EMPLOYMENT_TYPES.map((option) => (
                    <option key={option.value} value={option.value}>
                      {optionLabel(option, locale)}
                    </option>
                  ))}
                </select>
              </div>

              <button type="submit" className="btn btn-primary w-full">
                {t("jobs.applyFilters")}
              </button>
            </form>
          </aside>

          <div>
            <div className="mb-4 flex items-center justify-between text-sm text-ink-soft">
              <span>
                {loading
                  ? t("common.loading")
                  : t("jobs.resultCount", { count: total })}
              </span>
            </div>

            {error && <Alert tone="error" className="mb-4">{error}</Alert>}

            {loading ? (
              <div className="grid gap-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <JobCardSkeleton key={index} />
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <EmptyState
                icon="🔍"
                title={t("jobs.noJobs")}
                description={t("jobs.noJobsHint")}
                action={
                  hasFilters ? (
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => {
                        resetFilters();
                        setTimeout(() => void load(1), 0);
                      }}
                    >
                      {t("jobs.clear")}
                    </button>
                  ) : (
                    <Link href="/auth/register/seeker" className="btn btn-primary btn-sm">
                      {t("auth.iAmSeeker")}
                    </Link>
                  )
                }
              />
            ) : (
              <>
                <div className="grid gap-4">
                  {jobs.map((job) => (
                    <JobListItem
                      key={job._id}
                      job={job}
                      locale={locale}
                      salaryLabel={t("jobs.salary")}
                    />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-3">
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      disabled={page <= 1}
                      onClick={() => void load(page - 1)}
                    >
                      ← {t("common.previous")}
                    </button>
                    <span className="text-sm text-ink-soft">
                      {page} / {totalPages}
                    </span>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      disabled={page >= totalPages}
                      onClick={() => void load(page + 1)}
                    >
                      {t("common.next")} →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
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
