"use client";

// Owns the dashboard's live, interactive state: which leads are archived and
// whether we're viewing the "active" or "archived" pool. The stats bar lives
// here (not on the server) because its tallies depend on that live state. The
// actual table — search/filter/sort/pagination — is delegated to LeadsTable,
// which is reused unchanged for both views.

import { useEffect, useMemo, useState } from "react";
import LeadsTable from "./LeadsTable";
import { useDashboardHeader } from "./DashboardHeaderContext";
import { getAllLeads } from "@/lib/leadsStore";
import { MOCK_LEADS } from "@/lib/mock-leads";
import { LEAD_STATUS_LABELS, type Lead, type LeadStatus } from "@/lib/types";

type View = "active" | "archived";

export default function LeadsDashboard() {
  // Seed with the mock leads for a deterministic server render, then load the
  // full set (incl. localStorage-added leads) once mounted in the browser.
  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS);
  // Track archived leads by id in a Set: a cheap membership check that maps
  // cleanly onto a future `PATCH /leads/:id { archived }` call.
  const [archivedIds, setArchivedIds] = useState<Set<string>>(
    () => new Set(MOCK_LEADS.filter((l) => l.archived).map((l) => l.id)),
  );
  const [view, setView] = useState<View>("active");
  const { setTitle } = useDashboardHeader();

  useEffect(() => {
    const all = getAllLeads();
    setLeads(all);
    setArchivedIds(new Set(all.filter((l) => l.archived).map((l) => l.id)));
  }, []);

  // Reflect the current view in the topbar title; reset to "Leads" on leave.
  useEffect(() => {
    setTitle(view === "archived" ? "Archived Leads" : "Active Leads");
    return () => setTitle("Active Leads");
  }, [view, setTitle]);

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
      label: view === "archived" ? "Total Archived Leads" : "Total Leads",
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
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center justify-between gap-x-5 gap-y-1 rounded-2xl border border-line bg-surface px-6 py-3 text-center text-sm">
          {stats.map((stat) => (
            <span key={stat.label} className="text-muted">
              {stat.label}:{" "}
              <span className="font-semibold text-accent">{stat.value}</span>
            </span>
          ))}
        </div>

        {view === "active" ? (
          <button
            type="button"
            onClick={() => setView("archived")}
            className="shrink-0 rounded-full border border-line-strong bg-surface px-4 py-2 text-sm font-medium text-ink-soft hover:border-magenta-300 hover:text-link"
          >
            Archived Leads ({archivedCount}) →
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setView("active")}
            className="shrink-0 rounded-full border border-line-strong bg-surface px-4 py-2 text-sm font-medium text-ink-soft hover:border-magenta-300 hover:text-link"
          >
            ← Active Leads ({activeCount})
          </button>
        )}
      </div>

      <LeadsTable
        leads={visibleLeads}
        view={view}
        onToggleArchived={toggleArchived}
      />
    </div>
  );
}
