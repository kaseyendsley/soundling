"use client";

// The editable venue note — the only interactive part of the detail page, so
// it's the only Client Component there. For now edits live in local state and
// reset on reload; persistence arrives when this saves to the backend API.

import { useState } from "react";

export default function NoteEditor({ initialNote }: { initialNote: string }) {
  const [note, setNote] = useState(initialNote);
  const [savedNote, setSavedNote] = useState(initialNote);

  const dirty = note !== savedNote;

  function handleSave() {
    // TODO: replace with a PATCH to the leads API once the backend exists.
    setSavedNote(note);
  }

  return (
    <div className="space-y-2">
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={4}
        placeholder="Add a note about this venue…"
        className="w-full rounded-md border border-gray-300 p-3 text-sm focus:border-gray-400 focus:outline-none"
      />
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={!dirty}
          className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40 hover:bg-gray-700"
        >
          Save note
        </button>
        {dirty ? (
          <span className="text-xs text-amber-600">Unsaved changes</span>
        ) : (
          <span className="text-xs text-gray-400">
            Not yet persisted — saves to the database once the backend is wired
            up.
          </span>
        )}
      </div>
    </div>
  );
}
