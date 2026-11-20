import { MOCK_LEADS } from "./mock-leads";
import type {
  DataSource,
  RunStatus,
  RunTrigger,
  ScheduleConfig,
  ScrapeRun,
} from "./types";

// Sample scraper data for the Schedule and Sources pages, until the real
// scanner exists. Typed against the real models, like mock-leads.ts.
//
// The run history tells a small story so every state shows up on screen:
// - Oct 30: the whole run failed (network outage)
// - Nov 3: Eventbrite was rate-limited → a "partial" run
// - Nov 6: a manual run in the afternoon
// - Nov 7: Local News broke (the site changed its layout); it was paused the
//   next day, so later runs don't include it

export const MOCK_SCHEDULE: ScheduleConfig = {
  enabled: true,
  frequency: "daily",
  runAt: "05:00",
  timezone: "America/Chicago",
};

// --- Runs --------------------------------------------------------------------

const ALL_SCRAPERS = [
  "google_places",
  "yelp",
  "eventbrite",
  "local_news",
  "public_permit_filing",
];
const WITHOUT_LOCAL_NEWS = ALL_SCRAPERS.filter((id) => id !== "local_news");

// Roughly how many venues each source returns per run (varied a little below).
const TYPICAL_FOUND: Record<string, number> = {
  google_places: 42,
  yelp: 27,
  eventbrite: 11,
  local_news: 4,
  public_permit_filing: 6,
};

/** The hand-written parts of a run; buildRun() fills in the rest. */
type RunSeed = {
  id: string;
  startedAt: string;
  durationSec: number;
  newLeads: number;
  sources: string[];
  trigger?: RunTrigger;
  /** sourceId → error message, for sources that failed this run. */
  failures?: Record<string, string>;
};

function buildRun(seed: RunSeed, index: number): ScrapeRun {
  const sourceResults = seed.sources.map((sourceId, i) => {
    const error = seed.failures?.[sourceId] ?? null;
    return {
      sourceId,
      status: error ? ("failed" as const) : ("success" as const),
      // Deterministic wobble so the numbers aren't all identical.
      found: error ? 0 : TYPICAL_FOUND[sourceId] + ((index * 3 + i) % 5),
      error,
    };
  });

  // The run's status summarizes its sources (see ScrapeRun in types.ts).
  const failed = sourceResults.filter((r) => r.status === "failed").length;
  const status: RunStatus =
    failed === 0 ? "success" : failed === sourceResults.length ? "failed" : "partial";

  return {
    id: seed.id,
    trigger: seed.trigger ?? "scheduled",
    status,
    startedAt: seed.startedAt,
    finishedAt: new Date(
      Date.parse(seed.startedAt) + seed.durationSec * 1000,
    ).toISOString(),
    newLeads: seed.newLeads,
    sourceResults,
  };
}

const NETWORK_DOWN = Object.fromEntries(
  ALL_SCRAPERS.map((id) => [id, "Network unreachable"]),
);

