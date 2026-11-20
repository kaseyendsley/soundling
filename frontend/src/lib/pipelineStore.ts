// The data seam for the scraper pipeline (sources, schedule, run history) —
// the same idea as leadsStore.ts: pages read through these functions only, so
// swapping the mock data for API calls later touches just this file.
//
// They're `async` already, even though the mock data is instant. A real API
// call is async, so making callers `await` now means none of them change when
// the backend arrives.

import { MOCK_RUNS, MOCK_SCHEDULE, MOCK_SOURCES } from "./mock-pipeline";
import type { DataSource, ScheduleConfig, ScrapeRun } from "./types";

/** Every data source, in display order. */
export async function getSources(): Promise<DataSource[]> {
  return MOCK_SOURCES;
}

/** The automated scan schedule. */
export async function getSchedule(): Promise<ScheduleConfig> {
  return MOCK_SCHEDULE;
}

/** Scanner runs, newest first. */
export async function getRuns(): Promise<ScrapeRun[]> {
  return MOCK_RUNS;
}
