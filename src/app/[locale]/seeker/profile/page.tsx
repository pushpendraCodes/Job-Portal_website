"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { api, getErrorMessage, type ApiSuccess } from "@/lib/api";
import type { JobSeekerProfile } from "@/lib/types";
import { useAppSelector } from "@/store/hooks";
import {
  clean,
  seekerAddressSchema,
  seekerDocumentsSchema,
  seekerPersonalSchema,
  toNumber,
  type SeekerAddressValues,
  type SeekerDocumentsValues,
  type SeekerEducationValues,
  type SeekerExperienceValues,
  type SeekerPersonalValues,
} from "@/lib/schemas";
import { GENDERS, INDIAN_STATES, MARITAL_STATUSES, optionLabel } from "@/lib/formOptions";
import { SeekerEducationStep } from "@/components/auth/SeekerEducationStep";
import { SeekerExperienceStep } from "@/components/auth/SeekerExperienceStep";
import { Alert } from "@/components/ui/Alert";
import { PhotoUpload } from "@/components/ui/PhotoUpload";
import { ResumeUpload } from "@/components/ui/ResumeUpload";
import { Skeleton } from "@/components/ui/Skeleton";
import { SelectInput, TextArea, TextInput } from "@/components/ui/form";

const TABS = ["personal", "address", "education", "experience", "documents"] as const;
type Tab = (typeof TABS)[number];

