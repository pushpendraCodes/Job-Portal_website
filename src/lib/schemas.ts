import { z } from "zod";

const mobileRegex = /^[6-9]\d{9}$/;
const pincodeRegex = /^\d{6}$/;

const optionalText = z.string().trim().optional().or(z.literal(""));

const optionalMobile = z
  .string()
  .trim()
  .refine((v) => !v || mobileRegex.test(v), "Enter a valid 10 digit mobile number")
  .optional()
  .or(z.literal(""));

const optionalEmail = z
  .string()
  .trim()
  .refine((v) => !v || z.string().email().safeParse(v).success, "Enter a valid email")
  .optional()
  .or(z.literal(""));

const optionalPincode = z
  .string()
  .trim()
  .refine((v) => !v || pincodeRegex.test(v), "Pincode must be 6 digits")
  .optional()
  .or(z.literal(""));

const optionalUrl = z
  .string()
  .trim()
  .refine(
    (v) => !v || /^(https?:\/\/)?[\w.-]+\.[a-z]{2,}(\/\S*)?$/i.test(v),
    "Enter a valid website URL",
  )
  .optional()
  .or(z.literal(""));

/* ------------------------------ employer ------------------------------ */

export const employerCompanySchema = z.object({
  companyName: z.string().trim().min(2, "Company name must be at least 2 characters"),
  companyNameHi: optionalText,
  ownerName: z.string().trim().min(2, "Owner name must be at least 2 characters"),
  industryType: z.string().trim().min(1, "Select your industry"),
  companyType: optionalText,
  employeeCount: optionalText,
  establishedYear: z
    .string()
    .trim()
    .refine((v) => {
      if (!v) return true;
      const year = Number(v);
      return Number.isInteger(year) && year >= 1900 && year <= new Date().getFullYear();
    }, "Enter a valid year")
    .optional()
    .or(z.literal("")),
  gstNumber: z
    .string()
    .trim()
    .refine(
      (v) => !v || /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9A-Z]{3}$/.test(v.toUpperCase()),
      "Enter a valid 15 character GST number",
    )
    .optional()
    .or(z.literal("")),
  website: optionalUrl,
});

export const employerContactSchema = z.object({
  contactPersonName: z.string().trim().min(2, "Contact person name is required"),
  contactDesignation: optionalText,
  contactEmail: optionalEmail,
  contactMobile: optionalMobile,
  altMobile: optionalMobile,
  addressLine1: z.string().trim().min(4, "Address is required"),
  addressLine2: optionalText,
  landmark: optionalText,
  city: z.string().trim().min(2, "City is required"),
  district: optionalText,
  state: z.string().trim().min(2, "Select a state"),
  pincode: optionalPincode,
});

export const employerBrandSchema = z.object({
  logoUrl: optionalText,
  description: z
    .string()
    .trim()
    .max(1200, "Keep the description under 1200 characters")
    .optional()
    .or(z.literal("")),
});

export type EmployerCompanyValues = z.infer<typeof employerCompanySchema>;
export type EmployerContactValues = z.infer<typeof employerContactSchema>;
export type EmployerBrandValues = z.infer<typeof employerBrandSchema>;

/* ----------------------------- job seeker ----------------------------- */

function ageFromDob(dob: string): number {
  const birth = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age -= 1;
  return age;
}

export const seekerPersonalSchema = z.object({
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters"),
  fullNameHi: optionalText,
  fatherName: optionalText,
  gender: z.string().trim().min(1, "Select your gender"),
  dateOfBirth: z
    .string()
    .trim()
    .min(1, "Date of birth is required")
    .refine((v) => !Number.isNaN(new Date(v).getTime()), "Enter a valid date")
    .refine((v) => ageFromDob(v) >= 15, "You must be at least 15 years old")
    .refine((v) => ageFromDob(v) <= 70, "Enter a valid date of birth"),
  maritalStatus: optionalText,
  email: optionalEmail,
  altMobile: optionalMobile,
  photoUrl: optionalText,
  headline: z
    .string()
    .trim()
    .max(90, "Keep the headline under 90 characters")
    .optional()
    .or(z.literal("")),
});