// Newest first. 5:00 AM Central is 11:00 UTC after daylight saving ended
// (Nov 1), and 10:00 UTC before it.
const RUN_SEEDS: RunSeed[] = [
  { id: "run-1110", startedAt: "2026-11-10T11:00:00Z", durationSec: 252, newLeads: 3, sources: WITHOUT_LOCAL_NEWS },
  { id: "run-1109", startedAt: "2026-11-09T11:00:00Z", durationSec: 238, newLeads: 5, sources: WITHOUT_LOCAL_NEWS },
  { id: "run-1108", startedAt: "2026-11-08T11:00:00Z", durationSec: 261, newLeads: 2, sources: WITHOUT_LOCAL_NEWS },
  {
    id: "run-1107", startedAt: "2026-11-07T11:00:00Z", durationSec: 297, newLeads: 4, sources: ALL_SCRAPERS,
    failures: { local_news: "Couldn't find the article list — page layout changed?" },
  },
  { id: "run-1106b", startedAt: "2026-11-06T20:30:00Z", durationSec: 244, newLeads: 1, sources: ALL_SCRAPERS, trigger: "manual" },
  { id: "run-1106", startedAt: "2026-11-06T11:00:00Z", durationSec: 275, newLeads: 6, sources: ALL_SCRAPERS },
  { id: "run-1105", startedAt: "2026-11-05T11:00:00Z", durationSec: 268, newLeads: 2, sources: ALL_SCRAPERS },
  { id: "run-1104", startedAt: "2026-11-04T11:00:00Z", durationSec: 281, newLeads: 7, sources: ALL_SCRAPERS },
  {
    id: "run-1103", startedAt: "2026-11-03T11:00:00Z", durationSec: 233, newLeads: 3, sources: ALL_SCRAPERS,
    failures: { eventbrite: "Rate limited (HTTP 429) — too many requests" },
  },
  { id: "run-1102", startedAt: "2026-11-02T11:00:00Z", durationSec: 270, newLeads: 0, sources: ALL_SCRAPERS },
  { id: "run-1101", startedAt: "2026-11-01T11:00:00Z", durationSec: 259, newLeads: 4, sources: ALL_SCRAPERS },
  { id: "run-1031", startedAt: "2026-10-31T10:00:00Z", durationSec: 266, newLeads: 5, sources: ALL_SCRAPERS },
  { id: "run-1030", startedAt: "2026-10-30T10:00:00Z", durationSec: 31, newLeads: 0, sources: ALL_SCRAPERS, failures: NETWORK_DOWN },
  { id: "run-1029", startedAt: "2026-10-29T10:00:00Z", durationSec: 272, newLeads: 3, sources: ALL_SCRAPERS },
  { id: "run-1028", startedAt: "2026-10-28T10:00:00Z", durationSec: 255, newLeads: 2, sources: ALL_SCRAPERS },
];

export const MOCK_RUNS: ScrapeRun[] = RUN_SEEDS.map(buildRun);

// --- Sources -----------------------------------------------------------------

/** The hand-written parts of a source; the two stats are derived below. */
type SourceSeed = Omit<DataSource, "lastRunAt" | "leadsContributed">;

const SOURCE_SEEDS: SourceSeed[] = [
  {
    id: "google_places",
    name: "Google Places",
    description: "Newly listed bars, restaurants and venues on Google Maps.",
    signal: "recently_opened",
    status: "active",
    coverage: "Nationwide",
  },
  {
    id: "yelp",
    name: "Yelp",
    description: "New business pages, with live music and nightlife tags.",
    signal: "recently_opened",
    status: "active",
    coverage: "Nationwide",
  },
  {
    id: "eventbrite",
    name: "Eventbrite",
    description: "Venues hosting live music, DJ and karaoke events.",
    signal: "recently_opened",
    status: "active",
    coverage: "Nationwide",
  },
  {
    id: "local_news",
    name: "Local News",
    description: "Openings covered by city news and food sites.",
    signal: "recently_opened",
    status: "paused",
    coverage: "Top 25 metros",
  },
  {
    id: "public_permit_filing",
    name: "Public Permit Filing",
    description: "Building and business permits for future venues.",
    signal: "pre_opening",
    status: "active",
    coverage: "Austin, Denver, San Diego",
  },
  {
    id: "ca_abc",
    name: "California ABC",
    description: "New liquor license applications, statewide.",
    signal: "pre_opening",
    status: "planned",
    coverage: "California",
  },
  {
    id: "tx_tabc",
    name: "Texas TABC",
    description: "New liquor license applications, statewide.",
    signal: "pre_opening",
    status: "planned",
    coverage: "Texas",
  },
  {
    id: "wa_lcb",
    name: "Washington LCB",
    description: "New liquor license applications, statewide.",
    signal: "pre_opening",
    status: "planned",
    coverage: "Washington",
  },
];

// Derive the stats from the other mock data, so the Sources page always agrees
// with the run history and the leads dashboard.
export const MOCK_SOURCES: DataSource[] = SOURCE_SEEDS.map((seed) => ({
  ...seed,
  // MOCK_RUNS is newest first, so the first run that included it is the latest.
  lastRunAt:
    MOCK_RUNS.find((run) => run.sourceResults.some((r) => r.sourceId === seed.id))
      ?.startedAt ?? null,
  leadsContributed: MOCK_LEADS.filter((lead) =>
    lead.sources.some((s) => s.source === seed.name),
  ).length,
}));
