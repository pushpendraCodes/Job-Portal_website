"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { api, getErrorMessage, type ApiSuccess } from "@/lib/api";
import type { JobSeekerProfile } from "@/lib/types";
import { useAppSelector } from "@/store/hooks";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { ApplicantProfileDrawer } from "@/components/employer/ApplicantProfileDrawer";
import { EMPLOYMENT_TYPES, QUALIFICATION_LEVELS, optionLabel } from "@/lib/formOptions";

const PAGE_SIZE = 12;

/** Card projection returned by GET /talent — no contact details. */
type Candidate = Pick<
  JobSeekerProfile,
  | "_id"
  | "fullName"
  | "fullNameHi"
  | "headline"
  | "photoUrl"
  | "city"
  | "state"
  | "skills"
  | "languages"
  | "experienceYears"
  | "experienceMonths"
  | "highestQualification"
  | "expectedSalary"
  | "noticePeriodDays"
  | "preferredEmploymentType"
  | "willingToRelocate"
  | "resumeUrl"
  | "summary"
> & { userId: string };

type CandidateDetail = {
  user: { mobile?: string; email?: string };
  profile: JobSeekerProfile;
  appliedToMine: number;
};

type FacetOption = { value: string; count: number };
type TalentMeta = { cities: FacetOption[]; skills: FacetOption[]; total: number };

type Filters = {
  q: string;
  city: string;
  skills: string[];
  experienceMin: string;
  salaryMax: string;
  qualification: string;
  employmentType: string;
  relocate: boolean;
  hasResume: boolean;
  sortBy: string;
};

const EMPTY_FILTERS: Filters = {
  q: "",
  city: "",
  skills: [],
  experienceMin: "",
  salaryMax: "",
  qualification: "",
  employmentType: "",
  relocate: false,
  hasResume: false,
  sortBy: "updatedAt",
};

const EXPERIENCE_STEPS = ["0", "1", "3", "5", "10"];
const SALARY_CAPS = ["10000", "15000", "20000", "30000", "50000"];

