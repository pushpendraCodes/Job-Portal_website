"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { api, getErrorMessage, type ApiSuccess } from "@/lib/api";
import type { Job, JobSeekerProfile } from "@/lib/types";
import { formatSalary, jobTitle } from "@/lib/types";
import { useAppSelector } from "@/store/hooks";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import { JobCardSkeleton } from "@/components/ui/Skeleton";
import { ApplicantProfileDrawer } from "@/components/employer/ApplicantProfileDrawer";

interface Applicant {
  _id: string;
  status: string;
  coverNote?: string;
  resumeUrl?: string;
  createdAt: string;
  seekerProfileId?: JobSeekerProfile;
  seekerId?: { mobile?: string; email?: string };
}

const STATUS_TONE: Record<string, string> = {
  published: "badge-success",
  pending_approval: "badge-warn",
  draft: "badge-neutral",
  rejected: "badge-danger",
  closed: "badge-neutral",
};

const FILTERS = ["all", "published", "pending_approval", "draft", "closed"] as const;

export default function EmployerJobsPage() {
  const t = useTranslations("employerDash");
  const te = useTranslations("employer");
  const tc = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const { user, hydrated } = useAppSelector((s) => s.auth);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [closingId, setClosingId] = useState<string | null>(null);
  const [openJobId, setOpenJobId] = useState<string | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [applicantsLoading, setApplicantsLoading] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get<ApiSuccess<Job[]>>("/jobs/mine", {
        params: { limit: 100 },
      });
      setJobs(data.data);
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
    void load();
  }, [hydrated, user, router, load]);

  const toggleApplicants = async (jobId: string) => {
    if (openJobId === jobId) {
      setOpenJobId(null);
      setSelectedApplicant(null);
      return;
    }
    setOpenJobId(jobId);
    setSelectedApplicant(null);
    setApplicants([]);
    setApplicantsLoading(true);
    try {
      const { data } = await api.get<ApiSuccess<Applicant[]>>(`/jobs/${jobId}/applications`);
      setApplicants(data.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setApplicantsLoading(false);
    }
  };

  const closeJob = async (jobId: string) => {
    if (!window.confirm(t("closeJobConfirm"))) return;
    setClosingId(jobId);
    setError("");
    setSuccess("");
    try {
      await api.post(`/jobs/${jobId}/close`);
      setJobs((prev) =>
        prev.map((job) => (job._id === jobId ? { ...job, status: "closed" } : job)),
      );
      setSuccess(t("closeJobSuccess"));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setClosingId(null);
    }
  };

  const visible = filter === "all" ? jobs : jobs.filter((job) => job.status === filter);

  return (
    <div className="mesh-bg min-h-[80vh] py-8 sm:py-10">
      <div className="container-x">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">{t("manageJobs")}</p>
            <h1 className="mt-1 font-display text-3xl text-ink">{te("myJobs")}</h1>
          </div>
          <div className="flex gap-2">
            <Link href="/employer" className="btn btn-outline btn-sm">
              ← {t("backToDashboard")}
            </Link>
            <Link href="/employer/jobs/new" className="btn btn-primary btn-sm">
              + {te("createJob")}
            </Link>
          </div>
        </div>

        <div className="scroll-x-hide mt-6 flex gap-2 overflow-x-auto">
          {FILTERS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                filter === item
                  ? "bg-ink text-white"
                  : "border border-line bg-white text-ink-soft hover:border-accent"
              }`}
            >
              {item === "all" ? tc("all") : t(`status.${item}`)}
            </button>
          ))}
        </div>

        {error && <Alert tone="error" className="mt-5">{error}</Alert>}
        {success && <Alert tone="success" className="mt-5">{success}</Alert>}

        <div className="mt-6 space-y-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, index) => <JobCardSkeleton key={index} />)
          ) : visible.length === 0 ? (
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
            visible.map((job) => (
              <div key={job._id} className="card p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-display text-lg text-ink">{jobTitle(job, locale)}</h2>
                      <span className={`badge ${STATUS_TONE[job.status] ?? "badge-neutral"}`}>
                        {t(`status.${job.status}`)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-ink-soft">
                      📍 {job.city}
                      {formatSalary(job) ? ` · ${formatSalary(job)}` : ""} · {job.vacancies}{" "}
                      {t("openings")}
                    </p>
                    <p className="mt-1 text-xs text-ink-mute">
                      👁 {job.viewsCount ?? 0} {t("views").toLowerCase()} · 📨{" "}
                      {job.applicationsCount ?? 0} {t("applicantsShort")}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Link href={`/jobs/${job._id}`} className="btn btn-quiet btn-sm">
                      {tc("view")}
                    </Link>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => void toggleApplicants(job._id)}
                    >
                      {openJobId === job._id ? tc("hide") : t("viewApplicants")}
                    </button>
                    {job.status !== "closed" && job.status !== "rejected" && (
                      <button
                        type="button"
                        className="btn btn-quiet btn-sm text-warm"
                        disabled={closingId === job._id}
                        onClick={() => void closeJob(job._id)}
                      >
                        {closingId === job._id ? tc("loading") : t("closeJob")}
                      </button>
                    )}
                  </div>
                </div>

                {openJobId === job._id && (
                  <div className="mt-5 border-t border-line-soft pt-5">
                    {applicantsLoading ? (
                      <p className="text-sm text-ink-soft">{tc("loading")}</p>
                    ) : applicants.length === 0 ? (
                      <p className="text-sm text-ink-soft">{t("noApplicants")}</p>
                    ) : (
                      <ul className="divide-soft">
                        {applicants.map((applicant) => {
                          const seeker = applicant.seekerProfileId;
                          return (
                            <li key={applicant._id} className="flex flex-wrap gap-3 py-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-mist">
                                {seeker?.photoUrl ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={seeker.photoUrl}
                                    alt={seeker.fullName}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <span className="text-sm font-semibold text-ink-mute">
                                    {seeker?.fullName?.[0]?.toUpperCase() ?? "?"}
                                  </span>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-semibold text-ink">
                                  {seeker?.fullName ?? "—"}
                                </p>
                                <p className="text-sm text-ink-soft">
                                  {[
                                    seeker?.headline,
                                    seeker?.city,
                                    seeker?.experienceYears != null
                                      ? `${seeker.experienceYears} ${t("yrsExp")}`
                                      : null,
                                  ]
                                    .filter(Boolean)
                                    .join(" · ")}
                                </p>
                                {applicant.coverNote && (
                                  <p className="mt-1 line-clamp-2 text-sm text-ink-soft">
                                    “{applicant.coverNote}”
                                  </p>
                                )}
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  className="btn btn-primary btn-sm h-fit"
                                  onClick={() => setSelectedApplicant(applicant)}
                                >
                                  {t("viewProfile")}
                                </button>
                                {(applicant.resumeUrl || seeker?.resumeUrl) && (
                                  <a
                                    href={applicant.resumeUrl || seeker?.resumeUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="btn btn-outline btn-sm h-fit"
                                  >
                                    {t("resume")}
                                  </a>
                                )}
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <ApplicantProfileDrawer
        open={Boolean(selectedApplicant)}
        onClose={() => setSelectedApplicant(null)}
        profile={selectedApplicant?.seekerProfileId}
        seekerUser={selectedApplicant?.seekerId}
        coverNote={selectedApplicant?.coverNote}
        resumeUrl={selectedApplicant?.resumeUrl}
        locale={locale}
        appliedAt={selectedApplicant?.createdAt}
        status={selectedApplicant?.status}
      />
    </div>
  );
}
