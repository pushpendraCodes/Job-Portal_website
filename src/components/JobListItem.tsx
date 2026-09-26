import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { EmployerProfile, Job, JobCategory } from "@/lib/types";
import { categoryName, companyName, jobTitle } from "@/lib/types";
import { shortSalary } from "@/lib/jobBrowse";
import { CategoryMark, IconClock, IconPin, IconRupee } from "@/components/ui/Icons";
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

function experienceText(job: Job, yearsLabel: string, fresherLabel: string) {
  if (job.experienceMin == null && job.experienceMax == null) return fresherLabel;
  if ((job.experienceMin ?? 0) === 0 && (job.experienceMax ?? 0) === 0) return fresherLabel;
  const min = job.experienceMin ?? 0;
  const max = job.experienceMax;
  if (max != null && max !== min) return `${min}-${max} ${yearsLabel}`;
  return `${min}+ ${yearsLabel}`;
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
  const experience = experienceText(job, t("jobs.years"), t("jobs.fresherOk"));

  return (
    <Link href={`/jobs/${job._id}`} className="job-row group">
      <div className="flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="job-row-title">{jobTitle(job, locale)}</h3>
            {age <= NEW_FOR_DAYS && <span className="badge badge-success">{t("jobs.newJob")}</span>}
          </div>
          {company && <p className="mt-1 truncate text-[0.92rem] text-ink-soft">{company}</p>}

          <div className="job-row-meta mt-3">
            <span>
              <IconClock className="h-3.5 w-3.5" />
              {experience}
            </span>
            <span>
              <IconRupee className="h-3.5 w-3.5" />
              {salary || t("jobs.salaryOnTalk")}
            </span>
            <span>
              <IconPin className="h-3.5 w-3.5" />
              {job.city}
            </span>
            {employmentType && (
              <span>
                <IconClock className="h-3.5 w-3.5" />
                {optionLabel(employmentType, locale)}
              </span>
            )}
          </div>

          {(job.skills?.length > 0 || category) && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {category && <span className="chip">{categoryName(category, locale)}</span>}
              {job.skills.slice(0, 4).map((skill) => (
                <span key={skill} className="chip">
                  {skill}
                </span>
              ))}
            </div>
          )}

          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="text-xs text-ink-mute">{timeAgo(age, locale)}</span>
            <span className="text-sm font-semibold text-accent">{t("jobs.viewJob")}</span>
          </div>
        </div>

        <div className="job-row-logo">
          {employer?.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={employer.logoUrl} alt={company} className="h-full w-full object-cover" />
          ) : (
            <CategoryMark label={jobTitle(job, locale)} />
          )}
        </div>
      </div>
    </Link>
  );
}
