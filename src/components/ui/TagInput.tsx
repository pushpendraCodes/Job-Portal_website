"use client";

import { useState } from "react";

export function TagInput({
  value,
  onChange,
  placeholder,
  suggestions = [],
  max = 20,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
  max?: number;
}) {
  const [draft, setDraft] = useState("");

  const add = (raw: string) => {
    const tag = raw.trim().replace(/,+$/, "");
    if (!tag || value.length >= max) return;
    if (value.some((v) => v.toLowerCase() === tag.toLowerCase())) return;
    onChange([...value, tag]);
    setDraft("");
  };

  const remove = (tag: string) => onChange(value.filter((v) => v !== tag));

  const open = suggestions.filter(
    (s) => !value.some((v) => v.toLowerCase() === s.toLowerCase()),
  );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 rounded-[12px] border border-line bg-white p-2 focus-within:border-accent focus-within:shadow-[0_0_0_3px_var(--accent-soft)]">
        {value.map((tag) => (
          <span key={tag} className="chip chip-accent">
            {tag}
            <button
              type="button"
              aria-label={`Remove ${tag}`}
              className="text-accent-deep/70 hover:text-accent-deep"
              onClick={() => remove(tag)}
            >
              ×
            </button>
          </span>
        ))}
        <input
          className="min-w-0 flex-1 border-none bg-transparent px-1.5 py-1 text-sm outline-none placeholder:text-ink-mute sm:min-w-[9rem]"
          placeholder={value.length ? "" : placeholder}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add(draft);
            } else if (e.key === "Backspace" && !draft && value.length) {
              remove(value[value.length - 1]!);
            }
          }}
          onBlur={() => add(draft)}
        />
      </div>

      {open.length > 0 && value.length < max && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {open.slice(0, 10).map((s) => (
            <button
              key={s}
              type="button"
              className="chip transition hover:bg-accent-tint hover:text-accent-deep"
              onClick={() => add(s)}
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
