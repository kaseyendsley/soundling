// Schedule: WHEN the scanner runs, and how each run went. A Server Component —
// it only displays data, so it renders on the server and ships no JavaScript
// of its own (PageTitle is the one small client piece).
//
// Read-only for now: the schedule is shown as text and "Run now" is disabled.
// Once the scraper exists, the schedule card becomes a form and Run now works.

import Card from "@/components/Card";
import PageTitle from "@/components/PageTitle";
import Pill, { type PillTone } from "@/components/Pill";
import SampleDataNote from "@/components/SampleDataNote";
import {
  formatDateTime,
  formatDuration,
  formatTimeOfDay,
  formatTimeZone,
} from "@/lib/format";
import { getRuns, getSchedule, getSources } from "@/lib/pipelineStore";
import {
  FREQUENCY_LABELS,
  RUN_STATUS_LABELS,
  RUN_TRIGGER_LABELS,
  type RunStatus,
} from "@/lib/types";

const RUN_STATUS_TONES: Record<RunStatus, PillTone> = {
  running: "violet",
  success: "emerald",
  partial: "amber",
  failed: "red",
};

const DAY_MS = 24 * 60 * 60 * 1000;

export default async function SchedulePage() {
  // Fetch all three at once rather than one after another.
  const [schedule, runs, sources] = await Promise.all([
    getSchedule(),
    getRuns(),
    getSources(),
  ]);

  // Look up a source's display name from the id stored on each run result.
  const sourceName = new Map(sources.map((s) => [s.id, s.name]));

  // Next run ≈ last scheduled run + one interval. Good enough for sample data;
  // the real backend will report its own next run time.
  const lastScheduled = runs.find((run) => run.trigger === "scheduled");
  const interval = schedule.frequency === "daily" ? DAY_MS : 7 * DAY_MS;
  const nextRunAt =
    schedule.enabled && lastScheduled
      ? new Date(Date.parse(lastScheduled.startedAt) + interval).toISOString()
      : null;

  return (
    <div className="space-y-6">
      <PageTitle title="Schedule" />
      <SampleDataNote>Preview: sample runs until the scraper is live</SampleDataNote>

      <Card
        title="Scan schedule"
        description="Soundling checks every active source automatically, so new leads are waiting each morning."
        action={
          <button
            type="button"
            disabled
            title="Available once the scraper is live"
            className="rounded-full bg-magenta-600 px-5 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Run now
          </button>
        }
      >
        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-muted">Status</dt>
            <dd className="mt-1">
              <Pill tone={schedule.enabled ? "emerald" : "stone"}>
                {schedule.enabled ? "On" : "Off"}
              </Pill>
            </dd>
          </div>
          <div>
            <dt className="text-muted">Frequency</dt>
            <dd className="mt-1 text-ink">{FREQUENCY_LABELS[schedule.frequency]}</dd>
          </div>
          <div>
            <dt className="text-muted">Time</dt>
            <dd className="mt-1 text-ink">
              {formatTimeOfDay(schedule.runAt)} {formatTimeZone(schedule.timezone)}
            </dd>
          </div>
          <div>
            <dt className="text-muted">Next run</dt>
            <dd className="mt-1 text-ink">
              {formatDateTime(nextRunAt, schedule.timezone)}
            </dd>
          </div>
        </dl>
      </Card>

      <Card
        title={`Run history (${runs.length})`}
        description="Newest first. Partial means some sources failed, but the rest still ran."
      >
        {/* -mx-6 lets the table run edge to edge inside the card's padding;
            it scrolls sideways on small screens like the leads table. */}
        <div className="-mx-6 overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-y border-line bg-surface-muted text-left text-xs font-semibold uppercase tracking-wide text-muted">
              <tr>
                <th className="px-6 py-3">Started</th>
                <th className="px-6 py-3">Trigger</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Sources</th>
                <th className="px-6 py-3">New leads</th>
                <th className="px-6 py-3">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-subtle">
              {runs.map((run) => {
                const failures = run.sourceResults.filter((r) => r.status === "failed");
                const succeeded = run.sourceResults.length - failures.length;
                return (
                  <tr key={run.id} className="align-top">
                    <td className="whitespace-nowrap px-6 py-4 text-ink">
                      {formatDateTime(run.startedAt, schedule.timezone)}
                    </td>
                    <td className="px-6 py-4 text-ink-soft">
                      {RUN_TRIGGER_LABELS[run.trigger]}
                    </td>
                    <td className="px-6 py-4">
                      <Pill tone={RUN_STATUS_TONES[run.status]}>
                        {RUN_STATUS_LABELS[run.status]}
                      </Pill>
                      {/* Say WHAT failed, so a bad morning is easy to diagnose */}
                      {failures.length > 0 && (
                        <ul className="mt-2 space-y-0.5 text-xs text-muted">
                          {failures.map((f) => (
                            <li key={f.sourceId}>
                              <span className="font-medium text-ink-soft">
                                {sourceName.get(f.sourceId) ?? f.sourceId}:
                              </span>{" "}
                              {f.error}
                            </li>
                          ))}
                        </ul>
                      )}
                    </td>
                    <td className="px-6 py-4 text-ink-soft">
                      {succeeded} of {run.sourceResults.length} ok
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={
                          run.newLeads > 0 ? "font-semibold text-accent" : "text-faint"
                        }
                      >
                        {run.newLeads}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-ink-soft">
                      {formatDuration(run.startedAt, run.finishedAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
