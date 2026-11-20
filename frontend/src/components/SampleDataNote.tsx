// A small, honest label for screens that still show made-up data, so nobody
// mistakes sample runs or leads for real activity. Delete its uses once the
// scraper is live.

import type { ReactNode } from "react";

export default function SampleDataNote({ children }: { children: ReactNode }) {
  return (
    <p className="inline-flex items-center gap-2 rounded-full bg-brand-tint px-3 py-1 text-xs font-medium text-link">
      <span aria-hidden>●</span>
      {children}
    </p>
  );
}