function toDateInput(value?: string): string {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

function str(value?: number | null): string {
  return value === undefined || value === null ? "" : String(value);
}

function SeekerProfileEditor() {
  const t = useTranslations("seekerForm");
  const td = useTranslations("dashboard");
  const tc = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const search = useSearchParams();
  const { user, hydrated } = useAppSelector((s) => s.auth);

  const initialTab = (search.get("tab") as Tab) || "personal";
  const [tab, setTab] = useState<Tab>(TABS.includes(initialTab) ? initialTab : "personal");
  const [profile, setProfile] = useState<JobSeekerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");

  const personalForm = useForm<SeekerPersonalValues>({
    resolver: zodResolver(seekerPersonalSchema),
    mode: "onBlur",
  });
  const addressForm = useForm<SeekerAddressValues>({
    resolver: zodResolver(seekerAddressSchema),
    mode: "onBlur",
  });
  const documentsForm = useForm<SeekerDocumentsValues>({
    resolver: zodResolver(seekerDocumentsSchema),
    mode: "onBlur",
  });

  const load = useCallback(async () => {
    try {
      const { data } = await api.get<ApiSuccess<{ profile: JobSeekerProfile }>>("/profile/me");
      const p = data.data.profile;
      setProfile(p);
      personalForm.reset({
        fullName: p.fullName ?? "",
        fullNameHi: p.fullNameHi ?? "",
        fatherName: p.fatherName ?? "",
        gender: p.gender ?? "",
        dateOfBirth: toDateInput(p.dateOfBirth),
        maritalStatus: p.maritalStatus ?? "",
        email: p.email ?? "",
        altMobile: p.altMobile ?? "",
        photoUrl: p.photoUrl ?? "",
        headline: p.headline ?? "",
      });
      addressForm.reset({
        addressLine1: p.addressLine1 ?? "",
        addressLine2: p.addressLine2 ?? "",
        landmark: p.landmark ?? "",
        city: p.city ?? "",
        district: p.district ?? "",
        state: p.state ?? "",
        pincode: p.pincode ?? "",
      });
      documentsForm.reset({
        resumeUrl: p.resumeUrl ?? "",
        resumeName: p.resumeName ?? "",
        summary: p.summary ?? "",
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!user || user.accountType !== "job_seeker") {
      router.replace("/auth/login?type=job_seeker");
      return;
    }
    void load();
  }, [hydrated, user, router, load]);

  const save = async (payload: Record<string, unknown>) => {
    setError("");
    setSaved("");
    setSaving(true);
    try {
      const { data } = await api.patch<ApiSuccess<JobSeekerProfile>>(
        "/profile/job-seeker",
        payload,
      );
      setProfile(data.data);
      setSaved(td("savedMessage"));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container-x space-y-4 py-10">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96 w-full rounded-[16px]" />
      </div>
    );
  }

  const educationDefaults: SeekerEducationValues = {
    highestQualification: profile?.highestQualification ?? "",
    education: (profile?.education ?? []).map((entry) => ({
      level: entry.level ?? "",
      degree: entry.degree ?? "",
      institute: entry.institute ?? "",
      boardUniversity: entry.boardUniversity ?? "",
      yearOfPassing: str(entry.yearOfPassing),
      marksPercentage: str(entry.marksPercentage),
    })),
  };

  const experienceDefaults: SeekerExperienceValues = {
    experienceYears: str(profile?.experienceYears ?? 0),
    experienceMonths: str(profile?.experienceMonths),
    skills: profile?.skills ?? [],
    languages: profile?.languages ?? [],
    experience: (profile?.experience ?? []).map((entry) => ({
      companyName: entry.companyName ?? "",
      designation: entry.designation ?? "",
      employmentType: entry.employmentType ?? "",
      city: entry.city ?? "",
      fromDate: toDateInput(entry.fromDate),
      toDate: toDateInput(entry.toDate),
      currentlyWorking: !!entry.currentlyWorking,
      monthlySalary: str(entry.monthlySalary),
      description: entry.description ?? "",
    })),
    preferredEmploymentType: profile?.preferredEmploymentType ?? "",
    expectedSalary: str(profile?.expectedSalary),
    currentSalary: str(profile?.currentSalary),
    noticePeriodDays: str(profile?.noticePeriodDays),
    preferredCities: profile?.preferredCities ?? [],
    willingToRelocate: !!profile?.willingToRelocate,
  };

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="mesh-bg min-h-[80vh] py-8 sm:py-10">
      <div className="container-x">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="eyebrow">{td("editProfile")}</p>
            <h1 className="mt-1 font-display text-3xl text-ink">{profile?.fullName}</h1>
          </div>
          <Link href="/seeker" className="btn btn-outline btn-sm">
            ← {td("backToDashboard")}
          </Link>
        </div>

        <div className="scroll-x-hide mt-6 flex gap-2 overflow-x-auto border-b border-line pb-px">
          {TABS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setTab(item);
                setSaved("");
              }}
              className={`shrink-0 border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
                tab === item
                  ? "border-accent text-accent-deep"
                  : "border-transparent text-ink-soft hover:text-ink"
              }`}
            >
              {t(`step${item.charAt(0).toUpperCase()}${item.slice(1)}`)}
            </button>
          ))}
        </div>

        <div className="panel mt-6 p-6 sm:p-8">
          {error && <Alert tone="error" className="mb-5">{error}</Alert>}
          {saved && <Alert tone="success" className="mb-5">{saved}</Alert>}

          {tab === "personal" && (
            <form
              className="space-y-5"
              onSubmit={personalForm.handleSubmit((values) => void save(clean(values)))}
            >
              <PhotoUpload
                value={personalForm.watch("photoUrl")}
                onChange={(url) => personalForm.setValue("photoUrl", url)}
                label={t("photo")}
                hint={t("photoHint")}
              />

              <div className="grid gap-5 sm:grid-cols-2">
                <TextInput
                  label={t("fullName")}
                  required
                  error={personalForm.formState.errors.fullName?.message}
                  {...personalForm.register("fullName")}
                />
                <TextInput
                  label={t("fullNameHi")}
                  error={personalForm.formState.errors.fullNameHi?.message}
                  {...personalForm.register("fullNameHi")}
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <TextInput
                  label={t("fatherName")}
                  error={personalForm.formState.errors.fatherName?.message}
                  {...personalForm.register("fatherName")}
                />
                <SelectInput
                  label={t("gender")}
                  required
                  placeholder={t("selectPlaceholder")}
                  error={personalForm.formState.errors.gender?.message}
                  {...personalForm.register("gender")}
                >
                  {GENDERS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {optionLabel(option, locale)}
                    </option>
                  ))}
                </SelectInput>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <TextInput
                  label={t("dateOfBirth")}
                  required
                  type="date"
                  max={today}
                  error={personalForm.formState.errors.dateOfBirth?.message}
                  {...personalForm.register("dateOfBirth")}
                />
                <SelectInput
                  label={t("maritalStatus")}
                  placeholder={t("selectPlaceholder")}
                  error={personalForm.formState.errors.maritalStatus?.message}
                  {...personalForm.register("maritalStatus")}
                >
                  {MARITAL_STATUSES.map((option) => (
                    <option key={option.value} value={option.value}>
                      {optionLabel(option, locale)}
                    </option>
                  ))}
                </SelectInput>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <TextInput
                  label={t("email")}
                  type="email"
                  error={personalForm.formState.errors.email?.message}
                  {...personalForm.register("email")}
                />
                <TextInput
                  label={t("altMobile")}
                  inputMode="numeric"
                  maxLength={10}
                  error={personalForm.formState.errors.altMobile?.message}
                  {...personalForm.register("altMobile")}
                />
              </div>

              <TextInput
                label={t("headline")}
                placeholder={t("headlinePh")}
                error={personalForm.formState.errors.headline?.message}
                {...personalForm.register("headline")}
              />

              <div className="flex justify-end">
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? tc("loading") : tc("save")}
                </button>
              </div>
            </form>
          )}

          {tab === "address" && (
            <form
              className="space-y-5"
              onSubmit={addressForm.handleSubmit((values) => void save(clean(values)))}
            >
              <TextInput
                label={t("addressLine1")}
                required
                error={addressForm.formState.errors.addressLine1?.message}
                {...addressForm.register("addressLine1")}
              />
              <div className="grid gap-5 sm:grid-cols-2">
                <TextInput
                  label={t("addressLine2")}
                  error={addressForm.formState.errors.addressLine2?.message}
                  {...addressForm.register("addressLine2")}
                />
                <TextInput
                  label={t("landmark")}
                  error={addressForm.formState.errors.landmark?.message}
                  {...addressForm.register("landmark")}
                />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <TextInput
                  label={t("city")}
                  required
                  error={addressForm.formState.errors.city?.message}
                  {...addressForm.register("city")}
                />
                <TextInput
                  label={t("district")}
                  error={addressForm.formState.errors.district?.message}
                  {...addressForm.register("district")}
                />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <SelectInput
                  label={t("state")}
                  required
                  placeholder={t("selectPlaceholder")}
                  error={addressForm.formState.errors.state?.message}
                  {...addressForm.register("state")}
                >
                  {INDIAN_STATES.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </SelectInput>
                <TextInput
                  label={t("pincode")}
                  inputMode="numeric"
                  maxLength={6}
                  error={addressForm.formState.errors.pincode?.message}
                  {...addressForm.register("pincode")}
                />
              </div>
              <div className="flex justify-end">
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? tc("loading") : tc("save")}
                </button>
              </div>
            </form>
          )}

          {tab === "education" && (
            <SeekerEducationStep
              defaultValues={educationDefaults}
              submitLabel={tc("save")}
              busy={saving}
              onNext={(values) =>
                void save({
                  highestQualification: values.highestQualification,
                  education: values.education.map((entry) => ({
                    ...clean(entry),
                    yearOfPassing: toNumber(entry.yearOfPassing),
                    marksPercentage: toNumber(entry.marksPercentage),
                  })),
                })
              }
            />
          )}

          {tab === "experience" && (
            <SeekerExperienceStep
              defaultValues={experienceDefaults}
              submitLabel={tc("save")}
              busy={saving}
              onNext={(values) =>
                void save({
                  skills: values.skills,
                  languages: values.languages ?? [],
                  preferredCities: values.preferredCities ?? [],
                  experience: values.experience.map((entry) => ({
                    ...clean(entry),
                    currentlyWorking: !!entry.currentlyWorking,
                    toDate: entry.currentlyWorking ? undefined : entry.toDate || undefined,
                    monthlySalary: toNumber(entry.monthlySalary),
                  })),
                  experienceYears: toNumber(values.experienceYears) ?? 0,
                  experienceMonths: toNumber(values.experienceMonths),
                  expectedSalary: toNumber(values.expectedSalary),
                  currentSalary: toNumber(values.currentSalary),
                  noticePeriodDays: toNumber(values.noticePeriodDays),
                  preferredEmploymentType: values.preferredEmploymentType || undefined,
                  willingToRelocate: !!values.willingToRelocate,
                })
              }
            />
          )}

          {tab === "documents" && (
            <form
              className="space-y-5"
              onSubmit={documentsForm.handleSubmit((values) => void save(clean(values)))}
            >
              <ResumeUpload
                value={documentsForm.watch("resumeUrl")}
                fileName={documentsForm.watch("resumeName")}
                label={t("resume")}
                hint={t("resumeHint")}
                onChange={(url, name) => {
                  documentsForm.setValue("resumeUrl", url);
                  documentsForm.setValue("resumeName", name);
                }}
              />
              <TextArea
                label={t("summary")}
                placeholder={t("summaryPh")}
                error={documentsForm.formState.errors.summary?.message}
                {...documentsForm.register("summary")}
              />
              <div className="flex justify-end">
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? tc("loading") : tc("save")}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SeekerProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="container-x py-10">
          <Skeleton className="h-96 w-full rounded-[16px]" />
        </div>
      }
    >
      <SeekerProfileEditor />
    </Suspense>
  );
}
