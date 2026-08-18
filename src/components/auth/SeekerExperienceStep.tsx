"use client";

import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { seekerExperienceSchema, type SeekerExperienceValues } from "@/lib/schemas";
import {
  EMPLOYMENT_TYPES,
  LANGUAGE_SUGGESTIONS,
  SKILL_SUGGESTIONS,
  optionLabel,
} from "@/lib/formOptions";
import { CheckboxRow, SelectInput, TextArea, TextInput } from "@/components/ui/form";
import { Field } from "@/components/ui/Field";
import { TagInput } from "@/components/ui/TagInput";

const EMPTY_ENTRY = {
  companyName: "",
  designation: "",
  employmentType: "",
  city: "",
  fromDate: "",
  toDate: "",
  currentlyWorking: false,
  monthlySalary: "",
  description: "",
};

export function SeekerExperienceStep({
  defaultValues,
  onBack,
  onNext,
  submitLabel,
  busy,
}: {
  defaultValues: SeekerExperienceValues;
  onBack?: () => void;
  onNext: (values: SeekerExperienceValues) => void;
  submitLabel?: string;
  busy?: boolean;
}) {
  const t = useTranslations("seekerForm");
  const tc = useTranslations("common");
  const locale = useLocale();

  const form = useForm<SeekerExperienceValues>({
    resolver: zodResolver(seekerExperienceSchema),
    defaultValues,
    mode: "onBlur",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "experience",
  });

  const errors = form.formState.errors;
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form className="space-y-5" onSubmit={form.handleSubmit(onNext)}>
      <div className="grid gap-5 sm:grid-cols-2">
        <TextInput
          label={t("experienceYears")}
          required
          inputMode="numeric"
          placeholder="0"
          error={errors.experienceYears?.message}
          {...form.register("experienceYears")}
        />
        <TextInput
          label={t("experienceMonths")}
          inputMode="numeric"
          placeholder="0"
          error={errors.experienceMonths?.message}
          {...form.register("experienceMonths")}
        />
      </div>

      <Controller
        control={form.control}
        name="skills"
        render={({ field }) => (
          <Field
            label={t("skills")}
            required
            error={errors.skills?.message}
            hint={t("skillsHint")}
          >
            <TagInput
              value={field.value ?? []}
              onChange={field.onChange}
              placeholder={t("skillsPh")}
              suggestions={SKILL_SUGGESTIONS}
            />
          </Field>
        )}
      />

      <Controller
        control={form.control}
        name="languages"
        render={({ field }) => (
          <Field label={t("languages")} hint={t("languagesHint")}>
            <TagInput
              value={field.value ?? []}
              onChange={field.onChange}
              placeholder={t("languagesPh")}
              suggestions={LANGUAGE_SUGGESTIONS}
              max={8}
            />
          </Field>
        )}
      />

      <div className="border-t border-line-soft pt-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-ink">{t("workHeading")}</p>
            <p className="text-xs text-ink-soft">{t("workHint")}</p>
          </div>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            disabled={fields.length >= 8}
            onClick={() => append(EMPTY_ENTRY)}
          >
            + {t("addExperience")}
          </button>
        </div>
      </div>

      {fields.map((field, index) => {
        const current = form.watch(`experience.${index}.currentlyWorking`);
        return (
          <div key={field.id} className="card p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="chip chip-accent">
                {t("experienceEntry")} {index + 1}
              </span>
              <button
                type="button"
                className="btn btn-danger-soft btn-sm"
                onClick={() => remove(index)}
              >
                {tc("remove")}
              </button>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <TextInput
                label={t("companyName")}
                required
                error={errors.experience?.[index]?.companyName?.message}
                {...form.register(`experience.${index}.companyName`)}
              />
              <TextInput
                label={t("designation")}
                required
                placeholder={t("designationPh")}
                error={errors.experience?.[index]?.designation?.message}
                {...form.register(`experience.${index}.designation`)}
              />
            </div>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <SelectInput
                label={t("employmentType")}
                placeholder={t("selectPlaceholder")}
                error={errors.experience?.[index]?.employmentType?.message}
                {...form.register(`experience.${index}.employmentType`)}
              >
                {EMPLOYMENT_TYPES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {optionLabel(option, locale)}
                  </option>
                ))}
              </SelectInput>
              <TextInput
                label={t("city")}
                error={errors.experience?.[index]?.city?.message}
                {...form.register(`experience.${index}.city`)}
              />
            </div>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <TextInput
                label={t("fromDate")}
                required
                type="date"
                max={today}
                error={errors.experience?.[index]?.fromDate?.message}
                {...form.register(`experience.${index}.fromDate`)}
              />
              <TextInput
                label={t("toDate")}
                type="date"
                max={today}
                disabled={!!current}
                error={errors.experience?.[index]?.toDate?.message}
                {...form.register(`experience.${index}.toDate`)}
              />
            </div>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <CheckboxRow
                label={t("currentlyWorking")}
                {...form.register(`experience.${index}.currentlyWorking`)}
              />
              <TextInput
                label={t("monthlySalary")}
                inputMode="numeric"
                placeholder="18000"
                error={errors.experience?.[index]?.monthlySalary?.message}
                {...form.register(`experience.${index}.monthlySalary`)}
              />
            </div>

            <TextArea
              wrapClassName="mt-5"
              label={t("roleDescription")}
              placeholder={t("roleDescriptionPh")}
              error={errors.experience?.[index]?.description?.message}
              {...form.register(`experience.${index}.description`)}
            />
          </div>
        );
      })}

      <div className="border-t border-line-soft pt-5">
        <p className="text-sm font-semibold text-ink">{t("preferencesHeading")}</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <SelectInput
          label={t("preferredEmploymentType")}
          placeholder={t("selectPlaceholder")}
          error={errors.preferredEmploymentType?.message}
          {...form.register("preferredEmploymentType")}
        >
          {EMPLOYMENT_TYPES.map((option) => (
            <option key={option.value} value={option.value}>
              {optionLabel(option, locale)}
            </option>
          ))}
        </SelectInput>
        <TextInput
          label={t("noticePeriod")}
          inputMode="numeric"
          placeholder="15"
          error={errors.noticePeriodDays?.message}
          {...form.register("noticePeriodDays")}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <TextInput
          label={t("currentSalary")}
          inputMode="numeric"
          placeholder="15000"
          error={errors.currentSalary?.message}
          {...form.register("currentSalary")}
        />
        <TextInput
          label={t("expectedSalary")}
          inputMode="numeric"
          placeholder="22000"
          error={errors.expectedSalary?.message}
          {...form.register("expectedSalary")}
        />
      </div>

      <Controller
        control={form.control}
        name="preferredCities"
        render={({ field }) => (
          <Field label={t("preferredCities")} hint={t("preferredCitiesHint")}>
            <TagInput
              value={field.value ?? []}
              onChange={field.onChange}
              placeholder={t("preferredCitiesPh")}
              max={6}
            />
          </Field>
        )}
      />

      <CheckboxRow
        label={t("willingToRelocate")}
        description={t("willingToRelocateHint")}
        {...form.register("willingToRelocate")}
      />

      <div className="flex justify-between">
        {onBack ? (
          <button type="button" className="btn btn-quiet" onClick={onBack}>
            ← {tc("back")}
          </button>
        ) : (
          <span />
        )}
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? tc("loading") : submitLabel ? submitLabel : `${tc("next")} →`}
        </button>
      </div>
    </form>
  );
}