export default function EmployerTalentPage() {
  const t = useTranslations("talent");
  const td = useTranslations("employerDash");
  const tc = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const { user, hydrated } = useAppSelector((s) => s.auth);

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [meta, setMeta] = useState<TalentMeta | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [qDraft, setQDraft] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [detail, setDetail] = useState<CandidateDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const allowed = hydrated && user?.accountType === "employer";

  useEffect(() => {
    if (!hydrated) return;
    if (!user || user.accountType !== "employer") {
      router.replace("/auth/login?type=employer");
    }
  }, [hydrated, user, router]);

  const patch = useCallback((next: Partial<Filters>) => {
    setPage(1);
    setFilters((prev) => ({ ...prev, ...next }));
  }, []);

  useEffect(() => {
    if (!allowed) return;
    void api
      .get<ApiSuccess<TalentMeta>>("/talent/meta")
      .then(({ data }) => setMeta(data.data))
      .catch(() => undefined);
  }, [allowed]);

  useEffect(() => {
    if (!allowed) return;
    let cancelled = false;
    setLoading(true);
    setError("");

    const params: Record<string, string> = {
      page: String(page),
      limit: String(PAGE_SIZE),
      sortBy: filters.sortBy,
      sortOrder: filters.sortBy === "fullName" ? "asc" : "desc",
    };
    if (filters.q) params.q = filters.q;
    if (filters.city) params.city = filters.city;
    if (filters.skills.length) params.skills = filters.skills.join(",");
    if (filters.experienceMin) params.experienceMin = filters.experienceMin;
    if (filters.salaryMax) params.salaryMax = filters.salaryMax;
    if (filters.qualification) params.qualification = filters.qualification;
    if (filters.employmentType) params.employmentType = filters.employmentType;
    if (filters.relocate) params.relocate = "true";
    if (filters.hasResume) params.hasResume = "true";

    api
      .get<ApiSuccess<Candidate[]>>("/talent", { params })
      .then(({ data }) => {
        if (cancelled) return;
        setCandidates(data.data);
        setTotal(data.meta?.total ?? data.data.length);
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [allowed, filters, page]);

  const openCandidate = async (candidate: Candidate) => {
    setDetailLoading(true);
    setError("");
    try {
      const { data } = await api.get<ApiSuccess<CandidateDetail>>(`/talent/${candidate.userId}`);
      setDetail(data.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDetailLoading(false);
    }
  };

  const toggleSkill = (skill: string) => {
    setPage(1);
    setFilters((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const clearAll = () => {
    setQDraft("");
    setPage(1);
    setFilters(EMPTY_FILTERS);
  };

  const activeCount = useMemo(() => {
    let count = filters.skills.length;
    if (filters.q) count += 1;
    if (filters.city) count += 1;
    if (filters.experienceMin) count += 1;
    if (filters.salaryMax) count += 1;
    if (filters.qualification) count += 1;
    if (filters.employmentType) count += 1;
    if (filters.relocate) count += 1;
    if (filters.hasResume) count += 1;
    return count;
  }, [filters]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  if (!allowed) {
    return (
      <div className="container-x space-y-4 py-10">
        <Skeleton className="h-32 w-full rounded-[16px]" />
        <Skeleton className="h-64 w-full rounded-[16px]" />
      </div>
    );
  }

  const filterPanel = (
    <form
      className="panel space-y-5 p-5"
      onSubmit={(e) => {
        e.preventDefault();
        patch({ q: qDraft.trim() });
      }}
    >
      <div className="flex items-center justify-between">
        <p className="font-display text-lg text-ink">{t("filters")}</p>
        {activeCount > 0 && (
          <button type="button" className="text-xs font-semibold text-accent" onClick={clearAll}>
            {t("clear")}
          </button>
        )}
      </div>

      <div>
        <label className="label">{t("search")}</label>
        <div className="flex gap-2">
          <input
            className="input"
            placeholder={t("searchPlaceholder")}
            value={qDraft}
            onChange={(e) => setQDraft(e.target.value)}
          />
          <button type="submit" className="btn btn-primary btn-sm shrink-0">
            🔎
          </button>
        </div>
      </div>

      <div>
        <label className="label">{t("city")}</label>
        <select
          className="select"
          value={filters.city}
          onChange={(e) => patch({ city: e.target.value })}
        >
          <option value="">{t("anyCity")}</option>
          {meta?.cities.map((city) => (
            <option key={city.value} value={city.value}>
              {city.value} ({city.count})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label">{t("experience")}</label>
        <div className="flex flex-wrap gap-1.5">
          <FilterPill
            active={!filters.experienceMin}
            onClick={() => patch({ experienceMin: "" })}
            label={tc("all")}
          />
          {EXPERIENCE_STEPS.map((step) => (
            <FilterPill
              key={step}
              active={filters.experienceMin === step}
              onClick={() => patch({ experienceMin: step })}
              label={step === "0" ? t("fresher") : `${step}+ ${td("yrsExp")}`}
            />
          ))}
        </div>
      </div>

      <div>
        <label className="label">{t("budget")}</label>
        <div className="flex flex-wrap gap-1.5">
          <FilterPill
            active={!filters.salaryMax}
            onClick={() => patch({ salaryMax: "" })}
            label={tc("all")}
          />
          {SALARY_CAPS.map((cap) => (
            <FilterPill
              key={cap}
              active={filters.salaryMax === cap}
              onClick={() => patch({ salaryMax: cap })}
              label={`≤ ₹${Number(cap).toLocaleString("en-IN")}`}
            />
          ))}
        </div>
      </div>

      {meta && meta.skills.length > 0 && (
        <div>
          <label className="label">{t("skills")}</label>
          <div className="flex flex-wrap gap-1.5">
            {meta.skills.map((skill) => (
              <FilterPill
                key={skill.value}
                active={filters.skills.includes(skill.value)}
                onClick={() => toggleSkill(skill.value)}
                label={`${skill.value} (${skill.count})`}
              />
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="label">{t("qualification")}</label>
        <select
          className="select"
          value={filters.qualification}
          onChange={(e) => patch({ qualification: e.target.value })}
        >
          <option value="">{tc("all")}</option>
          {QUALIFICATION_LEVELS.map((option) => (
            <option key={option.value} value={option.value}>
              {optionLabel(option, locale)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label">{t("employmentType")}</label>
        <select
          className="select"
          value={filters.employmentType}
          onChange={(e) => patch({ employmentType: e.target.value })}
        >
          <option value="">{tc("all")}</option>
          {EMPLOYMENT_TYPES.map((option) => (
            <option key={option.value} value={option.value}>
              {optionLabel(option, locale)}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2.5 border-t border-line-soft pt-4">
        <Toggle
          label={t("hasResume")}
          checked={filters.hasResume}
          onChange={(v) => patch({ hasResume: v })}
        />
        <Toggle
          label={t("willingToRelocate")}
          checked={filters.relocate}
          onChange={(v) => patch({ relocate: v })}
        />
      </div>
    </form>
  );

  return (
    <div className="mesh-bg min-h-[80vh] py-8 sm:py-10">
      <div className="container-x">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">{t("eyebrow")}</p>
            <h1 className="mt-1 font-display text-3xl text-ink">{t("title")}</h1>
            <p className="mt-1 text-sm text-ink-soft">{t("subtitle")}</p>
          </div>
          <div className="flex gap-2">
            <Link href="/employer" className="btn btn-outline btn-sm">
              ← {td("backToDashboard")}
            </Link>
            <Link href="/employer/jobs/new" className="btn btn-primary btn-sm">
              + {t("postJob")}
            </Link>
          </div>
        </div>

        {error && (
          <Alert tone="error" className="mt-5">
            {error}
          </Alert>
        )}

        {/* Wrapper carries the breakpoint: `.btn` is unlayered CSS and would beat `lg:hidden`. */}
        <div className="mt-6 lg:hidden">
          <button
            type="button"
            className="btn btn-outline w-full"
            onClick={() => setFiltersOpen((open) => !open)}
          >
            {filtersOpen ? tc("hide") : t("filters")}
            {activeCount > 0 && ` (${activeCount})`}
          </button>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[300px_1fr]">
          <aside className={`h-fit lg:sticky lg:top-24 lg:block ${filtersOpen ? "" : "hidden"}`}>
            {filterPanel}
          </aside>

          <div>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="font-display text-lg text-ink">
                {loading ? tc("loading") : t("resultCount", { count: total })}
              </p>
              <select
                className="select w-auto"
                value={filters.sortBy}
                onChange={(e) => patch({ sortBy: e.target.value })}
                aria-label={t("sortBy")}
              >
                <option value="updatedAt">{t("sortRecent")}</option>
                <option value="experienceYears">{t("sortExperience")}</option>
                <option value="expectedSalary">{t("sortSalary")}</option>
                <option value="fullName">{t("sortName")}</option>
              </select>
            </div>

            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton key={index} className="h-52 w-full rounded-[16px]" />
                ))}
              </div>
            ) : candidates.length === 0 ? (
              <EmptyState
                icon="🧑‍🏭"
                title={t("noCandidates")}
                description={t("noCandidatesHint")}
                action={
                  activeCount > 0 ? (
                    <button type="button" className="btn btn-outline btn-sm" onClick={clearAll}>
                      {t("clear")}
                    </button>
                  ) : undefined
                }
              />
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  {candidates.map((candidate) => (
                    <CandidateCard
                      key={candidate._id}
                      candidate={candidate}
                      locale={locale}
                      busy={detailLoading}
                      onOpen={() => void openCandidate(candidate)}
                      labels={{
                        view: td("viewProfile"),
                        resume: td("resume"),
                        yrsExp: td("yrsExp"),
                        fresher: t("fresher"),
                        expects: t("expects"),
                        notice: t("noticeShort"),
                      }}
                    />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      disabled={page <= 1}
                      onClick={() => setPage(page - 1)}
                    >
                      ← {tc("previous")}
                    </button>
                    <span className="text-sm font-semibold text-ink-soft">
                      {page} / {totalPages}
                    </span>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      disabled={page >= totalPages}
                      onClick={() => setPage(page + 1)}
                    >
                      {tc("next")} →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <ApplicantProfileDrawer
        open={Boolean(detail)}
        onClose={() => setDetail(null)}
        profile={detail?.profile}
        seekerUser={detail?.user}
        locale={locale}
        eyebrow={t("candidateProfile")}
        footer={
          detail ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-ink-soft">
                {detail.appliedToMine > 0 ? t("alreadyApplied") : t("notApplied")}
              </span>
              <div className="flex gap-2">
                {detail.user.mobile && (
                  <a href={`tel:+91${detail.user.mobile}`} className="btn btn-outline btn-sm">
                    📞 {t("call")}
                  </a>
                )}
                {detail.user.mobile && (
                  <a
                    href={`https://wa.me/91${detail.user.mobile}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-primary btn-sm"
                  >
                    {t("whatsapp")}
                  </a>
                )}
              </div>
            </div>
          ) : undefined
        }
      />
    </div>
  );
}

function FilterPill({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
        active
          ? "border-accent bg-accent text-white"
          : "border-line bg-white text-ink-soft hover:border-accent"
      }`}
    >
      {label}
    </button>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-ink-soft">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-accent"
      />
      {label}
    </label>
  );
}

function CandidateCard({
  candidate,
  locale,
  busy,
  onOpen,
  labels,
}: {
  candidate: Candidate;
  locale: string;
  busy: boolean;
  onOpen: () => void;
  labels: {
    view: string;
    resume: string;
    yrsExp: string;
    fresher: string;
    expects: string;
    notice: string;
  };
}) {
  const name =
    locale === "hi" && candidate.fullNameHi ? candidate.fullNameHi : candidate.fullName;
  const years = candidate.experienceYears ?? 0;
  const months = candidate.experienceMonths ?? 0;

  return (
    <article className="card card-hover flex flex-col p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-mist">
          {candidate.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={candidate.photoUrl} alt={name} className="h-full w-full object-cover" />
          ) : (
            <span className="font-display text-xl text-ink-mute">
              {name?.[0]?.toUpperCase() ?? "?"}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="truncate font-display text-lg text-ink">{name}</h2>
          {candidate.headline && (
            <p className="truncate text-sm text-ink-soft">{candidate.headline}</p>
          )}
          <p className="mt-1 text-sm text-ink-soft">
            {[
              candidate.city,
              years || months
                ? `${years}${months ? `.${months}` : ""} ${labels.yrsExp}`
                : labels.fresher,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {candidate.expectedSalary ? (
          <span className="chip chip-accent">
            {labels.expects} ₹{candidate.expectedSalary.toLocaleString("en-IN")}
          </span>
        ) : null}
        {candidate.noticePeriodDays != null && (
          <span className="chip">
            {labels.notice} {candidate.noticePeriodDays}d
          </span>
        )}
        {candidate.willingToRelocate && <span className="chip">🚚</span>}
        {candidate.resumeUrl && <span className="chip">📄 {labels.resume}</span>}
      </div>

      {candidate.skills?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {candidate.skills.slice(0, 4).map((skill) => (
            <span key={skill} className="badge badge-neutral">
              {skill}
            </span>
          ))}
          {candidate.skills.length > 4 && (
            <span className="badge badge-neutral">+{candidate.skills.length - 4}</span>
          )}
        </div>
      )}

      <div className="mt-auto flex gap-2 pt-4">
        <button
          type="button"
          className="btn btn-primary btn-sm flex-1"
          disabled={busy}
          onClick={onOpen}
        >
          {labels.view}
        </button>
        {candidate.resumeUrl && (
          <a
            href={candidate.resumeUrl}
            target="_blank"
            rel="noreferrer"
            className="btn btn-outline btn-sm"
          >
            {labels.resume}
          </a>
        )}
      </div>
    </article>
  );
}
