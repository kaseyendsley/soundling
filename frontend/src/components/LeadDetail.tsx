"use client";

// Renders everything we know about one lead. A Client Component because it
// reads from the leads store (which includes localStorage-added leads the
// server can't see). It seeds from the mock leads for a clean first paint, then
// loads the full set on mount.

import Link from "next/link";
import { useEffect, useState } from "react";
import NoteEditor from "./NoteEditor";
import StatusControl from "./StatusControl";
import { StatusBadge } from "./StatusBadge";
import { formatDate } from "@/lib/format";
import { getLead } from "@/lib/leadsStore";
import { MOCK_LEADS } from "@/lib/mock-leads";
import {
  LEAD_STATUS_LABELS,
  SIGNAL_LABELS,
  VENUE_TYPE_LABELS,
  type Lead,
} from "@/lib/types";

// A labelled card section, reused for each block on the page.
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-6">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-stone-500">
        {title}
      </h2>
      {children}
    </section>
  );
}

function BackLink() {
  return (
    <Link
      href="/dashboard"
      className="inline-flex items-center text-sm text-stone-500 hover:text-ink"
    >
      ← Back to leads
    </Link>
  );
}

export default function LeadDetail({ id }: { id: string }) {
  // Seed from the mock leads (deterministic on server + first client paint),
  // then load the full set including any localStorage-added lead.
  const [lead, setLead] = useState<Lead | undefined>(() =>
    MOCK_LEADS.find((l) => l.id === id),
  );
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLead(getLead(id));
    setLoaded(true);
  }, [id]);

  if (!lead) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <BackLink />
        <p className="text-sm text-stone-500">
          {loaded ? "Lead not found." : "Loading…"}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <BackLink />

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl tracking-wide text-ink">
            {lead.name}
          </h1>
          <p className="mt-1 text-stone-500">
            {lead.streetAddress}, {lead.city}, {lead.state} {lead.postalCode}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {lead.archived && (
            <span className="inline-flex items-center rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-600 ring-1 ring-inset ring-stone-500/20">
              Archived
            </span>
          )}
          <StatusBadge status={lead.status} />
        </div>
      </div>

      {/* Overview */}
      <Section title="Overview">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-stone-500">Type</dt>
            <dd className="mt-1 text-ink">{VENUE_TYPE_LABELS[lead.type]}</dd>
          </div>
          <div>
            <dt className="text-stone-500">Signal</dt>
            <dd className="mt-1 text-ink">{SIGNAL_LABELS[lead.signal]}</dd>
          </div>
          <div>
            <dt className="text-stone-500">Opened</dt>
            <dd className="mt-1 text-ink">{formatDate(lead.openedDate)}</dd>
          </div>
          <div>
            <dt className="text-stone-500">Generated</dt>
            <dd className="mt-1 text-ink">{formatDate(lead.discoveredAt)}</dd>
          </div>
          <div>
            <dt className="text-stone-500">Last contact</dt>
            <dd className="mt-1 text-ink">
              {lead.lastContactedAt ? formatDate(lead.lastContactedAt) : "N/A"}
            </dd>
          </div>
        </dl>
      </Section>

      {/* Venue notes first — surfaced above status so important info is seen first */}
      <Section title="Venue Notes">
        <NoteEditor initialNote={lead.note} />
      </Section>

      {/* Status management (change status + record a note about the change) */}
      <Section title="Status">
        <StatusControl currentStatus={lead.status} />
      </Section>

      {/* Contacts */}
      <Section title={`Contacts (${lead.contacts.length})`}>
        {lead.contacts.length === 0 ? (
          <p className="text-sm text-stone-400">No contacts found yet.</p>
        ) : (
          <ul className="divide-y divide-stone-100">
            {lead.contacts.map((contact) => (
              <li key={contact.id} className="py-3 first:pt-0 last:pb-0">
                <div className="font-medium text-ink">
                  {contact.name}
                  {contact.role && (
                    <span className="ml-2 text-sm font-normal text-stone-500">
                      {contact.role}
                    </span>
                  )}
                </div>
                <div className="mt-1 flex flex-wrap gap-x-6 gap-y-1 text-sm text-stone-600">
                  {contact.phone ? (
                    <a
                      href={`tel:${contact.phone}`}
                      className="hover:text-ink hover:underline"
                    >
                      {contact.phone}
                    </a>
                  ) : (
                    <span className="text-stone-400">No phone</span>
                  )}
                  {contact.email ? (
                    <a
                      href={`mailto:${contact.email}`}
                      className="hover:text-ink hover:underline"
                    >
                      {contact.email}
                    </a>
                  ) : (
                    <span className="text-stone-400">No email</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* Sources — the audit trail */}
      <Section title={`Sources (${lead.sources.length})`}>
        <ul className="divide-y divide-stone-100">
          {lead.sources.map((source) => (
            <li
              key={source.id}
              className="flex items-center justify-between py-3 text-sm first:pt-0 last:pb-0"
            >
              <div>
                <div className="font-medium text-ink">{source.source}</div>
                <div className="text-stone-500">
                  Found {formatDate(source.discoveredAt)}
                </div>
              </div>
              {source.url && (
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-magenta-700 hover:underline"
                >
                  View source →
                </a>
              )}
            </li>
          ))}
        </ul>
      </Section>

      {/* Status timeline */}
      <Section title="Status history">
        <ol className="space-y-4">
          {lead.statusHistory.map((change) => (
            <li key={change.id} className="text-sm">
              <div className="text-ink">
                {change.fromStatus
                  ? `${LEAD_STATUS_LABELS[change.fromStatus]} → ${LEAD_STATUS_LABELS[change.toStatus]}`
                  : `Discovered as ${LEAD_STATUS_LABELS[change.toStatus]}`}
              </div>
              <div className="mt-0.5 text-stone-500">
                {change.changedBy ?? "System"} · {formatDate(change.changedAt)}
              </div>
              {change.note && (
                <p className="mt-1 text-stone-600">{change.note}</p>
              )}
            </li>
          ))}
        </ol>
      </Section>
    </div>
  );
}
