// Lead detail page at /dashboard/leads/[id]. A Server Component: it looks the
// lead up by id and renders everything we know about it. The only interactive
// piece is the embedded <NoteEditor> Client Component.

import Link from "next/link";
import { notFound } from "next/navigation";
import NoteEditor from "@/components/NoteEditor";
import StatusControl from "@/components/StatusControl";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDate } from "@/lib/format";
import { MOCK_LEADS } from "@/lib/mock-leads";
import {
  LEAD_STATUS_LABELS,
  SIGNAL_LABELS,
  VENUE_TYPE_LABELS,
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
    <section className="rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
        {title}
      </h2>
      {children}
    </section>
  );
}

// In Next 15 route params are async, so this page is an async component.
export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lead = MOCK_LEADS.find((l) => l.id === id);

  // No matching lead → render the framework's 404 page.
  if (!lead) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Back link */}
      <Link
        href="/dashboard"
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900"
      >
        ← Back to leads
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{lead.name}</h1>
          <p className="mt-1 text-gray-500">
            {lead.streetAddress}, {lead.city}, {lead.state} {lead.postalCode}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {lead.archived && (
            <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/20">
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
            <dt className="text-gray-500">Type</dt>
            <dd className="mt-1 text-gray-900">{VENUE_TYPE_LABELS[lead.type]}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Signal</dt>
            <dd className="mt-1 text-gray-900">{SIGNAL_LABELS[lead.signal]}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Opened</dt>
            <dd className="mt-1 text-gray-900">{formatDate(lead.openedDate)}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Generated</dt>
            <dd className="mt-1 text-gray-900">
              {formatDate(lead.discoveredAt)}
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
          <p className="text-sm text-gray-400">No contacts found yet.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {lead.contacts.map((contact) => (
              <li key={contact.id} className="py-3 first:pt-0 last:pb-0">
                <div className="font-medium text-gray-900">
                  {contact.name}
                  {contact.role && (
                    <span className="ml-2 text-sm font-normal text-gray-500">
                      {contact.role}
                    </span>
                  )}
                </div>
                <div className="mt-1 flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-600">
                  {contact.phone ? (
                    <a
                      href={`tel:${contact.phone}`}
                      className="hover:text-gray-900 hover:underline"
                    >
                      {contact.phone}
                    </a>
                  ) : (
                    <span className="text-gray-400">No phone</span>
                  )}
                  {contact.email ? (
                    <a
                      href={`mailto:${contact.email}`}
                      className="hover:text-gray-900 hover:underline"
                    >
                      {contact.email}
                    </a>
                  ) : (
                    <span className="text-gray-400">No email</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* Sources — the audit trail */}
      <Section title={`Sources (${lead.sources.length})`}>
        <ul className="divide-y divide-gray-100">
          {lead.sources.map((source) => (
            <li
              key={source.id}
              className="flex items-center justify-between py-3 text-sm first:pt-0 last:pb-0"
            >
              <div>
                <div className="font-medium text-gray-900">{source.source}</div>
                <div className="text-gray-500">
                  Found {formatDate(source.discoveredAt)}
                </div>
              </div>
              {source.url && (
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-700 hover:underline"
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
              <div className="text-gray-900">
                {change.fromStatus
                  ? `${LEAD_STATUS_LABELS[change.fromStatus]} → ${LEAD_STATUS_LABELS[change.toStatus]}`
                  : `Discovered as ${LEAD_STATUS_LABELS[change.toStatus]}`}
              </div>
              <div className="mt-0.5 text-gray-500">
                {change.changedBy ?? "System"} · {formatDate(change.changedAt)}
              </div>
              {change.note && (
                <p className="mt-1 text-gray-600">{change.note}</p>
              )}
            </li>
          ))}
        </ol>
      </Section>
    </div>
  );
}
