"use client";

// The interactive leads table: search, type/status filters, a date-range
// filter, a sortable "Generated" column, and pagination. This is a Client
// Component ("use client") because it holds state that changes in the browser.
// It works over the array it's handed; when a real API exists, this same UI can
// send query params to the server instead.

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { StatusBadge } from "./StatusBadge";
import { formatDate } from "@/lib/format";
import {
  LEAD_STATUS_LABELS,
  SIGNAL_LABELS,
  VENUE_TYPE_LABELS,
  type Lead,
  type LeadStatus,
  type VenueType,
} from "@/lib/types";

const PAGE_SIZE = 20;

// Sortable columns. Type & status are *filtered* instead (you usually want
// "show me only New", not "order by status").
type SortDir = "asc" | "desc";
type SortKey = "signal" | "opened" | "generated" | "lastContact" | "sources";

// The direction a column starts in the first time you click it.
const DEFAULT_DIR: Record<SortKey, SortDir> = {
  signal: "asc",
  opened: "desc",
  generated: "desc", // newest first
  lastContact: "asc", // oldest contact first — surfaces stale follow-ups
  sources: "desc",
};

// The comparable value for a lead under a sort key. Returns null for "empty"
// values (never opened / never contacted), which always sort last.
function sortValue(lead: Lead, key: SortKey): string | number | null {
  switch (key) {
    case "signal":
      return lead.signal;
    case "opened":
      return lead.openedDate;
    case "generated":
      return lead.discoveredAt;
    case "lastContact":
      return lead.lastContactedAt;
    case "sources":
      return lead.sources.length;
  }
}

// --- component --------------------------------------------------------------

