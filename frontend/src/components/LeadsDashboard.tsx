"use client";

// Owns the dashboard's live, interactive state: which leads are archived and
// whether we're viewing the "active" or "archived" pool. The stats bar lives
// here (not on the server) because its tallies depend on that live state. The
// actual table — search/filter/sort/pagination — is delegated to LeadsTable,
// which is reused unchanged for both views.

import { useMemo, useState } from "react";
import LeadsTable from "./LeadsTable";
import { LEAD_STATUS_LABELS, type Lead, type LeadStatus } from "@/lib/types";

type View = "active" | "archived";

export default function LeadsDashboard({ leads }: { leads: Lead[] }) {
  // Track archived leads by id in a Set: a cheap membership check, and it maps
  // cleanly onto a future `PATCH /leads/:id { archived }` call. Seeded from the
  // leads that arrive already archived.
  const [archivedIds, setArchivedIds] = useState<Set<string>>(
    () => new Set(leads.filter((l) => l.archived).map((l) => l.id)),
  );
  const [view, setView] = useState<View>("active");

  function toggleArchived(id: string) {
    setArchivedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // The leads visible in the current view: archived membership must match the
  // view we're in.
  const visibleLeads = useMemo(
    () =>
      leads.filter((lead) => archivedIds.has(lead.id) === (view === "archived")),
    [leads, archivedIds, view],
  );

  const archivedCount = archivedIds.size;
  const activeCount = leads.length - archivedCount;

  // Stats over the *visible* pool only — archived leads never count toward the
  // active tallies, and vice versa. Built from the status label map so new
  // statuses appear automatically.
  const stats = [
    {
      label: view === "archived" ? "Archived leads" : "Total leads",
      value: visibleLeads.length,
    },
    ...(Object.keys(LEAD_STATUS_LABELS) as LeadStatus[]).map((status) => ({
      label: LEAD_STATUS_LABELS[status],
      value: visibleLeads.filter((l) => l.status === status).length,
    })),
  ];

  return (
    <div className="space-y-6">
      {/* Stats bar + view toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap items-center rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm">
          {stats.map((stat, i) => (
            <span
              key={stat.label}
              className={
                i > 0
                  ? "ml-4 border-l border-gray-200 pl-4 text-gray-600"
                  : "text-gray-600"
              }
            >
              {stat.label}:{" "}
              <span className="font-semibold text-gray-900">{stat.value}</span>
            </span>
          ))}
        </div>

        {view === "active" ? (
          <button
            type="button"
            onClick={() => setView("archived")}
            className="shrink-0 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          >
            View archived ({archivedCount}) →
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setView("active")}
            className="shrink-0 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          >
            ← Active leads ({activeCount})
          </button>
        )}
      </div>

      {/* Heading clarifies which pool you're looking at */}
      {view === "archived" && (
        <p className="text-sm text-gray-500">
          Showing archived leads. These don&apos;t count toward the active
          dashboard.
        </p>
      )}

      <LeadsTable
        leads={visibleLeads}
        view={view}
        onToggleArchived={toggleArchived}
      />
    </div>
  );
}
