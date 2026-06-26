"use client";

// Change a lead's status and (optionally) record a note explaining the move —
// one action, because that's how it actually works. Not wired to persistence
// yet: it previews the transition it *would* log. When the backend exists, the
// button will append a StatusChange (current → new, by the current user, now,
// with the note) and update the lead's status in the same write.

import { useState } from "react";
import { LEAD_STATUS_LABELS, type LeadStatus } from "@/lib/types";

export default function StatusControl({
  currentStatus,
}: {
  currentStatus: LeadStatus;
}) {
  const [status, setStatus] = useState<LeadStatus>(currentStatus);
  const [note, setNote] = useState("");

  const changed = status !== currentStatus;

  function handleUpdate() {
    // TODO: POST the status change to the leads API once the backend exists.
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor="status-select" className="text-sm text-gray-600">
          Status
        </label>
        <select
          id="status-select"
          value={status}
          onChange={(e) => setStatus(e.target.value as LeadStatus)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
        >
          {Object.entries(LEAD_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={3}
        placeholder="Add a note about this change (optional)…"
        className="w-full rounded-md border border-gray-300 p-3 text-sm focus:border-gray-400 focus:outline-none"
      />

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleUpdate}
          disabled={!changed}
          className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40 hover:bg-gray-700"
        >
          Update status
        </button>
        {changed ? (
          <span className="text-xs text-amber-600">
            Will log: {LEAD_STATUS_LABELS[currentStatus]} →{" "}
            {LEAD_STATUS_LABELS[status]} (not saved yet)
          </span>
        ) : (
          <span className="text-xs text-gray-400">
            Pick a new status to log an update — saves once the backend is wired
            up.
          </span>
        )}
      </div>
    </div>
  );
}