export default function LeadsTable({
  leads,
  view,
  onToggleArchived,
}: {
  leads: Lead[];
  view: "active" | "archived";
  onToggleArchived: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<VenueType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");
  const [fromDate, setFromDate] = useState(""); // "YYYY-MM-DD" or ""
  const [toDate, setToDate] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("generated");
  const [sortDir, setSortDir] = useState<SortDir>("desc"); // newest first
  const [page, setPage] = useState(1);

  // Whenever the filters/search/sort change, jump back to the first page —
  // staying on page 3 of a now-shorter list would be confusing.
  useEffect(() => {
    setPage(1);
  }, [query, typeFilter, statusFilter, fromDate, toDate, sortKey, sortDir, view]);

  // 1) FILTER, then 2) SORT. useMemo so this only recomputes when an input
  // actually changes, not on every unrelated re-render.
  const filteredSorted = useMemo(() => {
    const q = query.trim().toLowerCase();

    const filtered = leads.filter((lead) => {
      // Search: name or any part of the address.
      if (q) {
        const haystack =
          `${lead.name} ${lead.streetAddress} ${lead.city} ${lead.state} ${lead.postalCode}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      // Exact-match dropdown filters ("all" means no constraint).
      if (typeFilter !== "all" && lead.type !== typeFilter) return false;
      if (statusFilter !== "all" && lead.status !== statusFilter) return false;
      // Date-range filter on the generated date. ISO strings compare correctly
      // as plain strings, so we just compare the "YYYY-MM-DD" prefix.
      const generatedDay = lead.discoveredAt.slice(0, 10);
      if (fromDate && generatedDay < fromDate) return false;
      if (toDate && generatedDay > toDate) return false;
      return true;
    });

    const sorted = [...filtered].sort((a, b) => {
      const av = sortValue(a, sortKey);
      const bv = sortValue(b, sortKey);
      // Empty values (null) always sort last, regardless of direction.
      if (av === null && bv === null) return 0;
      if (av === null) return 1;
      if (bv === null) return -1;
      const cmp =
        typeof av === "number" && typeof bv === "number"
          ? av - bv
          : String(av).localeCompare(String(bv));
      return sortDir === "asc" ? cmp : -cmp;
    });

    return sorted;
  }, [leads, query, typeFilter, statusFilter, fromDate, toDate, sortKey, sortDir]);

  // 3) PAGINATE the filtered+sorted result.
  const totalPages = Math.max(1, Math.ceil(filteredSorted.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageRows = filteredSorted.slice(start, start + PAGE_SIZE);

  const hasActiveFilters =
    query || typeFilter !== "all" || statusFilter !== "all" || fromDate || toDate;

  const selectClass =
    "rounded-full border border-stone-300 bg-white px-4 py-2 text-sm focus:border-magenta-400 focus:ring-2 focus:ring-magenta-100 focus:outline-none";
  const labelClass = "text-xs font-medium text-stone-500";

  // Clicking a header: same column flips direction; a new column adopts its
  // default direction.
  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(DEFAULT_DIR[key]);
    }
  }

  function SortHeader({ label, sortKey: key }: { label: string; sortKey: SortKey }) {
    const active = key === sortKey;
    return (
      <th className="px-6 py-3.5">
        <button
          type="button"
          onClick={() => handleSort(key)}
          className="inline-flex items-center gap-1 whitespace-nowrap font-semibold uppercase tracking-wide text-stone-500 hover:text-magenta-700"
        >
          {label}
          {/* Always show the triangle so every sortable column is discoverable;
              it's faint until the column is the active sort. */}
          <span className={active ? "text-stone-500" : "text-stone-300"}>
            {active && sortDir === "asc" ? "▲" : "▼"}
          </span>
        </button>
      </th>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls: search + filters */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex w-full flex-col gap-1 sm:w-auto">
          <label className={labelClass}>Search</label>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Name or address"
            className="w-full rounded-full border border-stone-300 bg-white px-4 py-2 text-sm focus:border-magenta-400 focus:ring-2 focus:ring-magenta-100 focus:outline-none sm:w-64"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className={labelClass}>Type</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as VenueType | "all")}
            className={selectClass}
          >
            <option value="all">All types</option>
            {Object.entries(VENUE_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className={labelClass}>Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as LeadStatus | "all")}
            className={selectClass}
          >
            <option value="all">All statuses</option>
            {Object.entries(LEAD_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className={labelClass}>Generated from</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className={selectClass}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className={labelClass}>Generated to</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className={selectClass}
          />
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setTypeFilter("all");
              setStatusFilter("all");
              setFromDate("");
              setToDate("");
            }}
            className="rounded-full px-4 py-2 text-sm font-medium text-magenta-700 hover:bg-magenta-50"
          >
            Clear
          </button>
        )}
      </div>

      {/* Table — scrolls horizontally on small screens so it never breaks */}
      <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white">
        <table className="w-full min-w-[960px] divide-y divide-stone-200 text-sm">
          <thead className="bg-stone-50 text-left text-xs font-semibold uppercase tracking-wide text-stone-500">
            <tr>
              <th className="px-6 py-3.5">Venue</th>
              <th className="px-6 py-3.5">Type</th>
              <SortHeader label="Signal" sortKey="signal" />
              <SortHeader label="Opened" sortKey="opened" />
              <SortHeader label="Generated" sortKey="generated" />
              <SortHeader label="Last Contact" sortKey="lastContact" />
              <SortHeader label="Sources" sortKey="sources" />
              <th className="px-6 py-3.5">Status</th>
              <th className="px-6 py-3.5">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {pageRows.map((lead) => (
              <tr key={lead.id} className="hover:bg-stone-50/70">
                {/* "Stretched link": the name's ::after overlay covers this whole
                    (relative) cell, so the name + address are one click target
                    without making the row clickable over the status controls. */}
                <td className="group relative cursor-pointer px-6 py-4">
                  <Link
                    href={`/dashboard/leads/${lead.id}`}
                    className="font-semibold text-plum-600 after:absolute after:inset-0 group-hover:text-magenta-700 group-hover:underline"
                  >
                    {lead.name}
                  </Link>
                  <div className="text-stone-500">
                    {lead.streetAddress}, {lead.city}, {lead.state}{" "}
                    {lead.postalCode}
                  </div>
                </td>
                <td className="px-6 py-4 text-stone-600">
                  {VENUE_TYPE_LABELS[lead.type]}
                </td>
                <td className="px-6 py-4 text-stone-600">
                  {SIGNAL_LABELS[lead.signal]}
                </td>
                <td className="px-6 py-4 text-stone-600">
                  {formatDate(lead.openedDate)}
                </td>
                <td className="px-6 py-4 text-stone-600">
                  {formatDate(lead.discoveredAt)}
                </td>
                <td className="px-6 py-4 text-stone-600">
                  {lead.lastContactedAt
                    ? formatDate(lead.lastContactedAt)
                    : "N/A"}
                </td>
                <td className="px-6 py-4 text-stone-600">{lead.sources.length}</td>
                <td className="px-6 py-4">
                  <StatusBadge status={lead.status} />
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    type="button"
                    onClick={() => onToggleArchived(lead.id)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium ${
                      view === "active"
                        ? "border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50"
                        : "border-green-200 text-green-700 hover:border-green-300 hover:bg-green-50"
                    }`}
                  >
                    {view === "active" ? "Archive" : "Restore"}
                  </button>
                </td>
              </tr>
            ))}
            {pageRows.length === 0 && (
              <tr>
                <td colSpan={9} className="px-6 py-12 text-center text-stone-500">
                  {view === "archived"
                    ? "No archived leads match your filters."
                    : "No leads match your filters."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination footer */}
      <div className="flex flex-col gap-3 text-sm text-stone-600 sm:flex-row sm:items-center sm:justify-between">
        <span>
          {filteredSorted.length === 0
            ? "No results"
            : `Showing ${start + 1}–${start + pageRows.length} of ${filteredSorted.length}`}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            className="rounded-full border border-stone-300 px-4 py-1.5 font-medium disabled:cursor-not-allowed disabled:opacity-40 hover:bg-stone-50"
          >
            Previous
          </button>
          <span className="text-stone-500">
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className="rounded-full border border-stone-300 px-4 py-1.5 font-medium disabled:cursor-not-allowed disabled:opacity-40 hover:bg-stone-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
