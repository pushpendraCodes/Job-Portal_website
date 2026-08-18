import { Link } from "@/i18n/navigation";
import type { EmployerProfile, Job } from "@/lib/types";
import { companyName, formatSalary, jobTitle } from "@/lib/types";

function timeAgo(value: string, locale: string): string {
  const diff = Date.now() - new Date(value).getTime();
  const days = Math.floor(diff / 86_400_000);
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

export function JobListItem({
  job,
  locale,
  salaryLabel,
}: {
  job: Job;
  locale: string;
  salaryLabel: string;
}) {
  const employer =
    typeof job.employerProfileId === "object"
      ? (job.employerProfileId as EmployerProfile)
      : undefined;
  const company = companyName(employer, locale);
  const salary = formatSalary(job);

  return (
    <Link href={`/jobs/${job._id}`} className="card card-hover block p-5">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[12px] border border-line bg-mist">
          {employer?.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={employer.logoUrl} alt={company} className="h-full w-full object-cover" />
          ) : (
            <span className="font-display text-lg text-ink-mute">
              {(company || "?")[0]?.toUpperCase()}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
            <h3 className="font-display text-lg text-ink transition group-hover:text-accent">
              {jobTitle(job, locale)}
            </h3>
            <span className="text-xs text-ink-mute">
              {timeAgo(job.publishedAt || job.createdAt, locale)}
            </span>
          </div>

          <p className="mt-0.5 truncate text-sm font-medium text-ink-soft">{company || "—"}</p>

          <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-soft">
            <span className="inline-flex items-center gap-1">📍 {job.city}</span>
            {salary && (
              <span className="inline-flex items-center gap-1 font-medium text-accent-deep">
                ₹ {salaryLabel}: {salary.replace("₹", "")}
              </span>
            )}
            {job.vacancies ? (
              <span className="inline-flex items-center gap-1">👥 {job.vacancies}</span>
            ) : null}
          </div>

          {job.skills?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {job.skills.slice(0, 5).map((skill) => (
                <span key={skill} className="chip">
                  {skill}
                </span>
              ))}
              {job.skills.length > 5 && (
                <span className="chip">+{job.skills.length - 5}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
