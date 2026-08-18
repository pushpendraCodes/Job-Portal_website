"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { api, getErrorMessage, type ApiSuccess } from "@/lib/api";
import type { Job, JobApplication, JobSeekerProfile } from "@/lib/types";
import { companyName, formatSalary, jobTitle, profileCompleteness } from "@/lib/types";
import { useAppSelector } from "@/store/hooks";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  EducationList,
  ExperienceList,
  SectionCard,
  StatTile,
} from "@/components/dashboard/ProfileSummary";

export default function SeekerDashboardPage() {
  const t = useTranslations("dashboard");
  const tc = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const { user, hydrated } = useAppSelector((s) => s.auth);

  const [profile, setProfile] = useState<JobSeekerProfile | null>(null);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const [profileRes, appsRes] = await Promise.all([
        api.get<ApiSuccess<{ profile: JobSeekerProfile }>>("/profile/me"),
        api.get<ApiSuccess<JobApplication[]>>("/jobs/applications/mine", {
          params: { limit: 10 },
        }),
      ]);
      setProfile(profileRes.data.data.profile);
      setApplications(appsRes.data.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!user || user.accountType !== "job_seeker") {
      router.replace("/auth/login?type=job_seeker");
      return;
    }
    if (user.registrationPending) {
      router.replace("/auth/register/seeker");
      return;
    }
    void load();
  }, [hydrated, user, router, load]);

  const completeness = profileCompleteness(profile);
  const totalExperience = profile
    ? `${profile.experienceYears ?? 0}${
        profile.experienceMonths ? `.${profile.experienceMonths}` : ""
      }`
    : "0";

  if (loading) {
    return (
      <div className="container-x space-y-4 py-10">
        <Skeleton className="h-40 w-full rounded-[16px]" />
        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <Skeleton className="h-64 w-full rounded-[16px]" />
          <Skeleton className="h-64 w-full rounded-[16px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="mesh-bg min-h-[80vh] py-8 sm:py-10">
      <div className="container-x space-y-6">
        {error && <Alert tone="error">{error}</Alert>}

        <section className="panel overflow-hidden">
          <div className="weave-bg h-20 sm:h-24" />

          <div className="relative bg-white px-6 pb-6 sm:px-8">
            {/* Avatar overlaps banner edge only — name stays on white below */}
            <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1/2 sm:left-8 sm:translate-x-0">
              <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-mist shadow-md">
                {profile?.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.photoUrl}
                    alt={profile.fullName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center font-display text-3xl text-ink-mute">
                    {profile?.fullName?.[0]?.toUpperCase() ?? "?"}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-16 sm:pt-3 sm:pl-28">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 text-center sm:text-left">
                  <h1 className="font-display text-2xl leading-tight break-words text-ink sm:text-3xl">
                    {profile?.fullName || profile?.fullNameHi || user?.mobile || "—"}
                  </h1>
                  <p className="mt-1 text-sm text-ink-soft">
                    {profile?.headline || t("noHeadline")}
                  </p>
                  <p className="mt-1 text-xs text-ink-mute">
                    {[profile?.city, profile?.state].filter(Boolean).join(", ")}
                    {user?.mobile ? ` · +91 ${user.mobile}` : ""}
                  </p>
                </div>

                <div className="flex shrink-0 flex-wrap justify-center gap-2 sm:justify-end">
                  <Link href="/seeker/profile" className="btn btn-outline btn-sm">
                    {t("editProfile")}
                  </Link>
                  <Link href="/jobs" className="btn btn-primary btn-sm">
                    {t("browseJobs")}
                  </Link>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-4">
              <StatTile label={t("profileStrength")} value={`${completeness}%`} tone="accent" />
              <StatTile label={t("applicationsSent")} value={applications.length} />
              <StatTile label={t("experienceLabel")} value={`${totalExperience} ${t("yrs")}`} />
              <StatTile label={t("skillsCount")} value={profile?.skills?.length ?? 0} />
            </div>

            {completeness < 100 && (
              <div className="mt-5 rounded-[14px] border border-line bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-ink">{t("completeProfile")}</p>
                  <Link
                    href="/seeker/profile"
                    className="text-sm font-semibold text-accent hover:text-accent-deep"
                  >
                    {t("completeNow")} →
                  </Link>
                </div>
                <div className="progress-track mt-3">
                  <div className="progress-fill" style={{ width: `${completeness}%` }} />
                </div>
                <p className="mt-2 text-xs text-ink-soft">{t("completeProfileHint")}</p>
              </div>
            )}
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-6">
            {profile?.summary && (
              <SectionCard title={t("about")}>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink-soft">
                  {profile.summary}
                </p>
              </SectionCard>
            )}

            <SectionCard
              title={t("experience")}
              action={
                <Link href="/seeker/profile?tab=experience" className="btn btn-quiet btn-sm">
                  {tc("edit")}
                </Link>
              }
            >
              {profile?.experience?.length ? (
                <ExperienceList items={profile.experience} locale={locale} />
              ) : (
                <EmptyState
                  icon="💼"
                  title={t("noExperience")}
                  description={t("noExperienceHint")}
                  action={
                    <Link href="/seeker/profile?tab=experience" className="btn btn-primary btn-sm">
                      {t("addExperience")}
                    </Link>
                  }
                />
              )}
            </SectionCard>

            <SectionCard
              title={t("education")}
              action={
                <Link href="/seeker/profile?tab=education" className="btn btn-quiet btn-sm">
                  {tc("edit")}
                </Link>
              }
            >
              {profile?.education?.length ? (
                <EducationList items={profile.education} />
              ) : (
                <EmptyState
                  icon="🎓"
                  title={t("noEducation")}
                  description={t("noEducationHint")}
                  action={
                    <Link href="/seeker/profile?tab=education" className="btn btn-primary btn-sm">
                      {t("addEducation")}
                    </Link>
                  }
                />
              )}
            </SectionCard>

            <SectionCard title={t("myApplications")}>
              {applications.length === 0 ? (
                <EmptyState
                  icon="📨"
                  title={t("noApplications")}
                  description={t("noApplicationsHint")}
                  action={
                    <Link href="/jobs" className="btn btn-primary btn-sm">
                      {t("browseJobs")}
                    </Link>
                  }
                />
              ) : (
                <ul className="divide-soft">
                  {applications.map((application) => {
                    const job =
                      typeof application.jobId === "object" ? (application.jobId as Job) : null;
                    return (
                      <li key={application._id} className="flex flex-wrap gap-3 py-3.5">
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold text-ink">
                            {job ? jobTitle(job, locale) : t("jobRemoved")}
                          </p>
                          <p className="truncate text-sm text-ink-soft">
                            {job ? companyName(job.employerProfileId, locale) : ""}
                            {job?.city ? ` · ${job.city}` : ""}
                          </p>
                          <p className="mt-0.5 text-xs text-ink-mute">
                            {t("appliedOn")}{" "}
                            {new Date(application.createdAt).toLocaleDateString(
                              locale === "hi" ? "hi-IN" : "en-IN",
                              { day: "numeric", month: "short", year: "numeric" },
                            )}
                          </p>
                        </div>
                        <span className="badge badge-neutral h-fit">{application.status}</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </SectionCard>
          </div>

          <div className="space-y-6">
            <SectionCard
              title={t("resume")}
              action={
                <Link href="/seeker/profile?tab=documents" className="btn btn-quiet btn-sm">
                  {tc("edit")}
                </Link>
              }
            >
              {profile?.resumeUrl ? (
                <div className="rounded-[14px] border border-line bg-mist/50 p-4">
                  <p className="truncate text-sm font-semibold text-ink">
                    📄 {profile.resumeName || "resume.pdf"}
                  </p>
                  <a
                    href={profile.resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-outline btn-sm mt-3"
                  >
                    {t("viewResume")}
                  </a>
                </div>
              ) : (
                <div className="rounded-[14px] border border-dashed border-line p-5 text-center">
                  <p className="text-sm text-ink-soft">{t("noResume")}</p>
                  <Link
                    href="/seeker/profile?tab=documents"
                    className="btn btn-primary btn-sm mt-3"
                  >
                    {t("uploadResume")}
                  </Link>
                </div>
              )}
            </SectionCard>

            <SectionCard title={t("skills")}>
              {profile?.skills?.length ? (
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <span key={skill} className="chip chip-accent">
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-ink-soft">{t("noSkills")}</p>
              )}

              {profile?.languages?.length ? (
                <>
                  <p className="mt-5 mb-2 text-xs font-semibold uppercase tracking-wide text-ink-mute">
                    {t("languages")}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {profile.languages.map((language) => (
                      <span key={language} className="chip">
                        {language}
                      </span>
                    ))}
                  </div>
                </>
              ) : null}
            </SectionCard>

            <SectionCard title={t("preferences")}>
              <dl className="space-y-3 text-sm">
                <Row label={t("expectedSalary")} value={
                  profile?.expectedSalary
                    ? formatSalary({ salaryMin: profile.expectedSalary, salaryType: "monthly" })
                    : "—"
                } />
                <Row
                  label={t("noticePeriod")}
                  value={
                    profile?.noticePeriodDays != null
                      ? `${profile.noticePeriodDays} ${t("days")}`
                      : "—"
                  }
                />
                <Row
                  label={t("preferredCities")}
                  value={profile?.preferredCities?.join(", ") || "—"}
                />
                <Row
                  label={t("willingToRelocate")}
                  value={profile?.willingToRelocate ? tc("yes") : tc("no")}
                />
              </dl>
            </SectionCard>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-ink-soft">{label}</dt>
      <dd className="text-right font-medium text-ink">{value || "—"}</dd>
    </div>
  );
}