export const seekerAddressSchema = z.object({
  addressLine1: z.string().trim().min(4, "Address is required"),
  addressLine2: optionalText,
  landmark: optionalText,
  city: z.string().trim().min(2, "City is required"),
  district: optionalText,
  state: z.string().trim().min(2, "Select a state"),
  pincode: optionalPincode,
});

export const educationEntrySchema = z.object({
  level: z.string().trim().min(1, "Select qualification level"),
  degree: z.string().trim().min(2, "Course / degree is required"),
  institute: optionalText,
  boardUniversity: optionalText,
  yearOfPassing: z
    .string()
    .trim()
    .refine((v) => {
      if (!v) return true;
      const year = Number(v);
      return Number.isInteger(year) && year >= 1950 && year <= new Date().getFullYear() + 5;
    }, "Enter a valid year")
    .optional()
    .or(z.literal("")),
  marksPercentage: z
    .string()
    .trim()
    .refine((v) => {
      if (!v) return true;
      const pct = Number(v);
      return !Number.isNaN(pct) && pct >= 0 && pct <= 100;
    }, "Enter a percentage between 0 and 100")
    .optional()
    .or(z.literal("")),
});

export const experienceEntrySchema = z
  .object({
    companyName: z.string().trim().min(2, "Company name is required"),
    designation: z.string().trim().min(2, "Designation is required"),
    employmentType: optionalText,
    city: optionalText,
    fromDate: z.string().trim().min(1, "Start date is required"),
    toDate: optionalText,
    currentlyWorking: z.boolean().optional(),
    monthlySalary: z
      .string()
      .trim()
      .refine((v) => !v || (!Number.isNaN(Number(v)) && Number(v) >= 0), "Enter a valid amount")
      .optional()
      .or(z.literal("")),
    description: optionalText,
  })
  .refine((v) => v.currentlyWorking || !!v.toDate, {
    message: "Add an end date or mark as currently working",
    path: ["toDate"],
  })
  .refine((v) => !v.toDate || new Date(v.toDate) >= new Date(v.fromDate), {
    message: "End date must be after the start date",
    path: ["toDate"],
  });

export const seekerEducationSchema = z.object({
  highestQualification: z.string().trim().min(1, "Select your highest qualification"),
  education: z.array(educationEntrySchema).max(6, "You can add up to 6 qualifications"),
});

export const seekerExperienceSchema = z.object({
  experienceYears: z
    .string()
    .trim()
    .refine((v) => {
      const years = Number(v);
      return !Number.isNaN(years) && years >= 0 && years <= 60;
    }, "Enter experience between 0 and 60 years"),
  experienceMonths: z
    .string()
    .trim()
    .refine((v) => {
      if (!v) return true;
      const months = Number(v);
      return Number.isInteger(months) && months >= 0 && months <= 11;
    }, "Months must be between 0 and 11")
    .optional()
    .or(z.literal("")),
  skills: z.array(z.string()).min(1, "Add at least one skill"),
  languages: z.array(z.string()).optional(),
  experience: z.array(experienceEntrySchema).max(8, "You can add up to 8 experiences"),
  preferredEmploymentType: optionalText,
  expectedSalary: z
    .string()
    .trim()
    .refine((v) => !v || (!Number.isNaN(Number(v)) && Number(v) >= 0), "Enter a valid amount")
    .optional()
    .or(z.literal("")),
  currentSalary: z
    .string()
    .trim()
    .refine((v) => !v || (!Number.isNaN(Number(v)) && Number(v) >= 0), "Enter a valid amount")
    .optional()
    .or(z.literal("")),
  noticePeriodDays: z
    .string()
    .trim()
    .refine((v) => {
      if (!v) return true;
      const days = Number(v);
      return Number.isInteger(days) && days >= 0 && days <= 365;
    }, "Enter days between 0 and 365")
    .optional()
    .or(z.literal("")),
  preferredCities: z.array(z.string()).optional(),
  willingToRelocate: z.boolean().optional(),
});

