"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { api, getErrorMessage, type ApiSuccess } from "@/lib/api";
import type { JobCategory } from "@/lib/types";
import { categoryName } from "@/lib/types";
import { useAppSelector } from "@/store/hooks";
import { clean, jobPostSchema, toNumber, type JobPostValues } from "@/lib/schemas";
import {
  EMPLOYMENT_TYPES,
  INDIAN_STATES,
  SKILL_SUGGESTIONS,
  optionLabel,
} from "@/lib/formOptions";
import { Alert } from "@/components/ui/Alert";
import { Field } from "@/components/ui/Field";
import { TagInput } from "@/components/ui/TagInput";
import { SelectInput, TextArea, TextInput } from "@/components/ui/form";

const SALARY_TYPES = [
  { value: "monthly", labelEn: "Per month", labelHi: "प्रति माह" },
  { value: "daily", labelEn: "Per day", labelHi: "प्रति दिन" },
  { value: "hourly", labelEn: "Per hour", labelHi: "प्रति घंटा" },
  { value: "yearly", labelEn: "Per year", labelHi: "प्रति वर्ष" },
];

export default function NewJobPage() {
  const t = useTranslations("employer");
  const tj = useTranslations("jobs");
  const tf = useTranslations("jobForm");
  const tc = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const { user, hydrated } = useAppSelector((s) => s.auth);

  const [categories, setCategories] = useState<JobCategory[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const form = useForm<JobPostValues>({
    resolver: zodResolver(jobPostSchema),
    defaultValues: {
      vacancies: "1",
      salaryType: "monthly",
      employmentType: "full_time",
      skills: [],
      categoryId: "",
      subcategoryId: "",
      state: "",
    },
    mode: "onBlur",
  });

  const selectedCategoryId = form.watch("categoryId");
  const selectedCategory = categories.find((c) => c._id === selectedCategoryId);
  const subcategories = selectedCategory?.subcategories ?? [];

  useEffect(() => {
    if (!hydrated) return;
    if (!user || user.accountType !== "employer") {
      router.replace("/auth/login?type=employer");
      return;
    }
    void api
      .get<ApiSuccess<JobCategory[]>>("/categories")
      .then(({ data }) => setCategories(data.data))
      .catch(() => undefined);
  }, [hydrated, user, router]);

  useEffect(() => {
    form.setValue("subcategoryId", "");
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only when parent category changes
  }, [selectedCategoryId]);

  const submit = async (values: JobPostValues) => {
    setError("");
    setSubmitting(true);
    try {
      await api.post("/jobs", {
        ...clean(values),
        titleHi: values.titleHi || values.titleEn,
        descriptionHi: values.descriptionHi || values.descriptionEn,
        salaryMin: toNumber(values.salaryMin),
        salaryMax: toNumber(values.salaryMax),
        experienceMin: toNumber(values.experienceMin),
        experienceMax: toNumber(values.experienceMax),
        vacancies: toNumber(values.vacancies) ?? 1,
        skills: values.skills,
        subcategoryId: values.subcategoryId || undefined,
        submitForApproval: true,
      });
      router.push("/employer");
    } catch (err) {
      setError(getErrorMessage(err));
      setSubmitting(false);
    }
  };

  const errors = form.formState.errors;

  return (
    <div className="mesh-bg min-h-[80vh] py-8 sm:py-10">
      <div className="container-x max-w-3xl">
        <Link href="/employer" className="text-sm font-semibold text-ink-soft hover:text-accent">
          ← {tc("back")}
        </Link>

        <div className="mt-3">
          <p className="eyebrow">{tf("eyebrow")}</p>
          <h1 className="mt-1 font-display text-3xl text-ink">{t("createJob")}</h1>
          <p className="mt-2 text-sm text-ink-soft">{tf("subheading")}</p>
        </div>

        <form className="panel mt-6 space-y-5 p-6 sm:p-8" onSubmit={form.handleSubmit(submit)}>
          <TextInput
            label={t("titleEn")}
            required
            placeholder={tf("titlePh")}
            error={errors.titleEn?.message}
            {...form.register("titleEn")}
          />
          <TextInput
            label={t("titleHi")}
            hint={tf("titleHiHint")}
            error={errors.titleHi?.message}
            {...form.register("titleHi")}
          />

          <TextArea
            label={t("descEn")}
            required
            placeholder={tf("descPh")}
            className="min-h-40"
            error={errors.descriptionEn?.message}
            {...form.register("descriptionEn")}
          />
          <TextArea
            label={t("descHi")}
            hint={tf("descHiHint")}
            error={errors.descriptionHi?.message}
            {...form.register("descriptionHi")}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <SelectInput
              label={t("category")}
              required
              placeholder={tf("selectPlaceholder")}
              error={errors.categoryId?.message}
              {...form.register("categoryId")}
            >
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {categoryName(category, locale)}
                </option>
              ))}
            </SelectInput>
            <SelectInput
              label={t("subcategory")}
              placeholder={
                selectedCategoryId
                  ? subcategories.length
                    ? tf("selectSubcategory")
                    : tf("selectPlaceholder")
                  : tf("selectCategoryFirst")
              }
              disabled={!selectedCategoryId || subcategories.length === 0}
              error={errors.subcategoryId?.message}
              {...form.register("subcategoryId")}
            >
              {subcategories.map((sub) => (
                <option key={sub._id} value={sub._id}>
                  {categoryName(sub, locale)}
                </option>
              ))}
            </SelectInput>
          </div>

          <SelectInput
            label={tj("employmentType")}
            error={errors.employmentType?.message}
            {...form.register("employmentType")}
          >
            {EMPLOYMENT_TYPES.map((option) => (
              <option key={option.value} value={option.value}>
                {optionLabel(option, locale)}
              </option>
            ))}
          </SelectInput>

          <div className="grid gap-5 sm:grid-cols-2">
            <TextInput
              label={t("city")}
              required
              error={errors.city?.message}
              {...form.register("city")}
            />
            <SelectInput
              label={tf("state")}
              placeholder={tf("selectPlaceholder")}
              error={errors.state?.message}
              {...form.register("state")}
            >
              {INDIAN_STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </SelectInput>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <TextInput
              label={tf("salaryMin")}
              inputMode="numeric"
              placeholder="12000"
              error={errors.salaryMin?.message}
              {...form.register("salaryMin")}
            />
            <TextInput
              label={tf("salaryMax")}
              inputMode="numeric"
              placeholder="20000"
              error={errors.salaryMax?.message}
              {...form.register("salaryMax")}
            />
            <SelectInput
              label={tf("salaryType")}
              error={errors.salaryType?.message}
              {...form.register("salaryType")}
            >
              {SALARY_TYPES.map((option) => (
                <option key={option.value} value={option.value}>
                  {optionLabel(option, locale)}
                </option>
              ))}
            </SelectInput>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <TextInput
              label={tf("experienceMin")}
              inputMode="numeric"
              placeholder="0"
              error={errors.experienceMin?.message}
              {...form.register("experienceMin")}
            />
            <TextInput
              label={tf("experienceMax")}
              inputMode="numeric"
              placeholder="5"
              error={errors.experienceMax?.message}
              {...form.register("experienceMax")}
            />
            <TextInput
              label={tj("vacancies")}
              required
              inputMode="numeric"
              error={errors.vacancies?.message}
              {...form.register("vacancies")}
            />
          </div>

          <Controller
            control={form.control}
            name="skills"
            render={({ field }) => (
              <Field
                label={tf("skills")}
                required
                error={errors.skills?.message}
                hint={tf("skillsHint")}
              >
                <TagInput
                  value={field.value ?? []}
                  onChange={field.onChange}
                  placeholder={tf("skillsPh")}
                  suggestions={SKILL_SUGGESTIONS}
                />
              </Field>
            )}
          />

          {error && <Alert tone="error">{error}</Alert>}

          <div className="flex justify-end gap-3 border-t border-line-soft pt-5">
            <Link href="/employer" className="btn btn-quiet">
              {tc("cancel")}
            </Link>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? tc("loading") : t("publish")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
