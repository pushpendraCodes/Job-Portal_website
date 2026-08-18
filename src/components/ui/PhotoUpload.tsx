"use client";

import { useRef, useState } from "react";
import { getErrorMessage } from "@/lib/api";
import { uploadFile, validateFile } from "@/lib/upload";

export function PhotoUpload({
  value,
  onChange,
  folder = "profile_photos",
  label = "Profile photo",
  hint = "JPG, PNG or WEBP · max 2 MB",
  shape = "circle",
}: {
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  hint?: string;
  shape?: "circle" | "square";
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const pick = async (file?: File) => {
    if (!file) return;
    const invalid = validateFile(file, "image");
    if (invalid) {
      setError(invalid);
      return;
    }
    setError("");
    setBusy(true);
    try {
      onChange(await uploadFile(file, folder));
    } catch (err) {
      setError(getErrorMessage(err, "Upload failed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <label className="label">{label}</label>
      <div className="flex items-center gap-4">
        <div
          className={`flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden border border-line bg-mist ${
            shape === "circle" ? "rounded-full" : "rounded-[14px]"
          }`}
        >
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt={label} className="h-full w-full object-cover" />
          ) : (
            <span className="text-2xl text-ink-mute">☺</span>
          )}
        </div>
        <div>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => void pick(e.target.files?.[0])}
          />
          <button
            type="button"
            className="btn btn-outline btn-sm"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
          >
            {busy ? "Uploading…" : value ? "Change photo" : "Upload photo"}
          </button>
          {value && !busy && (
            <button
              type="button"
              className="btn btn-quiet btn-sm ml-1"
              onClick={() => onChange("")}
            >
              Remove
            </button>
          )}
          <p className={error ? "error-text" : "help-text"}>{error || hint}</p>
        </div>
      </div>
    </div>
  );
}
