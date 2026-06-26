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

// Only the generated date is *sorted*; type and status are *filtered* instead
// (you usually want "show me only New", not "order by status").
type SortDir = "asc" | "desc";

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
  const [sortDir, setSortDir] = useState<SortDir>("desc"); // newest first
  const [page, setPage] = useState(1);

  // Whenever the filters/search/sort change, jump back to the first page —
  // staying on page 3 of a now-shorter list would be confusing.
  useEffect(() => {
    setPage(1);
  }, [query, typeFilter, statusFilter, fromDate, toDate, sortDir, view]);

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
      const cmp = a.discoveredAt.localeCompare(b.discoveredAt);
      return sortDir === "asc" ? cmp : -cmp;
    });

    return sorted;
  }, [leads, query, typeFilter, statusFilter, fromDate, toDate, sortDir]);

  // 3) PAGINATE the filtered+sorted result.
  const totalPages = Math.max(1, Math.ceil(filteredSorted.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageRows = filteredSorted.slice(start, start + PAGE_SIZE);

  const hasActiveFilters =
    query || typeFilter !== "all" || statusFilter !== "all" || fromDate || toDate;

  const selectClass =
    "rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none";

  return (
    <div className="space-y-4">
      {/* Controls: search + filters */}
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">Search</label>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Name or address"
            className="w-64 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">Type</label>
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
          <label className="text-xs font-medium text-gray-500">Status</label>
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
          <label className="text-xs font-medium text-gray-500">Generated from</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className={selectClass}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">Generated to</label>
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
            className="rounded-md px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-900"
          >
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-6 py-3">Venue</th>
              <th className="px-6 py-3">Type</th>
              <th className="px-6 py-3">Signal</th>
              <th className="px-6 py-3">Opened</th>
              <th className="px-6 py-3">
                <button
                  type="button"
                  onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
                  className="inline-flex items-center gap-1 font-medium uppercase tracking-wide text-gray-500 hover:text-gray-900"
                >
                  Generated
                  <span className="text-gray-400">
                    {sortDir === "asc" ? "▲" : "▼"}
                  </span>
                </button>
              </th>
              <th className="px-6 py-3">Sources</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {pageRows.map((lead) => (
              <tr key={lead.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <Link
                    href={`/dashboard/leads/${lead.id}`}
                    className="font-medium text-gray-900 hover:text-blue-700 hover:underline"
                  >
                    {lead.name}
                  </Link>
                  <div className="text-gray-500">
                    {lead.streetAddress}, {lead.city}, {lead.state}{" "}
                    {lead.postalCode}
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-700">
                  {VENUE_TYPE_LABELS[lead.type]}
                </td>
                <td className="px-6 py-4 text-gray-700">
                  {SIGNAL_LABELS[lead.signal]}
                </td>
                <td className="px-6 py-4 text-gray-700">
                  {formatDate(lead.openedDate)}
                </td>
                <td className="px-6 py-4 text-gray-700">
                  {formatDate(lead.discoveredAt)}
                </td>
                <td className="px-6 py-4 text-gray-700">{lead.sources.length}</td>
                <td className="px-6 py-4">
                  <StatusBadge status={lead.status} />
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    type="button"
                    onClick={() => onToggleArchived(lead.id)}
                    className="rounded-md border border-gray-300 px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  >
                    {view === "active" ? "Archive" : "Restore"}
                  </button>
                </td>
              </tr>
            ))}
            {pageRows.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-10 text-center text-gray-500">
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
      <div className="flex items-center justify-between text-sm text-gray-600">
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
            className="rounded-md border border-gray-300 px-3 py-1.5 font-medium disabled:cursor-not-allowed disabled:opacity-40 hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="text-gray-500">
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className="rounded-md border border-gray-300 px-3 py-1.5 font-medium disabled:cursor-not-allowed disabled:opacity-40 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
