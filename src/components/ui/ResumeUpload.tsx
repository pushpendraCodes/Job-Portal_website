"use client";

import { useRef, useState } from "react";
import { getErrorMessage } from "@/lib/api";
import { formatBytes, uploadFile, validateFile } from "@/lib/upload";

export function ResumeUpload({
  value,
  fileName,
  onChange,
  label = "Resume / CV",
  hint = "PDF, DOC or DOCX · max 5 MB",
}: {
  value?: string;
  fileName?: string;
  onChange: (url: string, name: string) => void;
  label?: string;
  hint?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [size, setSize] = useState<number | null>(null);

  const handle = async (file?: File) => {
    if (!file) return;
    const invalid = validateFile(file, "resume");
    if (invalid) {
      setError(invalid);
      return;
    }
    setError("");
    setBusy(true);
    try {
      const url = await uploadFile(file, "resumes");
      setSize(file.size);
      onChange(url, file.name);
    } catch (err) {
      setError(getErrorMessage(err, "Upload failed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <label className="label">{label}</label>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void handle(e.dataTransfer.files?.[0]);
        }}
        className={`rounded-[14px] border border-dashed px-5 py-6 text-center transition ${
          dragging ? "border-accent bg-accent-tint" : "border-line bg-white"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          className="hidden"
          onChange={(e) => void handle(e.target.files?.[0])}
        />

        {value ? (
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="chip chip-accent">
              📄 {fileName || "Resume uploaded"}
              {size ? ` · ${formatBytes(size)}` : ""}
            </span>
            <a href={value} target="_blank" rel="noreferrer" className="btn btn-quiet btn-sm">
              View
            </a>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              disabled={busy}
              onClick={() => inputRef.current?.click()}
            >
              Replace
            </button>
          </div>
        ) : (
          <>
            <div className="text-2xl">📄</div>
            <p className="mt-2 text-sm text-ink-soft">
              Drag &amp; drop your resume here, or{" "}
              <button
                type="button"
                className="font-semibold text-accent underline-offset-2 hover:underline"
                disabled={busy}
                onClick={() => inputRef.current?.click()}
              >
                {busy ? "uploading…" : "browse files"}
              </button>
            </p>
          </>
        )}
      </div>
      <p className={error ? "error-text" : "help-text"}>{error || hint}</p>
    </div>
  );
}
