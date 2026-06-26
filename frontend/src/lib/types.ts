// Core domain types for Soundling.
// These mirror the data model (see the ERD) the backend + scraper will
// eventually produce, so the dashboard is built against the real shape
// from day one.

// ---------------------------------------------------------------------------
// Enums — string-literal unions.
// The compiler rejects typos (e.g. "resturant") and these map 1:1 to Django's
// `choices`. We store machine values here; human labels live in the maps below.
// ---------------------------------------------------------------------------

/** Venue category, in the client's outreach priority order. */
export type VenueType = "restaurant" | "bar" | "venue";

/**
 * Where a lead is in the client's outreach workflow, in pipeline order:
 * New → Reached Out → In Communication → Licensed (won) / Declined (lost).
 */
export type LeadStatus =
  | "new"
  | "reached_out"
  | "in_communication"
  | "licensed"
  | "declined";

/**
 * Which discovery tier surfaced this lead.
 * - pre_opening: permit filings / announcements before doors open (high value, harder)
 * - recently_opened: opened within ~90 days (more reliable data)
 */
export type DiscoverySignal = "pre_opening" | "recently_opened";

// ---------------------------------------------------------------------------
// Entities
// ---------------------------------------------------------------------------

/**
 * A person to reach at a venue. One venue can have many. Only `name` is
 * required — role and the contact methods are filled in if/when known.
 */
export interface Contact {
  id: string;
  name: string;
  role: string | null;
  phone: string | null;
  email: string | null;
}

/** A single place we found evidence of this venue. One venue can have many. */
export interface SourceRecord {
  id: string;
  /** e.g. "Google Places", "Yelp", "Eventbrite", "Local News" */
  source: string;
  /** Link back to where we found it, when available. */
  url: string | null;
  /** When this particular discovery happened (ISO datetime). */
  discoveredAt: string;
}

/**
 * One status transition in a lead's history — read top to bottom, the rows
 * form the lead's timeline.
 */
export interface StatusChange {
  id: string;
  /** Previous status. null on the first row (the lead's "birth"). */
  fromStatus: LeadStatus | null;
  toStatus: LeadStatus;
  /** Display name of the user who made the change. null = system/automated. */
  changedBy: string | null;
  /** When the change happened (ISO datetime). */
  changedAt: string;
  /** Free-text note. Always present (may be ""), surfaced to the client. */
  note: string;
}

/** A deduplicated venue lead — the unit shown in the dashboard. */
export interface Lead {
  id: string;
  name: string;
  type: VenueType;
  /** Street line, e.g. "1200 E 6th St". */
  streetAddress: string;
  city: string;
  state: string;
  /** US ZIP code, e.g. "78702". */
  postalCode: string;
  signal: DiscoverySignal;
  /** Opening date if known (ISO date). null for pre-opening leads without a date. */
  openedDate: string | null;
  /** Current status (denormalized for fast list rendering; see statusHistory). */
  status: LeadStatus;
  /**
   * Archived leads are hidden from the default dashboard and excluded from its
   * tallies — the client's way to retire a lead they're done with, without
   * deleting it. The archived view shows them with the same search/filter/sort.
   */
  archived: boolean;
  /** When Soundling first discovered this venue (ISO datetime). */
  discoveredAt: string;
  /** People to reach at the venue (may be empty until contacts are found). */
  contacts: Contact[];
  /** Every individual discovery instance — confidence + audit trail. */
  sources: SourceRecord[];
  /** Full status timeline. The current `status` is the latest entry's toStatus. */
  statusHistory: StatusChange[];
  /**
   * Venue-level freeform note the client maintains — e.g. why a lead was
   * Declined, or owner contact preferences. Distinct from the per-transition
   * notes in statusHistory. Always present (may be "").
   */
  note: string;
}

// ---------------------------------------------------------------------------
// Human-readable labels — keep machine values (above) and display text apart
// so the API and the UI never fight over casing.
// ---------------------------------------------------------------------------

export const VENUE_TYPE_LABELS: Record<VenueType, string> = {
  restaurant: "Restaurant",
  bar: "Bar",
  venue: "Venue",
};

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New",
  reached_out: "Reached Out",
  in_communication: "In Communication",
  licensed: "Licensed",
  declined: "Declined",
};

export const SIGNAL_LABELS: Record<DiscoverySignal, string> = {
  pre_opening: "Pre-opening",
  recently_opened: "Recently opened",
};
