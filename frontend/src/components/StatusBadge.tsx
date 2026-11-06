// The color-coded status pill, shared by the leads table and the detail view
// so status colors are defined in exactly one place.

import { LEAD_STATUS_LABELS, type LeadStatus } from "@/lib/types";

const STATUS_STYLES: Record<LeadStatus, string> = {
  new: "bg-magenta-50 text-magenta-700 ring-magenta-600/20",
  reached_out: "bg-amber-50 text-amber-700 ring-amber-600/20",
  in_communication: "bg-violet-50 text-violet-700 ring-violet-600/20",
  licensed: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  declined: "bg-stone-100 text-stone-500 ring-stone-500/20",
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
