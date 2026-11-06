// The persistence seam for leads.
//
// Everything that touches storage lives in THIS file. Today it's backed by the
// browser's localStorage (seeded from the mock leads) so manually-added leads
// persist and show up immediately. When the Django backend exists, we replace
// the bodies of these functions with API calls — every caller stays the same.
// That's the whole point of routing all reads/writes through one module.

import { MOCK_LEADS } from "./mock-leads";
import type { Lead } from "./types";

const STORAGE_KEY = "soundling.manualLeads";

// --- localStorage helpers (the part that gets swapped for the API later) ----

/** Leads the user added by hand. Empty on the server (no localStorage there). */
function loadManual(): Lead[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Lead[]) : [];
  } catch {
    return [];
  }
}

function saveManual(leads: Lead[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
}

// --- public API (callers use only these) ------------------------------------

/** All leads: the seed (mock/scraped) set plus anything added by hand. */
export function getAllLeads(): Lead[] {
  return [...MOCK_LEADS, ...loadManual()];
}

/** One lead by id, or undefined if not found. */
export function getLead(id: string): Lead | undefined {
  return getAllLeads().find((lead) => lead.id === id);
}

/** Persist a brand-new, hand-entered lead. */
export function addLead(lead: Lead) {
  saveManual([...loadManual(), lead]);
}
