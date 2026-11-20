// The rounded status "pill" used across the app. Callers pick a color `tone`;
// the light + dark styles for every tone live here, in one place. Light: pale
// fill + dark text. Dark: a translucent tint of the same hue + light text, so
// pills glow softly instead of looking like stickers on black.

import type { ReactNode } from "react";

export type PillTone = "magenta" | "amber" | "violet" | "emerald" | "red" | "stone";

const TONE_STYLES: Record<PillTone, string> = {
  magenta: "bg-magenta-50 text-magenta-700 ring-magenta-600/20 dark:bg-magenta-400/15 dark:text-magenta-200 dark:ring-magenta-400/30",
  amber: "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/25",
  violet: "bg-violet-50 text-violet-700 ring-violet-600/20 dark:bg-violet-400/10 dark:text-violet-300 dark:ring-violet-400/25",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/25",
  red: "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-400/10 dark:text-red-300 dark:ring-red-400/25",
  stone: "bg-stone-100 text-stone-500 ring-stone-500/20 dark:bg-white/5 dark:text-stone-400 dark:ring-white/10",
};

export default function Pill({
  tone,
  children,
}: {
  tone: PillTone;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${TONE_STYLES[tone]}`}
    >
      {children}
    </span>
  );
}
