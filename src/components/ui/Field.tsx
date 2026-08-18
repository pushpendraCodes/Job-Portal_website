"use client";

import clsx from "clsx";
import type { ReactNode } from "react";

export function Field({
  label,
  required,
  error,
  hint,
  className,
  children,
}: {
  label?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      {label && <label className={clsx("label", required && "label-req")}>{label}</label>}
      {children}
      {error ? (
        <p className="error-text">{error}</p>
      ) : hint ? (
        <p className="help-text">{hint}</p>
      ) : null}
    </div>
  );
}
