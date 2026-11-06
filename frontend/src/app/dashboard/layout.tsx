// Persistent chrome for every screen under /dashboard.
// Server Component (static structure). The nav links live in DashboardNav (a
// Client Component) so they can highlight the current page. Responsive: a
// sidebar on md+ screens collapses to a compact top nav bar on phones.

import DashboardNav from "@/components/DashboardNav";
import SidebarUser from "@/components/SidebarUser";
import {
  DashboardHeaderProvider,
  DashboardTitle,
} from "@/components/DashboardHeaderContext";

function Wordmark() {
  return (
    <span className="font-display text-2xl tracking-wide text-magenta-300">
      Soundling
    </span>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardHeaderProvider>
      <div className="flex min-h-screen flex-col bg-cream text-ink md:flex-row">
      {/* Sidebar — md and up */}
      {/* sticky + h-screen keeps the user block pinned to the bottom while the page scrolls */}
      <aside className="sticky top-0 hidden h-screen w-52 shrink-0 flex-col border-r border-plum-800 bg-plum-900 md:flex">
        {/* Same height as the desktop header so the wordmark lines up with the title */}
        <div className="flex h-[70px] items-center px-6">
          <Wordmark />
        </div>
        <DashboardNav variant="sidebar" />
        <div className="mt-auto">
          <SidebarUser variant="sidebar" />
        </div>
      </aside>

      {/* Mobile top bar — below md */}
      <header className="bg-plum-900 px-5 py-3 md:hidden">
        <div className="flex items-center justify-between">
          <Wordmark />
          <SidebarUser variant="compact" />
        </div>
        <DashboardNav variant="mobile" />
      </header>

      {/* Main column */}
      <div className="flex flex-1 flex-col">
        {/* Desktop header — sticky so it stays pinned while the page scrolls;
            z-10 keeps table content (e.g. the venue cells' link overlays)
            sliding *under* it rather than over it. */}
        <header className="sticky top-0 z-10 hidden h-[70px] items-center bg-plum-900 px-8 md:flex">
          <DashboardTitle />
        </header>
        <main className="flex-1 p-5 sm:p-8">{children}</main>
      </div>
      </div>
    </DashboardHeaderProvider>
  );
}
