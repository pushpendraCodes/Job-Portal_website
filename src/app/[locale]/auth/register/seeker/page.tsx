"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { api, getErrorMessage } from "@/lib/api";
import type { AuthUser } from "@/lib/types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setCredentials, updateUser } from "@/store/authSlice";
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
import { OtpStep } from "@/components/auth/OtpStep";
import { SeekerEducationStep } from "@/components/auth/SeekerEducationStep";
import { SeekerExperienceStep } from "@/components/auth/SeekerExperienceStep";
import { Alert } from "@/components/ui/Alert";
import { Stepper } from "@/components/ui/Stepper";
import { PhotoUpload } from "@/components/ui/PhotoUpload";
import { ResumeUpload } from "@/components/ui/ResumeUpload";
import { SelectInput, TextArea, TextInput } from "@/components/ui/form";

const EDUCATION_DEFAULTS: SeekerEducationValues = {
  highestQualification: "",
  education: [],
};

const EXPERIENCE_DEFAULTS: SeekerExperienceValues = {
  experienceYears: "0",
  experienceMonths: "",
  skills: [],
  languages: [],
  experience: [],
  preferredEmploymentType: "",
  expectedSalary: "",
  currentSalary: "",
  noticePeriodDays: "",
  preferredCities: [],
  willingToRelocate: false,
};

