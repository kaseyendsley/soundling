// The color-coded status pill, shared by the leads table and the detail view
// so status colors are defined in exactly one place.

import { LEAD_STATUS_LABELS, type LeadStatus } from "@/lib/types";

// Light: pale fill + dark text. Dark: a translucent tint of the same hue + light
// text, so the pills glow softly instead of looking like stickers on black.
const STATUS_STYLES: Record<LeadStatus, string> = {
  new: "bg-magenta-50 text-magenta-700 ring-magenta-600/20 dark:bg-magenta-400/15 dark:text-magenta-200 dark:ring-magenta-400/30",
  reached_out: "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/25",
  in_communication: "bg-violet-50 text-violet-700 ring-violet-600/20 dark:bg-violet-400/10 dark:text-violet-300 dark:ring-violet-400/25",
  licensed: "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/25",
  declined: "bg-stone-100 text-stone-500 ring-stone-500/20 dark:bg-white/5 dark:text-stone-400 dark:ring-white/10",
};

export function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${STATUS_STYLES[status]}`}
    >
      {LEAD_STATUS_LABELS[status]}
    </span>
  );
}
