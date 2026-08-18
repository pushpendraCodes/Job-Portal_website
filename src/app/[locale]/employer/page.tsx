"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { api, getErrorMessage, type ApiSuccess } from "@/lib/api";
import type { EmployerProfile, Job } from "@/lib/types";
import { employerCompleteness, formatSalary, jobTitle } from "@/lib/types";
import { useAppSelector } from "@/store/hooks";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { SectionCard, StatTile } from "@/components/dashboard/ProfileSummary";

const STATUS_TONE: Record<string, string> = {
  published: "badge-success",
  pending_approval: "badge-warn",
  draft: "badge-neutral",
  rejected: "badge-danger",
  closed: "badge-neutral",
};

export default function EmployerHomePage() {
  const t = useTranslations("employerDash");
  const te = useTranslations("employer");
  const tc = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const { user, hydrated } = useAppSelector((s) => s.auth);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [profile, setProfile] = useState<EmployerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const officeUrl = process.env.NEXT_PUBLIC_OFFICE_URL || "http://localhost:5173";

  const load = useCallback(async () => {
    try {
      const [jobsRes, profileRes] = await Promise.all([
        api.get<ApiSuccess<Job[]>>("/jobs/mine", { params: { limit: 50 } }),
        api.get<ApiSuccess<{ profile: EmployerProfile }>>("/profile/me"),
      ]);
      setJobs(jobsRes.data.data);
      setProfile(profileRes.data.data.profile);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!user || user.accountType !== "employer") {
      router.replace("/auth/login?type=employer");
      return;
    }
    if (user.registrationPending) {
      router.replace("/auth/register/employer");
      return;
    }
    void load();
  }, [hydrated, user, router, load]);

  const activeJobs = jobs.filter((job) => job.status === "published").length;
  const applications = jobs.reduce((sum, job) => sum + (job.applicationsCount ?? 0), 0);
  const views = jobs.reduce((sum, job) => sum + (job.viewsCount ?? 0), 0);
  const completeness = employerCompleteness(profile);

  if (loading) {
    return (
      <div className="container-x space-y-4 py-10">
        <Skeleton className="h-36 w-full rounded-[16px]" />
        <Skeleton className="h-80 w-full rounded-[16px]" />
      </div>
    );
  }

  return (
    <div className="mesh-bg min-h-[80vh] py-8 sm:py-10">
      <div className="container-x space-y-6">
        {error && <Alert tone="error">{error}</Alert>}

        <section className="panel p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[14px] border border-line bg-mist">
                {profile?.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.logoUrl}
                    alt={profile.companyName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="font-display text-2xl text-ink-mute">
                    {profile?.companyName?.[0]?.toUpperCase() ?? "?"}
                  </span>
                )}
              </div>
              <div>
                <p className="eyebrow">{t("welcome")}</p>
                <h1 className="font-display text-2xl text-ink sm:text-3xl">
                  {locale === "hi" && profile?.companyNameHi
                    ? profile.companyNameHi
                    : profile?.companyName}
                </h1>
                <p className="mt-0.5 text-sm text-ink-soft">
                  {[profile?.city, profile?.state].filter(Boolean).join(", ")}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link href="/employer/profile" className="btn btn-outline btn-sm">
                {t("editCompany")}
              </Link>
              <Link href="/employer/jobs/new" className="btn btn-primary btn-sm">
                + {te("createJob")}
              </Link>
              <a
                href={officeUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-dark btn-sm"
              >
                {te("officeCta")}
              </a>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile label={t("totalJobs")} value={jobs.length} tone="accent" />
            <StatTile label={t("activeJobs")} value={activeJobs} />
            <StatTile label={t("applications")} value={applications} />
            <StatTile label={t("views")} value={views} />
          </div>

          {completeness < 100 && (
            <div className="mt-5 rounded-[14px] border border-line bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-ink">{t("completeCompany")}</p>
                <Link
                  href="/employer/profile"
                  className="text-sm font-semibold text-accent hover:text-accent-deep"
                >
                  {t("completeNow")} →
                </Link>
              </div>
              <div className="progress-track mt-3">
                <div className="progress-fill" style={{ width: `${completeness}%` }} />
              </div>
              <p className="mt-2 text-xs text-ink-soft">{t("completeCompanyHint")}</p>
            </div>
          )}
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <SectionCard
            title={te("myJobs")}
            action={
              <Link href="/employer/jobs" className="btn btn-quiet btn-sm">
                {tc("viewAll")}
              </Link>
            }
          >
            {jobs.length === 0 ? (
              <EmptyState
                icon="📋"
                title={t("noJobs")}
                description={t("noJobsHint")}
                action={
                  <Link href="/employer/jobs/new" className="btn btn-primary btn-sm">
                    {te("createJob")}
                  </Link>
                }
              />
            ) : (
              <ul className="divide-soft">
                {jobs.slice(0, 8).map((job) => (
                  <li key={job._id} className="flex flex-wrap items-center gap-3 py-3.5">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-ink">{jobTitle(job, locale)}</p>
                      <p className="truncate text-sm text-ink-soft">
                        {job.city}
                        {formatSalary(job) ? ` · ${formatSalary(job)}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-ink-soft">
                      <span>
                        {job.applicationsCount ?? 0} {t("applicantsShort")}
                      </span>
                      <span className={`badge ${STATUS_TONE[job.status] ?? "badge-neutral"}`}>
                        {t(`status.${job.status}`)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          <div className="space-y-6">
            <SectionCard
              title={t("companyProfile")}
              action={
                <Link href="/employer/profile" className="btn btn-quiet btn-sm">
                  {tc("edit")}
                </Link>
              }
            >
              <dl className="space-y-3 text-sm">
                <Row label={t("ownerName")} value={profile?.ownerName} />
                <Row label={t("contactPerson")} value={profile?.contactPersonName} />
                <Row label={t("email")} value={profile?.contactEmail} />
                <Row
                  label={t("phone")}
                  value={profile?.contactMobile ? `+91 ${profile.contactMobile}` : undefined}
                />
                <Row label={t("gst")} value={profile?.gstNumber} />
                <Row
                  label={t("address")}
                  value={
                    [profile?.addressLine1, profile?.city, profile?.state, profile?.pincode]
                      .filter(Boolean)
                      .join(", ") || undefined
                  }
                />
              </dl>
            </SectionCard>

            <div className="weave-bg rounded-[16px] p-6 text-white">
              <p className="font-display text-xl">{te("officeCta")}</p>
              <p className="mt-2 text-sm text-white/80">{te("officeHint")}</p>
              <a
                href={officeUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-ghost btn-sm mt-4"
              >
                {tc("open")} →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-ink-soft">{label}</dt>
      <dd className="text-right font-medium text-ink">{value || "—"}</dd>
    </div>
  );
}
