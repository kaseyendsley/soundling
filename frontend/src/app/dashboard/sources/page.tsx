// Sources: WHERE leads come from — one row per pluggable connector, grouped by
// discovery tier. A read-only Server Component, like the Schedule page.

import Card from "@/components/Card";
import PageTitle from "@/components/PageTitle";
import Pill, { type PillTone } from "@/components/Pill";
import SampleDataNote from "@/components/SampleDataNote";
import { formatDateTime } from "@/lib/format";
import { getSchedule, getSources } from "@/lib/pipelineStore";
import {
  SOURCE_STATUS_LABELS,
  type DataSource,
  type DiscoverySignal,
  type SourceStatus,
} from "@/lib/types";

const SOURCE_STATUS_TONES: Record<SourceStatus, PillTone> = {
  active: "emerald",
  paused: "amber",
  planned: "stone",
};

// One card per discovery tier, in priority order (see PROJECT_CONTEXT).
const GROUPS: { signal: DiscoverySignal; title: string; description: string }[] = [
  {
    signal: "recently_opened",
    title: "Recently opened",
    description: "Venues that opened in the last ~90 days. The most reliable data.",
  },
  {
    signal: "pre_opening",
    title: "Pre-opening signals",
    description: "Permits and license applications filed before a venue opens. The earliest possible lead.",
  },
];

function SourceRow({ source, timeZone }: { source: DataSource; timeZone: string }) {
  return (
    <li className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-accent">{source.name}</span>
          <Pill tone={SOURCE_STATUS_TONES[source.status]}>
            {SOURCE_STATUS_LABELS[source.status]}
          </Pill>
        </div>
        <p className="mt-0.5 text-sm text-muted">{source.description}</p>
      </div>
      <dl className="grid shrink-0 grid-cols-3 gap-4 text-sm lg:w-[28rem]">
        <div>
          <dt className="text-xs text-muted">Coverage</dt>
          <dd className="mt-0.5 text-ink">{source.coverage}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted">Last run</dt>
          <dd className="mt-0.5 text-ink">
            {source.lastRunAt ? formatDateTime(source.lastRunAt, timeZone) : "Never"}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted">Leads</dt>
          <dd className="mt-0.5 text-ink">{source.leadsContributed}</dd>
        </div>
      </dl>
    </li>
  );
}

export default async function SourcesPage() {
  const [sources, schedule] = await Promise.all([getSources(), getSchedule()]);

  return (
    <div className="space-y-6">
      <PageTitle title="Sources" />
      <SampleDataNote>Preview: sample sources until the scraper is live</SampleDataNote>

      {GROUPS.map((group) => {
        const inGroup = sources.filter((s) => s.signal === group.signal);
        return (
          <Card
            key={group.signal}
            title={`${group.title} (${inGroup.length})`}
            description={group.description}
          >
            <ul className="divide-y divide-line-subtle">
              {inGroup.map((source) => (
                <SourceRow key={source.id} source={source} timeZone={schedule.timezone} />
              ))}
            </ul>
          </Card>
        );
      })}
    </div>
  );
}
