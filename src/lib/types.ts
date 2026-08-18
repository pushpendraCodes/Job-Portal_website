export type AccountType = "employer" | "job_seeker" | "office_employee" | "admin";

export interface AuthUser {
  id: string;
  accountType: AccountType;
  mobile?: string;
  email?: string;
  status: string;
  preferredLocale?: "en" | "hi";
  isMpinSet?: boolean;
  registrationPending?: boolean;
}

export interface EmployerProfile {
  _id: string;
  companyName: string;
  companyNameHi?: string;
  ownerName: string;
  gstNumber?: string;
  panNumber?: string;
  companyType?: string;
  employeeCount?: string;
  establishedYear?: number;
  contactPersonName?: string;
  contactDesignation?: string;
  contactEmail?: string;
  contactMobile?: string;
  altMobile?: string;
  addressLine1?: string;
  addressLine2?: string;
  landmark?: string;
  address?: string;
  city?: string;
  district?: string;
  state?: string;
  pincode?: string;
  country?: string;
  industryType?: string;
  logoUrl?: string;
  website?: string;
  description?: string;
}

export interface EducationEntry {
  _id?: string;
  level?: string;
  degree: string;
  institute?: string;
  boardUniversity?: string;
  yearOfPassing?: number;
  marksPercentage?: number;
}

export interface ExperienceEntry {
  _id?: string;
  companyName: string;
  designation: string;
  employmentType?: string;
  city?: string;
  fromDate: string;
  toDate?: string;
  currentlyWorking?: boolean;
  monthlySalary?: number;
  description?: string;
}

export interface JobSeekerProfile {
  _id: string;
  fullName: string;
  fullNameHi?: string;
  fatherName?: string;
  gender?: string;
  dateOfBirth?: string;
  maritalStatus?: string;
  email?: string;
  altMobile?: string;
  photoUrl?: string;
  headline?: string;
  summary?: string;
  addressLine1?: string;
  addressLine2?: string;
  landmark?: string;
  city?: string;
  district?: string;
  state?: string;
  pincode?: string;
  skills: string[];
  languages: string[];
  experienceYears?: number;
  experienceMonths?: number;
  education: EducationEntry[];
  experience: ExperienceEntry[];
  highestQualification?: string;
  currentSalary?: number;
  expectedSalary?: number;
  noticePeriodDays?: number;
  preferredCities: string[];
  preferredEmploymentType?: string;
  willingToRelocate?: boolean;
  resumeUrl?: string;
  resumeName?: string;
}

export interface JobCategory {
  _id: string;
  nameEn: string;
  nameHi: string;
  slug: string;
  iconUrl?: string;
  subcategories?: JobCategory[];
}

export interface Job {
  _id: string;
  titleEn: string;
  titleHi: string;
  descriptionEn: string;
  descriptionHi: string;
  city: string;
  state?: string;
  employmentType?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryType?: string;
  vacancies: number;
  experienceMin?: number;
  experienceMax?: number;
  skills: string[];
  status: string;
  viewsCount?: number;
  applicationsCount?: number;
  publishedAt?: string;
  createdAt: string;
  hasApplied?: boolean;
  employerProfileId?: EmployerProfile | string;
  categoryId?: JobCategory | string;
}

export interface JobApplication {
  _id: string;
  jobId?: Job | string;
  status: string;
  coverNote?: string;
  resumeUrl?: string;
  createdAt: string;
}

export function jobTitle(job: Job, locale: string) {
  return locale === "hi" && job.titleHi ? job.titleHi : job.titleEn;
}

export function jobDescription(job: Job, locale: string) {
  return locale === "hi" && job.descriptionHi ? job.descriptionHi : job.descriptionEn;
}

export function categoryName(cat: JobCategory, locale: string) {
  return locale === "hi" ? cat.nameHi : cat.nameEn;
}

export function companyName(
  profile: EmployerProfile | string | undefined,
  locale: string,
) {
  if (!profile || typeof profile === "string") return "";
  return locale === "hi" && profile.companyNameHi
    ? profile.companyNameHi
    : profile.companyName;
}

export function formatSalary(job: {
  salaryMin?: number;
  salaryMax?: number;
  salaryType?: string;
}): string | null {
  if (!job.salaryMin && !job.salaryMax) return null;
  const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;
  const range =
    job.salaryMin && job.salaryMax
      ? `${fmt(job.salaryMin)} – ${fmt(job.salaryMax)}`
      : fmt((job.salaryMin ?? job.salaryMax)!);
  const suffix =
    job.salaryType === "daily"
      ? "/day"
      : job.salaryType === "hourly"
        ? "/hr"
        : job.salaryType === "yearly"
          ? "/yr"
          : "/month";
  return `${range}${suffix}`;
}

/** Percentage of the key profile fields a job seeker has filled in. */
export function profileCompleteness(profile: JobSeekerProfile | null): number {
  if (!profile) return 0;
  const checks = [
    !!profile.fullName,
    !!profile.photoUrl,
    !!profile.dateOfBirth,
    !!profile.gender,
    !!profile.city,
    !!profile.addressLine1,
    !!profile.email,
    !!profile.headline,
    (profile.skills?.length ?? 0) > 0,
    (profile.education?.length ?? 0) > 0,
    (profile.experience?.length ?? 0) > 0,
    !!profile.resumeUrl,
    !!profile.summary,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

export function employerCompleteness(profile: EmployerProfile | null): number {
  if (!profile) return 0;
  const checks = [
    !!profile.companyName,
    !!profile.ownerName,
    !!profile.industryType,
    !!profile.contactPersonName,
    !!profile.contactEmail,
    !!profile.contactMobile,
    !!profile.addressLine1,
    !!profile.city,
    !!profile.state,
    !!profile.logoUrl,
    !!profile.description,
    !!profile.gstNumber,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}
