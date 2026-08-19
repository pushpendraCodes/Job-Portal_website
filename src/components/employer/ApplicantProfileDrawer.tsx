"use client";

import { useTranslations } from "next-intl";
import type { JobSeekerProfile } from "@/lib/types";
import { EducationList, ExperienceList } from "@/components/dashboard/ProfileSummary";

type SeekerUser = {
  mobile?: string;
  email?: string;
};

export function ApplicantProfileDrawer({
  open,
  onClose,
  profile,
  seekerUser,
  coverNote,
  resumeUrl,
  locale,
  appliedAt,
  status,
  eyebrow,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  profile?: JobSeekerProfile | null;
  seekerUser?: SeekerUser | null;
  coverNote?: string;
  resumeUrl?: string;
  locale: string;
  appliedAt?: string;
  status?: string;
  /** Overrides the "Applicant profile" label when browsing candidates who have not applied. */
  eyebrow?: string;
  /** Optional action bar pinned to the bottom of the drawer. */
  footer?: React.ReactNode;
}) {
  const t = useTranslations("employerDash");
  const tc = useTranslations("common");

  if (!open || !profile) return null;

  const address = [
    profile.addressLine1,
    profile.addressLine2,
    profile.city,
    profile.district,
    profile.state,
    profile.pincode,
  ]
    .filter(Boolean)
    .join(", ");

  const resume = resumeUrl || profile.resumeUrl;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label={tc("close") || "Close"}
        className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <aside className="relative z-10 flex h-full w-full max-w-xl flex-col overflow-hidden bg-white shadow-2xl animate-[fadeUp_0.25s_ease]">
        <div className="flex items-start justify-between gap-3 border-b border-line-soft px-5 py-4">
          <div className="min-w-0">
            <p className="eyebrow">{eyebrow ?? t("applicantProfile")}</p>
            <h2 className="mt-1 truncate font-display text-2xl text-ink">{profile.fullName}</h2>
            {profile.headline && (
              <p className="mt-1 text-sm text-ink-soft">{profile.headline}</p>
            )}
          </div>
          <button type="button" className="btn btn-quiet btn-sm" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-mist">
              {profile.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.photoUrl}
                  alt={profile.fullName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-xl font-semibold text-ink-mute">
                  {profile.fullName?.[0]?.toUpperCase() ?? "?"}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1 space-y-1 text-sm text-ink-soft">
              {seekerUser?.mobile && <p>📱 +91 {seekerUser.mobile}</p>}
              {(seekerUser?.email || profile.email) && (
                <p>✉️ {seekerUser?.email || profile.email}</p>
              )}
              {profile.altMobile && <p>☎ +91 {profile.altMobile}</p>}
              {profile.city && <p>📍 {[profile.city, profile.state].filter(Boolean).join(", ")}</p>}
              {status && <p className="badge badge-neutral w-fit">{status}</p>}
              {appliedAt && (
                <p className="text-xs text-ink-mute">
                  {t("appliedOn")}{" "}
                  {new Date(appliedAt).toLocaleDateString(locale === "hi" ? "hi-IN" : "en-IN")}
                </p>
              )}
            </div>
            {resume && (
              <a href={resume} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm">
                {t("resume")}
              </a>
            )}
          </div>

          {coverNote && (
            <section className="mt-6 rounded-[14px] border border-line-soft bg-mist/50 p-4">
              <h3 className="text-sm font-bold text-ink">{t("coverNote")}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">“{coverNote}”</p>
            </section>
          )}

          {profile.summary && (
            <section className="mt-6">
              <h3 className="font-display text-lg text-ink">{t("aboutCandidate")}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{profile.summary}</p>
            </section>
          )}

          <section className="mt-6 grid gap-3 sm:grid-cols-2">
            <Info label={t("fatherName")} value={profile.fatherName} />
            <Info label={t("gender")} value={profile.gender} />
            <Info
              label={t("dob")}
              value={
                profile.dateOfBirth
                  ? new Date(profile.dateOfBirth).toLocaleDateString(
                      locale === "hi" ? "hi-IN" : "en-IN",
                    )
                  : undefined
              }
            />
            <Info label={t("maritalStatus")} value={profile.maritalStatus} />
            <Info
              label={t("experience")}
              value={
                profile.experienceYears != null
                  ? `${profile.experienceYears} ${t("yrsExp")}${
                      profile.experienceMonths ? ` ${profile.experienceMonths} mo` : ""
                    }`
                  : undefined
              }
            />
            <Info label={t("qualification")} value={profile.highestQualification} />
            <Info
              label={t("currentSalary")}
              value={
                profile.currentSalary != null
                  ? `₹${profile.currentSalary.toLocaleString("en-IN")}`
                  : undefined
              }
            />
            <Info
              label={t("expectedSalary")}
              value={
                profile.expectedSalary != null
                  ? `₹${profile.expectedSalary.toLocaleString("en-IN")}`
                  : undefined
              }
            />
            <Info
              label={t("noticePeriod")}
              value={
                profile.noticePeriodDays != null
                  ? `${profile.noticePeriodDays} ${t("days")}`
                  : undefined
              }
            />
            <Info
              label={t("relocate")}
              value={
                profile.willingToRelocate == null
                  ? undefined
                  : profile.willingToRelocate
                    ? tc("yes")
                    : tc("no")
              }
            />
            <Info
              label={t("preferredCities")}
              value={profile.preferredCities?.length ? profile.preferredCities.join(", ") : undefined}
            />
            <Info label={t("employmentType")} value={profile.preferredEmploymentType} />
          </section>

          {address && (
            <section className="mt-6">
              <h3 className="font-display text-lg text-ink">{t("address")}</h3>
              <p className="mt-2 text-sm text-ink-soft">{address}</p>
            </section>
          )}

          {profile.skills?.length > 0 && (
            <section className="mt-6">
              <h3 className="font-display text-lg text-ink">{t("skills")}</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <span key={skill} className="badge badge-neutral">
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}

          {profile.languages?.length > 0 && (
            <section className="mt-6">
              <h3 className="font-display text-lg text-ink">{t("languages")}</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {profile.languages.map((lang) => (
                  <span key={lang} className="badge badge-neutral">
                    {lang}
                  </span>
                ))}
              </div>
            </section>
          )}

          {profile.experience?.length > 0 && (
            <section className="mt-6">
              <h3 className="mb-4 font-display text-lg text-ink">{t("workExperience")}</h3>
              <ExperienceList items={profile.experience} locale={locale} />
            </section>
          )}

          {profile.education?.length > 0 && (
            <section className="mt-6">
              <h3 className="mb-4 font-display text-lg text-ink">{t("education")}</h3>
              <EducationList items={profile.education} />
            </section>
          )}
        </div>

        {footer && (
          <div className="border-t border-line bg-white px-5 py-4">{footer}</div>
        )}
      </aside>
    </div>
  );
}

function Info({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="rounded-[12px] border border-line-soft px-3 py-2.5">
      <p className="text-[11px] font-bold uppercase tracking-wide text-ink-mute">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-ink">{value}</p>
    </div>
  );
}
