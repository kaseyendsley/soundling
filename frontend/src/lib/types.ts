// Core domain types for Soundling.
// These mirror the data model (see the ERD) the backend + scraper will
// eventually produce, so the dashboard is built against the real shape
// from day one.

// ---------------------------------------------------------------------------
// Enums — string-literal unions.
// The compiler rejects typos (e.g. "resturant") and these map 1:1 to Django's
// `choices`. We store machine values here; human labels live in the maps below.
// ---------------------------------------------------------------------------

/** Business category — mirrors BMI's official license-type list exactly. */
export type VenueType =
  | "radio"
  | "bar_restaurant_brewery"
  | "residential_community"
  | "healthcare_facility"
  | "television"
  | "fitness_club"
  | "website_mobile_app"
  | "retail"
  | "hotel_lodging"
  | "endurance_events"
  | "political_entities"
  | "rv_parks";

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
  /**
   * When the lead was last contacted — bumped on every status change. null
   * until the first status update, so the client can sort to surface stale
   * leads worth following up on.
   */
  lastContactedAt: string | null;
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
  radio: "Radio",
  bar_restaurant_brewery: "Bar, Restaurant or Brewery",
  residential_community: "Residential Community",
  healthcare_facility: "Healthcare Facility",
  television: "Television",
  fitness_club: "Fitness Club",
  website_mobile_app: "Website or Mobile App",
  retail: "Retail",
  hotel_lodging: "Hotel or Lodging",
  endurance_events: "Endurance Events",
  political_entities: "Political Entities",
  rv_parks: "RV Parks",
};

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New",
  reached_out: "Reached Out",
  in_communication: "In Contact",
  licensed: "Licensed",
  declined: "Declined",
};

export const SIGNAL_LABELS: Record<DiscoverySignal, string> = {
  pre_opening: "Pre-opening",
  recently_opened: "Recently opened",
};

// ---------------------------------------------------------------------------
// Pipeline — the scraper side of Soundling. Where leads come from
// (DataSource), when the scanner runs (ScheduleConfig), and what each run did
// (ScrapeRun). Like the lead types above, these mirror the future backend.
// ---------------------------------------------------------------------------

/**
 * - active: checked on every run
 * - paused: built, but switched off (e.g. the site changed and broke it)
 * - planned: on the roadmap, not built yet (e.g. state liquor-license feeds)
 */
export type SourceStatus = "active" | "paused" | "planned";

/** One pluggable connector the scanner pulls venues from. */
export interface DataSource {
  /** Stable machine id, e.g. "google_places". */
  id: string;
  /** Display name. Matches `SourceRecord.source` on the leads it finds. */
  name: string;
  /** One line on what this source looks for. */
  description: string;
  /** Which discovery tier its leads fall into. */
  signal: DiscoverySignal;
  status: SourceStatus;
  /** Where it has data, e.g. "Nationwide" or "California". */
  coverage: string;
  /** When it was last checked (ISO datetime). null if it never has been. */
  lastRunAt: string | null;
  /** How many leads it has contributed a source record to, all time. */
  leadsContributed: number;
}

export type ScheduleFrequency = "daily" | "weekly";

/** When the automated scan runs. A single record — there's one schedule. */
export interface ScheduleConfig {
  enabled: boolean;
  frequency: ScheduleFrequency;
  /** Local time of day, 24-hour "HH:MM", e.g. "05:00". */
  runAt: string;
  /** IANA timezone `runAt` is in, e.g. "America/Chicago". */
  timezone: string;
}

export type RunStatus = "running" | "success" | "partial" | "failed";
export type RunTrigger = "scheduled" | "manual";

/** How one source did within a single run. */
export interface SourceRunResult {
  sourceId: string;
  status: "success" | "failed";
  /** Venues this source returned — including ones we already had. */
  found: number;
  /** What went wrong, when status is "failed". */
  error: string | null;
}

/**
 * One execution of the scanner. `status` summarizes `sourceResults`:
 * all succeeded → success, some failed → partial, all failed → failed.
 */
export interface ScrapeRun {
  id: string;
  trigger: RunTrigger;
  status: RunStatus;
  startedAt: string;
  /** null while the run is still going. */
  finishedAt: string | null;
  /**
   * Brand-new leads this run created, AFTER deduplication. Deliberately not a
   * per-source number: if Yelp and Google both find the same new bar, that's
   * one new lead, not two.
   */
  newLeads: number;
  sourceResults: SourceRunResult[];
}

export const SOURCE_STATUS_LABELS: Record<SourceStatus, string> = {
  active: "Active",
  paused: "Paused",
  planned: "Planned",
};

export const RUN_STATUS_LABELS: Record<RunStatus, string> = {
  running: "Running",
  success: "Success",
  partial: "Partial",
  failed: "Failed",
};

export const RUN_TRIGGER_LABELS: Record<RunTrigger, string> = {
  scheduled: "Scheduled",
  manual: "Manual",
};

export const FREQUENCY_LABELS: Record<ScheduleFrequency, string> = {
  daily: "Every day",
  weekly: "Every week",
};
