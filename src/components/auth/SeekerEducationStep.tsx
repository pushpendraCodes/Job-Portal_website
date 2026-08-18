"use client";

import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { seekerEducationSchema, type SeekerEducationValues } from "@/lib/schemas";
import { QUALIFICATION_LEVELS, optionLabel } from "@/lib/formOptions";
import { SelectInput, TextInput } from "@/components/ui/form";
import { EmptyState } from "@/components/ui/EmptyState";

const EMPTY_ENTRY = {
  level: "",
  degree: "",
  institute: "",
  boardUniversity: "",
  yearOfPassing: "",
  marksPercentage: "",
};

export function SeekerEducationStep({
  defaultValues,
  onBack,
  onNext,
  submitLabel,
  busy,
}: {
  defaultValues: SeekerEducationValues;
  onBack?: () => void;
  onNext: (values: SeekerEducationValues) => void;
  submitLabel?: string;
  busy?: boolean;
}) {
  const t = useTranslations("seekerForm");
  const tc = useTranslations("common");
  const locale = useLocale();

  const form = useForm<SeekerEducationValues>({
    resolver: zodResolver(seekerEducationSchema),
    defaultValues,
    mode: "onBlur",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "education",
  });

  const errors = form.formState.errors;

  return (
    <form className="space-y-5" onSubmit={form.handleSubmit(onNext)}>
      <SelectInput
        label={t("highestQualification")}
        required
        placeholder={t("selectPlaceholder")}
        error={errors.highestQualification?.message}
        {...form.register("highestQualification")}
      >
        {QUALIFICATION_LEVELS.map((option) => (
          <option key={option.value} value={option.value}>
            {optionLabel(option, locale)}
          </option>
        ))}
      </SelectInput>

      <div className="border-t border-line-soft pt-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-ink">{t("educationHeading")}</p>
            <p className="text-xs text-ink-soft">{t("educationHint")}</p>
          </div>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            disabled={fields.length >= 6}
            onClick={() => append(EMPTY_ENTRY)}
          >
            + {t("addEducation")}
          </button>
        </div>
      </div>

      {fields.length === 0 ? (
        <EmptyState
          icon="🎓"
          title={t("noEducation")}
          description={t("noEducationHint")}
          action={
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => append(EMPTY_ENTRY)}
            >
              + {t("addEducation")}
            </button>
          }
        />
      ) : (
        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="card p-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="chip chip-accent">
                  {t("qualification")} {index + 1}
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
                <SelectInput
                  label={t("level")}
                  required
                  placeholder={t("selectPlaceholder")}
                  error={errors.education?.[index]?.level?.message}
                  {...form.register(`education.${index}.level`)}
                >
                  {QUALIFICATION_LEVELS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {optionLabel(option, locale)}
                    </option>
                  ))}
                </SelectInput>
                <TextInput
                  label={t("degree")}
                  required
                  placeholder={t("degreePh")}
                  error={errors.education?.[index]?.degree?.message}
                  {...form.register(`education.${index}.degree`)}
                />
              </div>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <TextInput
                  label={t("institute")}
                  error={errors.education?.[index]?.institute?.message}
                  {...form.register(`education.${index}.institute`)}
                />
                <TextInput
                  label={t("boardUniversity")}
                  error={errors.education?.[index]?.boardUniversity?.message}
                  {...form.register(`education.${index}.boardUniversity`)}
                />
              </div>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <TextInput
                  label={t("yearOfPassing")}
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="2018"
                  error={errors.education?.[index]?.yearOfPassing?.message}
                  {...form.register(`education.${index}.yearOfPassing`)}
                />
                <TextInput
                  label={t("marksPercentage")}
                  inputMode="decimal"
                  placeholder="72"
                  error={errors.education?.[index]?.marksPercentage?.message}
                  {...form.register(`education.${index}.marksPercentage`)}
                />
              </div>
            </div>
          ))}
        </div>
      )}

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
