"use client";

import clsx from "clsx";

export function Stepper({
  steps,
  current,
  onStepClick,
}: {
  steps: string[];
  current: number;
  onStepClick?: (index: number) => void;
}) {
  const progress = ((current + 1) / steps.length) * 100;
  const currentLabel = steps[current] ?? "";

  return (
    <div className="min-w-0">
      {/* Mobile: compact current step */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between gap-3 text-xs font-semibold">
          <span className="text-ink-mute">
            {current + 1} / {steps.length}
          </span>
          <span className="truncate text-accent-deep">{currentLabel}</span>
        </div>
        <div className="progress-track mt-2.5">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-3 flex gap-1.5">
          {steps.map((step, index) => {
            const done = index < current;
            const active = index === current;
            return (
              <button
                key={step}
                type="button"
                aria-label={step}
                disabled={!onStepClick || index > current}
                onClick={() => onStepClick?.(index)}
                className={clsx(
                  "h-2 flex-1 rounded-full transition",
                  active && "bg-accent",
                  done && "bg-accent/55",
                  !active && !done && "bg-mist",
                )}
              />
            );
          })}
        </div>
      </div>

      {/* Tablet+ : labeled pills */}
      <div className="hidden sm:block">
        <div className="scroll-x-hide flex items-center gap-2 overflow-x-auto pb-1">
          {steps.map((step, index) => {
            const done = index < current;
            const active = index === current;
            return (
              <button
                key={step}
                type="button"
                disabled={!onStepClick || index > current}
                onClick={() => onStepClick?.(index)}
                className={clsx(
                  "flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition",
                  active && "bg-accent text-white shadow-sm",
                  done && "bg-accent-tint text-accent-deep hover:bg-accent-soft",
                  !active && !done && "text-ink-mute",
                  onStepClick && index <= current ? "cursor-pointer" : "cursor-default",
                )}
              >
                <span
                  className={clsx(
                    "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold",
                    active ? "bg-white/25 text-white" : done ? "bg-accent text-white" : "bg-mist",
                  )}
                >
                  {done ? "✓" : index + 1}
                </span>
                {step}
              </button>
            );
          })}
        </div>
        <div className="progress-track mt-3">
          <div className="progress-fill" style={{ width: `${(current / Math.max(steps.length - 1, 1)) * 100}%` }} />
        </div>
      </div>
    </div>
  );
}
