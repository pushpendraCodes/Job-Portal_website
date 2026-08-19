import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { EmployerProfile, Job, JobCategory } from "@/lib/types";
import { companyName, jobTitle } from "@/lib/types";
import { categoryIcon, shortSalary } from "@/lib/jobBrowse";
import { EMPLOYMENT_TYPES, optionLabel } from "@/lib/formOptions";

const NEW_FOR_DAYS = 7;

function daysOld(value: string): number {
  return Math.floor((Date.now() - new Date(value).getTime()) / 86_400_000);
}

function timeAgo(days: number, locale: string): string {
  if (locale === "hi") {
    if (days <= 0) return "आज";
    if (days === 1) return "कल";
    if (days < 30) return `${days} दिन पहले`;
    return `${Math.floor(days / 30)} माह पहले`;
  }
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  return `${Math.floor(days / 30)} months ago`;
}

export function JobListItem({ job, locale }: { job: Job; locale: string }) {
  const t = useTranslations();

  const employer =
    typeof job.employerProfileId === "object"
      ? (job.employerProfileId as EmployerProfile)
      : undefined;
  const category =
    typeof job.categoryId === "object" ? (job.categoryId as JobCategory) : undefined;

  const company = companyName(employer, locale);
  const salary = shortSalary(job);
  const age = daysOld(job.publishedAt || job.createdAt);
  const employmentType = EMPLOYMENT_TYPES.find((o) => o.value === job.employmentType);

  return (
    <Link href={`/jobs/${job._id}`} className="card card-hover group block p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[14px] border border-line bg-mist text-2xl">
          {employer?.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={employer.logoUrl} alt={company} className="h-full w-full object-cover" />
          ) : (
            <span>{categoryIcon(category?.slug)}</span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start gap-x-2 gap-y-1">
            <h3 className="font-display text-lg leading-snug text-ink transition group-hover:text-accent sm:text-xl">
              {jobTitle(job, locale)}
            </h3>
            {age <= NEW_FOR_DAYS && (
              <span className="badge badge-success mt-1">{t("jobs.newJob")}</span>
            )}
          </div>

          {company && (
            <p className="mt-0.5 truncate text-sm font-medium text-ink-soft">{company}</p>
          )}

          <p className="mt-2 font-display text-xl text-accent-deep sm:text-2xl">
            {salary ? (
              <>
                {salary}{" "}
                <span className="text-sm font-medium text-ink-soft">{t("jobs.perMonth")}</span>
              </>
            ) : (
              <span className="text-base font-medium text-ink-soft">{t("jobs.salaryOnTalk")}</span>
            )}
          </p>

          <div className="mt-2.5 flex flex-wrap gap-2">
            <span className="chip">📍 {job.city}</span>
            {job.vacancies > 0 && (
              <span className="chip">👥 {t("jobs.openings", { count: job.vacancies })}</span>
            )}
            {employmentType && <span className="chip">⏰ {optionLabel(employmentType, locale)}</span>}
          </div>

          <div className="mt-3 flex items-center justify-between gap-3 border-t border-line-soft pt-2.5">
            <span className="text-xs text-ink-mute">{timeAgo(age, locale)}</span>
            <span className="text-sm font-semibold text-accent">{t("jobs.viewJob")} →</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
