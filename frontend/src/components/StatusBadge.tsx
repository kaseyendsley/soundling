// The color-coded status pill, shared by the leads table and the detail view
// so status colors are defined in exactly one place.

import { LEAD_STATUS_LABELS, type LeadStatus } from "@/lib/types";

const STATUS_STYLES: Record<LeadStatus, string> = {
  new: "bg-blue-50 text-blue-700 ring-blue-600/20",
  reached_out: "bg-amber-50 text-amber-700 ring-amber-600/20",
  in_communication: "bg-purple-50 text-purple-700 ring-purple-600/20",
  licensed: "bg-green-50 text-green-700 ring-green-600/20",
  declined: "bg-gray-100 text-gray-600 ring-gray-500/20",
};

export function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${STATUS_STYLES[status]}`}
    >
      {LEAD_STATUS_LABELS[status]}
    </span>
  );
}