export const seekerDocumentsSchema = z.object({
  resumeUrl: optionalText,
  resumeName: optionalText,
  summary: z
    .string()
    .trim()
    .max(1500, "Keep the summary under 1500 characters")
    .optional()
    .or(z.literal("")),
});

export type SeekerPersonalValues = z.infer<typeof seekerPersonalSchema>;
export type SeekerAddressValues = z.infer<typeof seekerAddressSchema>;
export type SeekerEducationValues = z.infer<typeof seekerEducationSchema>;
export type SeekerExperienceValues = z.infer<typeof seekerExperienceSchema>;
export type SeekerDocumentsValues = z.infer<typeof seekerDocumentsSchema>;
export type EducationEntryValues = z.infer<typeof educationEntrySchema>;
export type ExperienceEntryValues = z.infer<typeof experienceEntrySchema>;

/* ------------------------------- job post ------------------------------- */

export const jobPostSchema = z
  .object({
    titleEn: z.string().trim().min(3, "Title must be at least 3 characters"),
    titleHi: optionalText,
    descriptionEn: z.string().trim().min(30, "Describe the role in at least 30 characters"),
    descriptionHi: optionalText,
    categoryId: z.string().trim().min(1, "Select a category"),
    subcategoryId: optionalText,
    employmentType: optionalText,
    city: z.string().trim().min(2, "City is required"),
    state: optionalText,
    salaryMin: z
      .string()
      .trim()
      .refine((v) => !v || (!Number.isNaN(Number(v)) && Number(v) >= 0), "Enter a valid amount")
      .optional()
      .or(z.literal("")),
    salaryMax: z
      .string()
      .trim()
      .refine((v) => !v || (!Number.isNaN(Number(v)) && Number(v) >= 0), "Enter a valid amount")
      .optional()
      .or(z.literal("")),
    salaryType: optionalText,
    vacancies: z
      .string()
      .trim()
      .refine((v) => {
        const n = Number(v);
        return Number.isInteger(n) && n >= 1 && n <= 999;
      }, "Enter between 1 and 999 vacancies"),
    experienceMin: z
      .string()
      .trim()
      .refine((v) => !v || (!Number.isNaN(Number(v)) && Number(v) >= 0), "Enter valid years")
      .optional()
      .or(z.literal("")),
    experienceMax: z
      .string()
      .trim()
      .refine((v) => !v || (!Number.isNaN(Number(v)) && Number(v) >= 0), "Enter valid years")
      .optional()
      .or(z.literal("")),
    skills: z.array(z.string()).min(1, "Add at least one skill"),
  })
  .refine(
    (v) => !v.salaryMin || !v.salaryMax || Number(v.salaryMax) >= Number(v.salaryMin),
    { message: "Maximum salary must be higher than minimum", path: ["salaryMax"] },
  )
  .refine(
    (v) =>
      !v.experienceMin ||
      !v.experienceMax ||
      Number(v.experienceMax) >= Number(v.experienceMin),
    { message: "Maximum experience must be higher than minimum", path: ["experienceMax"] },
  );

export type JobPostValues = z.infer<typeof jobPostSchema>;

/** Strips blank strings and converts numeric strings before hitting the API. */
export function clean<T extends Record<string, unknown>>(input: T): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    if (value === undefined || value === null || value === "") continue;
    out[key] = value;
  }
  return out;
}

export function toNumber(value?: string): number | undefined {
  if (value === undefined || value === "") return undefined;
  const num = Number(value);
  return Number.isNaN(num) ? undefined : num;
}
