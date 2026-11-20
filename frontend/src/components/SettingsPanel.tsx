"use client";

// The Settings screen. Just an Appearance section for now; new settings get
// their own card-style <section> below it. A Client Component because it sets
// the topbar title (same pattern as LeadsDashboard and AddLeadForm).

import { useEffect } from "react";
import Card from "./Card";
import { useDashboardHeader } from "./DashboardHeaderContext";
import ThemeToggle from "./ThemeToggle";

export default function SettingsPanel() {
  const { setTitle } = useDashboardHeader();

  useEffect(() => {
    setTitle("Settings");
    return () => setTitle("Active Leads");
  }, [setTitle]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card title="Appearance">
        <div className="flex items-center justify-between gap-6">
          <div>
            <p id="dark-mode-label" className="font-medium text-ink">
              Dark mode
            </p>
            <p className="mt-0.5 text-sm text-muted">
              Easier on the eyes at night. Saved in this browser.
            </p>
          </div>
          <ThemeToggle labelId="dark-mode-label" />
        </div>
      </Card>
    </div>
  );
}
