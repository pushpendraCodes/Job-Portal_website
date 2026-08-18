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
  employerBrandSchema,
  employerCompanySchema,
  employerContactSchema,
  clean,
  toNumber,
  type EmployerBrandValues,
  type EmployerCompanyValues,
  type EmployerContactValues,
} from "@/lib/schemas";
import {
  COMPANY_TYPES,
  EMPLOYEE_COUNTS,
  INDIAN_STATES,
  INDUSTRY_TYPES,
  optionLabel,
} from "@/lib/formOptions";
import { OtpStep } from "@/components/auth/OtpStep";
import { Alert } from "@/components/ui/Alert";
import { Stepper } from "@/components/ui/Stepper";
import { PhotoUpload } from "@/components/ui/PhotoUpload";
import { SelectInput, TextArea, TextInput } from "@/components/ui/form";

export default function EmployerRegisterPage() {
  const t = useTranslations("auth");
  const te = useTranslations("employerForm");
  const tc = useTranslations("common");
  const locale = useLocale() as "en" | "hi";
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);

  const [mobile, setMobile] = useState("");
  const [step, setStep] = useState(user?.accountType === "employer" ? 1 : 0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [company, setCompany] = useState<EmployerCompanyValues | null>(null);
  const [contact, setContact] = useState<EmployerContactValues | null>(null);

  const leadTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const captureLead = (formData: Record<string, unknown>, progress: number, lastStep: string) => {
    if (!/^[6-9]\d{9}$/.test(mobile)) return;
    if (leadTimer.current) clearTimeout(leadTimer.current);
    leadTimer.current = setTimeout(() => {
      void api
        .post("/leads/capture", {
          accountType: "employer",
          mobile,
          formData,
          progressPercent: progress,
          lastStep,
          locale,
        })
        .catch(() => undefined);
    }, 400);
  };

  const companyForm = useForm<EmployerCompanyValues>({
    resolver: zodResolver(employerCompanySchema),
    defaultValues: { industryType: "hosiery" },
    mode: "onBlur",
  });

  const contactForm = useForm<EmployerContactValues>({
    resolver: zodResolver(employerContactSchema),
    defaultValues: { state: "", contactMobile: mobile },
    mode: "onBlur",
  });

  const brandForm = useForm<EmployerBrandValues>({
    resolver: zodResolver(employerBrandSchema),
    defaultValues: { logoUrl: "" },
    mode: "onBlur",
  });

  const steps = [te("stepOtp"), te("stepCompany"), te("stepContact"), te("stepBrand")];

  const submitAll = async (brand: EmployerBrandValues) => {
    if (!company || !contact) return;
    setError("");
    setSubmitting(true);
    try {
      await api.post("/auth/register/employer", {
        ...clean(company),
        ...clean(contact),
        ...clean(brand),
        establishedYear: toNumber(company.establishedYear),
        gstNumber: company.gstNumber ? company.gstNumber.toUpperCase() : undefined,
        address: [contact.addressLine1, contact.addressLine2].filter(Boolean).join(", "),
        country: "India",
        preferredLocale: locale,
      });
      dispatch(updateUser({ status: "active", registrationPending: false }));
      router.push("/employer");
    } catch (err) {
      setError(getErrorMessage(err));
      setSubmitting(false);
    }
  };

  return (
    <div className="mesh-bg min-h-[80vh] py-10 sm:py-14">
      <div className="container-x grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="panel order-2 p-6 sm:p-8 lg:order-1">
          <p className="eyebrow">{t("registerEmployer")}</p>
          <h1 className="mt-2 font-display text-3xl text-ink">{te("heading")}</h1>
          <p className="mt-2 text-sm text-ink-soft">{te("subheading")}</p>

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
                accountType="employer"
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
                  contactForm.setValue("contactMobile", mobile);
                  setStep(1);
                }}
              />
            )}

            {step === 1 && (
              <form
                className="space-y-5"
                onSubmit={companyForm.handleSubmit((values) => {
                  setCompany(values);
                  captureLead(values, 45, "company");
                  setStep(2);
                })}
              >
                <TextInput
                  label={te("companyName")}
                  required
                  placeholder={te("companyNamePh")}
                  error={companyForm.formState.errors.companyName?.message}
                  {...companyForm.register("companyName")}
                />

                <div className="grid gap-5 sm:grid-cols-2">
                  <TextInput
                    label={te("companyNameHi")}
                    hint={te("companyNameHiHint")}
                    error={companyForm.formState.errors.companyNameHi?.message}
                    {...companyForm.register("companyNameHi")}
                  />
                  <TextInput
                    label={te("ownerName")}
                    required
                    error={companyForm.formState.errors.ownerName?.message}
                    {...companyForm.register("ownerName")}
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <SelectInput
                    label={te("industryType")}
                    required
                    placeholder={te("selectPlaceholder")}
                    error={companyForm.formState.errors.industryType?.message}
                    {...companyForm.register("industryType")}
                  >
                    {INDUSTRY_TYPES.map((option) => (
                      <option key={option.value} value={option.value}>
                        {optionLabel(option, locale)}
                      </option>
                    ))}
                  </SelectInput>
                  <SelectInput
                    label={te("companyType")}
                    placeholder={te("selectPlaceholder")}
                    error={companyForm.formState.errors.companyType?.message}
                    {...companyForm.register("companyType")}
                  >
                    {COMPANY_TYPES.map((option) => (
                      <option key={option.value} value={option.value}>
                        {optionLabel(option, locale)}
                      </option>
                    ))}
                  </SelectInput>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <SelectInput
                    label={te("employeeCount")}
                    placeholder={te("selectPlaceholder")}
                    error={companyForm.formState.errors.employeeCount?.message}
                    {...companyForm.register("employeeCount")}
                  >
                    {EMPLOYEE_COUNTS.map((count) => (
                      <option key={count} value={count}>
                        {count}
                      </option>
                    ))}
                  </SelectInput>
                  <TextInput
                    label={te("establishedYear")}
                    inputMode="numeric"
                    placeholder="2012"
                    maxLength={4}
                    error={companyForm.formState.errors.establishedYear?.message}
                    {...companyForm.register("establishedYear")}
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <TextInput
                    label={te("gstNumber")}
                    placeholder="09ABCDE1234F1Z5"
                    hint={te("gstHint")}
                    className="uppercase"
                    error={companyForm.formState.errors.gstNumber?.message}
                    {...companyForm.register("gstNumber")}
                  />
                  <TextInput
                    label={te("website")}
                    placeholder="www.yourcompany.com"
                    error={companyForm.formState.errors.website?.message}
                    {...companyForm.register("website")}
                  />
                </div>

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
                onSubmit={contactForm.handleSubmit((values) => {
                  setContact(values);
                  captureLead({ ...company, ...values }, 75, "contact");
                  setStep(3);
                })}
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <TextInput
                    label={te("contactPersonName")}
                    required
                    error={contactForm.formState.errors.contactPersonName?.message}
                    {...contactForm.register("contactPersonName")}
                  />
                  <TextInput
                    label={te("contactDesignation")}
                    placeholder={te("designationPh")}
                    error={contactForm.formState.errors.contactDesignation?.message}
                    {...contactForm.register("contactDesignation")}
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <TextInput
                    label={te("contactEmail")}
                    type="email"
                    placeholder="hr@company.com"
                    error={contactForm.formState.errors.contactEmail?.message}
                    {...contactForm.register("contactEmail")}
                  />
                  <TextInput
                    label={te("contactMobile")}
                    inputMode="numeric"
                    maxLength={10}
                    error={contactForm.formState.errors.contactMobile?.message}
                    {...contactForm.register("contactMobile")}
                  />
                </div>

                <TextInput
                  label={te("altMobile")}
                  inputMode="numeric"
                  maxLength={10}
                  error={contactForm.formState.errors.altMobile?.message}
                  {...contactForm.register("altMobile")}
                />

                <div className="border-t border-line-soft pt-5">
                  <p className="text-sm font-semibold text-ink">{te("addressHeading")}</p>
                </div>

                <TextInput
                  label={te("addressLine1")}
                  required
                  placeholder={te("addressLine1Ph")}
                  error={contactForm.formState.errors.addressLine1?.message}
                  {...contactForm.register("addressLine1")}
                />

                <div className="grid gap-5 sm:grid-cols-2">
                  <TextInput
                    label={te("addressLine2")}
                    error={contactForm.formState.errors.addressLine2?.message}
                    {...contactForm.register("addressLine2")}
                  />
                  <TextInput
                    label={te("landmark")}
                    error={contactForm.formState.errors.landmark?.message}
                    {...contactForm.register("landmark")}
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <TextInput
                    label={te("city")}
                    required
                    error={contactForm.formState.errors.city?.message}
                    {...contactForm.register("city")}
                  />
                  <TextInput
                    label={te("district")}
                    error={contactForm.formState.errors.district?.message}
                    {...contactForm.register("district")}
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <SelectInput
                    label={te("state")}
                    required
                    placeholder={te("selectPlaceholder")}
                    error={contactForm.formState.errors.state?.message}
                    {...contactForm.register("state")}
                  >
                    {INDIAN_STATES.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </SelectInput>
                  <TextInput
                    label={te("pincode")}
                    inputMode="numeric"
                    maxLength={6}
                    error={contactForm.formState.errors.pincode?.message}
                    {...contactForm.register("pincode")}
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
              <form
                className="space-y-5"
                onSubmit={brandForm.handleSubmit((values) => void submitAll(values))}
              >
                <PhotoUpload
                  shape="square"
                  label={te("logo")}
                  hint={te("logoHint")}
                  folder="company_logos"
                  value={brandForm.watch("logoUrl")}
                  onChange={(url) => brandForm.setValue("logoUrl", url)}
                />

                <TextArea
                  label={te("about")}
                  placeholder={te("aboutPh")}
                  hint={te("aboutHint")}
                  error={brandForm.formState.errors.description?.message}
                  {...brandForm.register("description")}
                />

                {error && <Alert tone="error">{error}</Alert>}

                <div className="flex justify-between">
                  <button type="button" className="btn btn-quiet" onClick={() => setStep(2)}>
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
              {te("benefitsTitle")}
            </p>
            <ul className="mt-4 space-y-3 text-sm text-white/85">
              {["benefit1", "benefit2", "benefit3", "benefit4"].map((key) => (
                <li key={key} className="flex gap-2.5">
                  <span className="text-accent-soft">✓</span>
                  <span>{te(key)}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="card mt-4 p-5 text-sm text-ink-soft">
            <p className="font-semibold text-ink">{te("helpTitle")}</p>
            <p className="mt-1">{te("helpBody")}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
