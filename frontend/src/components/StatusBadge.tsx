// The color-coded lead status pill, shared by the leads table and the detail
// view. It only decides which tone each status gets; the pill's look (light +
// dark) lives in Pill.

import Pill, { type PillTone } from "./Pill";
import { LEAD_STATUS_LABELS, type LeadStatus } from "@/lib/types";

const STATUS_TONES: Record<LeadStatus, PillTone> = {
  new: "magenta",
  reached_out: "amber",
  in_communication: "violet",
  licensed: "emerald",
  declined: "stone",
};

export function StatusBadge({ status }: { status: LeadStatus }) {
  return <Pill tone={STATUS_TONES[status]}>{LEAD_STATUS_LABELS[status]}</Pill>;
}
