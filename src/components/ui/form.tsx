"use client";

import clsx from "clsx";
import { forwardRef } from "react";
import type {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { Field } from "./Field";

type Common = {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  wrapClassName?: string;
};

export const TextInput = forwardRef<
  HTMLInputElement,
  Common & InputHTMLAttributes<HTMLInputElement>
>(function TextInput({ label, error, hint, required, wrapClassName, className, ...props }, ref) {
  return (
    <Field
      label={label}
      error={error}
      hint={hint}
      required={required}
      className={wrapClassName}
    >
      <input
        ref={ref}
        className={clsx("input", error && "input-error", className)}
        aria-invalid={!!error}
        {...props}
      />
    </Field>
  );
});

export const SelectInput = forwardRef<
  HTMLSelectElement,
  Common & SelectHTMLAttributes<HTMLSelectElement> & { placeholder?: string }
>(function SelectInput(
  { label, error, hint, required, wrapClassName, className, placeholder, children, ...props },
  ref,
) {
  return (
    <Field
      label={label}
      error={error}
      hint={hint}
      required={required}
      className={wrapClassName}
    >
      <select
        ref={ref}
        className={clsx("select", error && "input-error", className)}
        aria-invalid={!!error}
        {...props}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {children}
      </select>
    </Field>
  );
});

export const TextArea = forwardRef<
  HTMLTextAreaElement,
  Common & TextareaHTMLAttributes<HTMLTextAreaElement>
>(function TextArea({ label, error, hint, required, wrapClassName, className, ...props }, ref) {
  return (
    <Field
      label={label}
      error={error}
      hint={hint}
      required={required}
      className={wrapClassName}
    >
      <textarea
        ref={ref}
        className={clsx("textarea", error && "input-error", className)}
        aria-invalid={!!error}
        {...props}
      />
    </Field>
  );
});

export function CheckboxRow({
  label,
  description,
  ...props
}: { label: string; description?: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-[12px] border border-line bg-white p-3.5 transition hover:border-accent/50">
      <input
        type="checkbox"
        className="mt-0.5 h-4 w-4 accent-[var(--accent)]"
        {...props}
      />
      <span>
        <span className="block text-sm font-semibold text-ink">{label}</span>
        {description && <span className="block text-xs text-ink-soft">{description}</span>}
      </span>
    </label>
  );
}
