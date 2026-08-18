"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { api, getErrorMessage, type ApiSuccess } from "@/lib/api";
import type { EmployerProfile, Job } from "@/lib/types";
import { companyName, formatSalary, jobDescription, jobTitle } from "@/lib/types";
import { useAppSelector } from "@/store/hooks";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { EMPLOYMENT_TYPES, optionLabel } from "@/lib/formOptions";

export default function JobDetailPage() {
  const t = useTranslations();
  const tj = useTranslations("jobs");
  const locale = useLocale();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, hydrated } = useAppSelector((s) => s.auth);

  const [job, setJob] = useState<Job | null>(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [coverNote, setCoverNote] = useState("");
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    void api
      .get<ApiSuccess<Job>>(`/jobs/${params.id}`)
      .then(({ data }) => {
        setJob(data.data);
        setHasApplied(!!data.data.hasApplied);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [params.id]);

  const apply = async () => {
    setError("");
    setMessage("");

    if (!user) {
      router.push(`/auth/login?type=job_seeker&next=/jobs/${params.id}`);
      return;
    }
    if (user.accountType !== "job_seeker") {
      setError(tj("onlySeekersApply"));
      return;
    }
    if (user.registrationPending) {
      router.push("/auth/register/seeker");
      return;
    }
    if (hasApplied) {
      setError(tj("alreadyApplied"));
      return;
    }

    setApplying(true);
    try {
      await api.post(`/jobs/${params.id}/apply`, { coverNote });
      setHasApplied(true);
      setMessage(tj("applicationSent"));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="container-x grid gap-6 py-10 lg:grid-cols-[1.6fr_1fr]">
        <Skeleton className="h-96 w-full rounded-[16px]" />
        <Skeleton className="h-64 w-full rounded-[16px]" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container-x py-16">
        <EmptyState
          icon="🔍"
          title={tj("jobNotFound")}
          description={error || tj("jobNotFoundHint")}
          action={
            <Link href="/jobs" className="btn btn-primary btn-sm">
              {tj("backToJobs")}
            </Link>
          }
        />
      </div>
    );
  }

  const employer =
    typeof job.employerProfileId === "object"
      ? (job.employerProfileId as EmployerProfile)
      : undefined;
  const company = companyName(employer, locale);
  const salary = formatSalary(job);
  const employmentTypeOption = EMPLOYMENT_TYPES.find((e) => e.value === job.employmentType);

  const facts = [
    { label: tj("salary"), value: salary ?? "—" },
    {
      label: tj("experience"),
      value:
        job.experienceMin != null || job.experienceMax != null
          ? `${job.experienceMin ?? 0}${
              job.experienceMax != null ? `–${job.experienceMax}` : "+"
            } ${tj("years")}`
          : tj("fresherOk"),
    },
    { label: tj("vacancies"), value: String(job.vacancies ?? 1) },
    {
      label: tj("employmentType"),
      value: employmentTypeOption ? optionLabel(employmentTypeOption, locale) : "—",
    },
    { label: tj("location"), value: [job.city, job.state].filter(Boolean).join(", ") },
  ];

  const showApplySection = !hydrated || !user || user.accountType === "job_seeker";
  const applied = hasApplied || !!message;

  return (
    <div className="mesh-bg min-h-[80vh] py-8 sm:py-10">
      <div className="container-x">
        <Link href="/jobs" className="text-sm font-semibold text-ink-soft hover:text-accent">
          ← {tj("backToJobs")}
        </Link>

        <div className="mt-4 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-6">
            <article className="panel p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[14px] border border-line bg-mist">
                  {employer?.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={employer.logoUrl}
                      alt={company}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="font-display text-xl text-ink-mute">
                      {(company || "?")[0]?.toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-accent">{company || "—"}</p>
                  <h1 className="mt-1 font-display text-2xl text-ink sm:text-3xl">
                    {jobTitle(job, locale)}
                  </h1>
                  <p className="mt-1 text-sm text-ink-soft">
                    📍 {[job.city, job.state].filter(Boolean).join(", ")}
                  </p>
                </div>
              </div>

              <dl className="mt-6 grid gap-4 border-t border-line-soft pt-6 sm:grid-cols-2 lg:grid-cols-3">
                {facts.map((fact) => (
                  <div key={fact.label}>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-ink-mute">
                      {fact.label}
                    </dt>
                    <dd className="mt-1 font-medium text-ink">{fact.value}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-8 border-t border-line-soft pt-6">
                <h2 className="font-display text-xl text-ink">{tj("details")}</h2>
                <p className="mt-3 whitespace-pre-wrap leading-relaxed text-ink-soft">
                  {jobDescription(job, locale)}
                </p>
              </div>

              {job.skills?.length > 0 && (
                <div className="mt-8 border-t border-line-soft pt-6">
                  <h2 className="font-display text-xl text-ink">{tj("skillsRequired")}</h2>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {job.skills.map((skill) => (
                      <span key={skill} className="chip chip-accent">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </article>

            {employer?.description && (
              <article className="card p-6">
                <h2 className="font-display text-xl text-ink">{tj("aboutCompany")}</h2>
                <p className="mt-3 whitespace-pre-wrap leading-relaxed text-ink-soft">
                  {employer.description}
                </p>
              </article>
            )}
          </div>

          <aside className="h-fit lg:sticky lg:top-24">
            {showApplySection && (
              <div className="panel p-6">
                <h2 className="font-display text-xl text-ink">
                  {applied ? tj("applied") : tj("apply")}
                </h2>
                <p className="mt-1 text-sm text-ink-soft">
                  {applied ? tj("alreadyAppliedHint") : tj("applyHint")}
                </p>

                {applied ? (
                  <Alert tone="success" className="mt-5">
                    {hasApplied && !message ? tj("alreadyApplied") : message || tj("applied")}
                  </Alert>
                ) : (
                  <>
                    <label className="label mt-5">{tj("coverNote")}</label>
                    <textarea
                      className="textarea"
                      placeholder={tj("coverNotePh")}
                      maxLength={800}
                      value={coverNote}
                      onChange={(e) => setCoverNote(e.target.value)}
                    />
                    <p className="help-text">{coverNote.length}/800</p>

                    {error && <Alert tone="error" className="mt-4">{error}</Alert>}

                    <button
                      type="button"
                      className="btn btn-primary mt-4 w-full"
                      disabled={applying}
                      onClick={() => void apply()}
                    >
                      {applying ? t("common.loading") : tj("submitApplication")}
                    </button>

                    {hydrated && !user && (
                      <p className="mt-3 text-center text-xs text-ink-soft">{tj("loginToApply")}</p>
                    )}
                  </>
                )}

                {error && applied && <Alert tone="error" className="mt-4">{error}</Alert>}
              </div>
            )}

            <div className={`card p-5 ${showApplySection ? "mt-4" : ""}`}>
              <p className="text-sm font-semibold text-ink">{tj("shareJob")}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <a
                  className="btn btn-outline btn-sm"
                  target="_blank"
                  rel="noreferrer"
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `${jobTitle(job, locale)} — ${company}`,
                  )}`}
                >
                  WhatsApp
                </a>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    void navigator.clipboard?.writeText(window.location.href);
                    setCopied(tj("linkCopied"));
                  }}
                >
                  {tj("copyLink")}
                </button>
              </div>
              {copied && <p className="mt-2 text-xs text-[var(--success)]">{copied}</p>}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
