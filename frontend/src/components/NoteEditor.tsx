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
        className="w-full rounded-2xl border border-stone-300 p-4 text-sm focus:border-magenta-400 focus:ring-2 focus:ring-magenta-100 focus:outline-none"
      />
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={!dirty}
          className="rounded-full bg-magenta-600 px-5 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40 hover:bg-magenta-700"
        >
          Save note
        </button>
        {dirty ? (
          <span className="text-xs text-amber-600">Unsaved changes</span>
        ) : (
          <span className="text-xs text-stone-400">
            Not yet persisted — saves to the database once the backend is wired
            up.
          </span>
        )}
      </div>
    </div>
  );
}