export default function SeekerRegisterPage() {
  const t = useTranslations("auth");
  const ts = useTranslations("seekerForm");
  const tc = useTranslations("common");
  const locale = useLocale() as "en" | "hi";
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);

  const [mobile, setMobile] = useState("");
  const [step, setStep] = useState(user?.accountType === "job_seeker" ? 1 : 0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [personal, setPersonal] = useState<SeekerPersonalValues | null>(null);
  const [address, setAddress] = useState<SeekerAddressValues | null>(null);
  const [education, setEducation] = useState<SeekerEducationValues>(EDUCATION_DEFAULTS);
  const [experience, setExperience] = useState<SeekerExperienceValues>(EXPERIENCE_DEFAULTS);

  const leadTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const captureLead = (formData: Record<string, unknown>, progress: number, lastStep: string) => {
    if (!/^[6-9]\d{9}$/.test(mobile)) return;
    if (leadTimer.current) clearTimeout(leadTimer.current);
    leadTimer.current = setTimeout(() => {
      void api
        .post("/leads/capture", {
          accountType: "job_seeker",
          mobile,
          formData,
          progressPercent: progress,
          lastStep,
          locale,
        })
        .catch(() => undefined);
    }, 400);
  };

  const personalForm = useForm<SeekerPersonalValues>({
    resolver: zodResolver(seekerPersonalSchema),
    defaultValues: { gender: "", photoUrl: "" },
    mode: "onBlur",
  });

  const addressForm = useForm<SeekerAddressValues>({
    resolver: zodResolver(seekerAddressSchema),
    defaultValues: { state: "" },
    mode: "onBlur",
  });

  const documentsForm = useForm<SeekerDocumentsValues>({
    resolver: zodResolver(seekerDocumentsSchema),
    defaultValues: { resumeUrl: "", resumeName: "" },
    mode: "onBlur",
  });

  const steps = [
    ts("stepOtp"),
    ts("stepPersonal"),
    ts("stepAddress"),
    ts("stepEducation"),
    ts("stepExperience"),
    ts("stepDocuments"),
  ];

  const submitAll = async (documents: SeekerDocumentsValues) => {
    if (!personal || !address) return;
    setError("");
    setSubmitting(true);
    try {
      await api.post("/auth/register/job-seeker", {
        ...clean(personal),
        ...clean(address),
        ...clean(documents),
        dateOfBirth: personal.dateOfBirth,
        highestQualification: education.highestQualification,
        education: education.education.map((entry) => ({
          ...clean(entry),
          yearOfPassing: toNumber(entry.yearOfPassing),
          marksPercentage: toNumber(entry.marksPercentage),
        })),
        experience: experience.experience.map((entry) => ({
          ...clean(entry),
          currentlyWorking: !!entry.currentlyWorking,
          toDate: entry.currentlyWorking ? undefined : entry.toDate || undefined,
          monthlySalary: toNumber(entry.monthlySalary),
        })),
        skills: experience.skills,
        languages: experience.languages ?? [],
        preferredCities: experience.preferredCities ?? [],
        experienceYears: toNumber(experience.experienceYears) ?? 0,
        experienceMonths: toNumber(experience.experienceMonths),
        expectedSalary: toNumber(experience.expectedSalary),
        currentSalary: toNumber(experience.currentSalary),
        noticePeriodDays: toNumber(experience.noticePeriodDays),
        preferredEmploymentType: experience.preferredEmploymentType || undefined,
        willingToRelocate: !!experience.willingToRelocate,
        preferredLocale: locale,
      });
      dispatch(updateUser({ status: "active", registrationPending: false }));
      router.push("/seeker");
    } catch (err) {
      setError(getErrorMessage(err));
      setSubmitting(false);
    }
  };

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="mesh-bg min-h-[80vh] py-10 sm:py-14">
      <div className="container-x grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="panel order-2 p-6 sm:p-8 lg:order-1">
          <p className="eyebrow">{t("registerSeeker")}</p>
          <h1 className="mt-2 font-display text-3xl text-ink">{ts("heading")}</h1>
          <p className="mt-2 text-sm text-ink-soft">{ts("subheading")}</p>

          <div className="mt-6">
            <Stepper
              steps={steps}
              current={step}
              onStepClick={(index) => index > 0 && index < step && setStep(index)}
            />
          </div>

          <div className="mt-8">
            {step === 0 && (
              <OtpStep
                accountType="job_seeker"
                mode="register"
                mobile={mobile}
                onMobileChange={(value) => {
                  setMobile(value);
                  if (value.length === 10) captureLead({ mobile: value }, 15, "mobile");
                }}
                onVerified={(payload: {
                  user: AuthUser;
                  accessToken: string;
                  refreshToken: string;
                }) => {
                  dispatch(setCredentials(payload));
                  setStep(1);
                }}
              />
            )}

            {step === 1 && (
              <form
                className="space-y-5"
                onSubmit={personalForm.handleSubmit((values) => {
                  setPersonal(values);
                  captureLead(values, 35, "personal");
                  setStep(2);
                })}
              >
                <PhotoUpload
                  value={personalForm.watch("photoUrl")}
                  onChange={(url) => personalForm.setValue("photoUrl", url)}
                  label={ts("photo")}
                  hint={ts("photoHint")}
                />

                <div className="grid gap-5 sm:grid-cols-2">
                  <TextInput
                    label={ts("fullName")}
                    required
                    placeholder={ts("fullNamePh")}
                    error={personalForm.formState.errors.fullName?.message}
                    {...personalForm.register("fullName")}
                  />
                  <TextInput
                    label={ts("fullNameHi")}
                    hint={ts("fullNameHiHint")}
                    error={personalForm.formState.errors.fullNameHi?.message}
                    {...personalForm.register("fullNameHi")}
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <TextInput
                    label={ts("fatherName")}
                    error={personalForm.formState.errors.fatherName?.message}
                    {...personalForm.register("fatherName")}
                  />
                  <SelectInput
                    label={ts("gender")}
                    required
                    placeholder={ts("selectPlaceholder")}
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
                    label={ts("dateOfBirth")}
                    required
                    type="date"
                    max={today}
                    error={personalForm.formState.errors.dateOfBirth?.message}
                    {...personalForm.register("dateOfBirth")}
                  />
                  <SelectInput
                    label={ts("maritalStatus")}
                    placeholder={ts("selectPlaceholder")}
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
                    label={ts("email")}
                    type="email"
                    placeholder="you@example.com"
                    error={personalForm.formState.errors.email?.message}
                    {...personalForm.register("email")}
                  />
                  <TextInput
                    label={ts("altMobile")}
                    inputMode="numeric"
                    maxLength={10}
                    error={personalForm.formState.errors.altMobile?.message}
                    {...personalForm.register("altMobile")}
                  />
                </div>

                <TextInput
                  label={ts("headline")}
                  placeholder={ts("headlinePh")}
                  hint={ts("headlineHint")}
                  error={personalForm.formState.errors.headline?.message}
                  {...personalForm.register("headline")}
                />

                <div className="flex justify-end">
                  <button type="submit" className="btn btn-primary">
                    {tc("next")} →
                  </button>
                </div>
              </form>
            )}

            {step === 2 && (
              <form
                className="space-y-5"
                onSubmit={addressForm.handleSubmit((values) => {
                  setAddress(values);
                  captureLead({ ...personal, ...values }, 50, "address");
                  setStep(3);
                })}
              >
                <TextInput
                  label={ts("addressLine1")}
                  required
                  placeholder={ts("addressLine1Ph")}
                  error={addressForm.formState.errors.addressLine1?.message}
                  {...addressForm.register("addressLine1")}
                />

                <div className="grid gap-5 sm:grid-cols-2">
                  <TextInput
                    label={ts("addressLine2")}
                    error={addressForm.formState.errors.addressLine2?.message}
                    {...addressForm.register("addressLine2")}
                  />
                  <TextInput
                    label={ts("landmark")}
                    error={addressForm.formState.errors.landmark?.message}
                    {...addressForm.register("landmark")}
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <TextInput
                    label={ts("city")}
                    required
                    error={addressForm.formState.errors.city?.message}
                    {...addressForm.register("city")}
                  />
                  <TextInput
                    label={ts("district")}
                    error={addressForm.formState.errors.district?.message}
                    {...addressForm.register("district")}
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <SelectInput
                    label={ts("state")}
                    required
                    placeholder={ts("selectPlaceholder")}
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
                    label={ts("pincode")}
                    inputMode="numeric"
                    maxLength={6}
                    error={addressForm.formState.errors.pincode?.message}
                    {...addressForm.register("pincode")}
                  />
                </div>

                <div className="flex justify-between">
                  <button type="button" className="btn btn-quiet" onClick={() => setStep(1)}>
                    ← {tc("back")}
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {tc("next")} →
                  </button>
                </div>
              </form>
            )}

            {step === 3 && (
              <SeekerEducationStep
                defaultValues={education}
                onBack={() => setStep(2)}
                onNext={(values) => {
                  setEducation(values);
                  captureLead({ ...personal, ...values }, 65, "education");
                  setStep(4);
                }}
              />
            )}

            {step === 4 && (
              <SeekerExperienceStep
                defaultValues={experience}
                onBack={() => setStep(3)}
                onNext={(values) => {
                  setExperience(values);
                  captureLead({ ...personal, skills: values.skills }, 85, "experience");
                  setStep(5);
                }}
              />
            )}

            {step === 5 && (
              <form
                className="space-y-5"
                onSubmit={documentsForm.handleSubmit((values) => void submitAll(values))}
              >
                <ResumeUpload
                  value={documentsForm.watch("resumeUrl")}
                  fileName={documentsForm.watch("resumeName")}
                  label={ts("resume")}
                  hint={ts("resumeHint")}
                  onChange={(url, name) => {
                    documentsForm.setValue("resumeUrl", url);
                    documentsForm.setValue("resumeName", name);
                  }}
                />

                <TextArea
                  label={ts("summary")}
                  placeholder={ts("summaryPh")}
                  hint={ts("summaryHint")}
                  error={documentsForm.formState.errors.summary?.message}
                  {...documentsForm.register("summary")}
                />

                {error && <Alert tone="error">{error}</Alert>}

                <div className="flex justify-between">
                  <button type="button" className="btn btn-quiet" onClick={() => setStep(4)}>
                    ← {tc("back")}
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? tc("loading") : t("complete")}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        <aside className="order-1 h-fit lg:order-2 lg:sticky lg:top-24">
          <div className="weave-bg rounded-[16px] p-6 text-white">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/70">
              {ts("benefitsTitle")}
            </p>
            <ul className="mt-4 space-y-3 text-sm text-white/85">
              {["benefit1", "benefit2", "benefit3", "benefit4"].map((key) => (
                <li key={key} className="flex gap-2.5">
                  <span className="text-accent-soft">✓</span>
                  <span>{ts(key)}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="card mt-4 p-5 text-sm text-ink-soft">
            <p className="font-semibold text-ink">{ts("helpTitle")}</p>
            <p className="mt-1">{ts("helpBody")}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
