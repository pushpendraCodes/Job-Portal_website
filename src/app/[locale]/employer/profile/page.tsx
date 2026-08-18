"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { api, getErrorMessage, type ApiSuccess } from "@/lib/api";
import type { EmployerProfile } from "@/lib/types";
import { useAppSelector } from "@/store/hooks";
import {
  clean,
  employerBrandSchema,
  employerCompanySchema,
  employerContactSchema,
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
import { Alert } from "@/components/ui/Alert";
import { PhotoUpload } from "@/components/ui/PhotoUpload";
import { Skeleton } from "@/components/ui/Skeleton";
import { SelectInput, TextArea, TextInput } from "@/components/ui/form";

const TABS = ["company", "contact", "brand"] as const;
type Tab = (typeof TABS)[number];

export default function EmployerProfilePage() {
  const te = useTranslations("employerForm");
  const td = useTranslations("employerDash");
  const tc = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const { user, hydrated } = useAppSelector((s) => s.auth);

  const [tab, setTab] = useState<Tab>("company");
  const [profile, setProfile] = useState<EmployerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");

  const companyForm = useForm<EmployerCompanyValues>({
    resolver: zodResolver(employerCompanySchema),
    mode: "onBlur",
  });
  const contactForm = useForm<EmployerContactValues>({
    resolver: zodResolver(employerContactSchema),
    mode: "onBlur",
  });
  const brandForm = useForm<EmployerBrandValues>({
    resolver: zodResolver(employerBrandSchema),
    mode: "onBlur",
  });

  const load = useCallback(async () => {
    try {
      const { data } = await api.get<ApiSuccess<{ profile: EmployerProfile }>>("/profile/me");
      const p = data.data.profile;
      setProfile(p);
      companyForm.reset({
        companyName: p.companyName ?? "",
        companyNameHi: p.companyNameHi ?? "",
        ownerName: p.ownerName ?? "",
        industryType: p.industryType ?? "hosiery",
        companyType: p.companyType ?? "",
        employeeCount: p.employeeCount ?? "",
        establishedYear: p.establishedYear ? String(p.establishedYear) : "",
        gstNumber: p.gstNumber ?? "",
        website: p.website ?? "",
      });
      contactForm.reset({
        contactPersonName: p.contactPersonName ?? "",
        contactDesignation: p.contactDesignation ?? "",
        contactEmail: p.contactEmail ?? "",
        contactMobile: p.contactMobile ?? "",
        altMobile: p.altMobile ?? "",
        addressLine1: p.addressLine1 ?? "",
        addressLine2: p.addressLine2 ?? "",
        landmark: p.landmark ?? "",
        city: p.city ?? "",
        district: p.district ?? "",
        state: p.state ?? "",
        pincode: p.pincode ?? "",
      });
      brandForm.reset({
        logoUrl: p.logoUrl ?? "",
        description: p.description ?? "",
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
    if (!user || user.accountType !== "employer") {
      router.replace("/auth/login?type=employer");
      return;
    }
    void load();
  }, [hydrated, user, router, load]);

  const save = async (payload: Record<string, unknown>) => {
    setError("");
    setSaved("");
    setSaving(true);
    try {
      const { data } = await api.patch<ApiSuccess<EmployerProfile>>("/profile/employer", payload);
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

  return (
    <div className="mesh-bg min-h-[80vh] py-8 sm:py-10">
      <div className="container-x">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="eyebrow">{td("editCompany")}</p>
            <h1 className="mt-1 font-display text-3xl text-ink">{profile?.companyName}</h1>
          </div>
          <Link href="/employer" className="btn btn-outline btn-sm">
            ← {td("backToDashboard")}
          </Link>
        </div>

        <div className="mt-6 flex gap-2 border-b border-line pb-px">
          {TABS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setTab(item);
                setSaved("");
              }}
              className={`border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
                tab === item
                  ? "border-accent text-accent-deep"
                  : "border-transparent text-ink-soft hover:text-ink"
              }`}
            >
              {te(`step${item.charAt(0).toUpperCase()}${item.slice(1)}`)}
            </button>
          ))}
        </div>

        <div className="panel mt-6 p-6 sm:p-8">
          {error && <Alert tone="error" className="mb-5">{error}</Alert>}
          {saved && <Alert tone="success" className="mb-5">{saved}</Alert>}

          {tab === "company" && (
            <form
              className="space-y-5"
              onSubmit={companyForm.handleSubmit((values) =>
                void save({
                  ...clean(values),
                  establishedYear: toNumber(values.establishedYear),
                  gstNumber: values.gstNumber ? values.gstNumber.toUpperCase() : undefined,
                }),
              )}
            >
              <TextInput
                label={te("companyName")}
                required
                error={companyForm.formState.errors.companyName?.message}
                {...companyForm.register("companyName")}
              />
              <div className="grid gap-5 sm:grid-cols-2">
                <TextInput
                  label={te("companyNameHi")}
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
                  maxLength={4}
                  error={companyForm.formState.errors.establishedYear?.message}
                  {...companyForm.register("establishedYear")}
                />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <TextInput
                  label={te("gstNumber")}
                  className="uppercase"
                  error={companyForm.formState.errors.gstNumber?.message}
                  {...companyForm.register("gstNumber")}
                />
                <TextInput
                  label={te("website")}
                  error={companyForm.formState.errors.website?.message}
                  {...companyForm.register("website")}
                />
              </div>
              <div className="flex justify-end">
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? tc("loading") : tc("save")}
                </button>
              </div>
            </form>
          )}

          {tab === "contact" && (
            <form
              className="space-y-5"
              onSubmit={contactForm.handleSubmit((values) =>
                void save({
                  ...clean(values),
                  address: [values.addressLine1, values.addressLine2]
                    .filter(Boolean)
                    .join(", "),
                }),
              )}
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
                  error={contactForm.formState.errors.contactDesignation?.message}
                  {...contactForm.register("contactDesignation")}
                />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <TextInput
                  label={te("contactEmail")}
                  type="email"
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
              <TextInput
                label={te("addressLine1")}
                required
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
              <div className="flex justify-end">
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? tc("loading") : tc("save")}
                </button>
              </div>
            </form>
          )}

          {tab === "brand" && (
            <form
              className="space-y-5"
              onSubmit={brandForm.handleSubmit((values) => void save(clean(values)))}
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
                error={brandForm.formState.errors.description?.message}
                {...brandForm.register("description")}
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
